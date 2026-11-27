import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Collection } from '@/models/Collection';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import {
  syncCategoryItemCounts,
  revalidateCatalogPaths,
} from '@/lib/category-cleanup';
import { cleanupSingletonColorGroup } from '@/lib/color-variants';

export const dynamic = 'force-dynamic';

/**
 * Common handler for bulk permanent deletion of archived products.
 * Requires authenticated admin, validates all IDs, checks existence,
 * strictly enforces that EVERY product is archived (all-or-nothing),
 * checks the confirmation phrase, atomically deletes, prunes collection refs,
 * cleans singleton color groups, syncs category counts, and revalidates cache.
 */
async function handleBulkPermanentDelete(request: NextRequest) {
  try {
    await requireAdminSession(undefined, request);
    assertValidOrigin(request);
    await connectDB();

    let body: any = null;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    // 1. Validate ids array
    if (!body || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product IDs array (ids) is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const rawIds: any[] = body.ids;
    const stringIds: string[] = rawIds.map((id) => (typeof id === 'string' ? id.trim() : '')).filter(Boolean);

    if (stringIds.length !== rawIds.length) {
      return NextResponse.json(
        { success: false, message: 'All product IDs must be non-empty strings.' },
        { status: 400 }
      );
    }

    // Check for duplicate IDs in request
    const uniqueIds = Array.from(new Set(stringIds));
    if (uniqueIds.length !== stringIds.length) {
      return NextResponse.json(
        { success: false, message: 'Duplicate product IDs detected in request.' },
        { status: 400 }
      );
    }

    // Maximum batch size guard
    if (uniqueIds.length > 100) {
      return NextResponse.json(
        { success: false, message: 'Cannot bulk delete more than 100 products in a single operation.' },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format for every ID
    for (const id of uniqueIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: `Invalid product ID format: "${id}".` },
          { status: 400 }
        );
      }
    }

    // 2. Validate confirmation phrase
    // Expected: "DELETE <count> PRODUCTS" (or "DELETE 1 PRODUCT")
    const count = uniqueIds.length;
    const expectedPhrase = `DELETE ${count} PRODUCT${count > 1 ? 'S' : ''}`;
    const validPhrases = [
      expectedPhrase,
      `DELETE ${count} PRODUCTS`,
      `DELETE ${count} PRODUCT`,
    ];

    const submittedPhrase =
      typeof body.confirmationPhrase === 'string'
        ? body.confirmationPhrase.trim().toUpperCase()
        : '';

    if (!submittedPhrase || !validPhrases.includes(submittedPhrase)) {
      return NextResponse.json(
        {
          success: false,
          message: `Confirmation phrase does not match. Expected: "${expectedPhrase}".`,
        },
        { status: 400 }
      );
    }

    // 3. Fetch candidate products from database
    const objectIds = uniqueIds.map((id) => new mongoose.Types.ObjectId(id));
    const foundProducts = await Product.find({ _id: { $in: objectIds } }).lean();

    // 4. Verify that EVERY requested product exists (Strict All-or-Nothing)
    if (foundProducts.length !== objectIds.length) {
      const foundIdSet = new Set(foundProducts.map((p: any) => p._id.toString()));
      const missingIds = uniqueIds.filter((id) => !foundIdSet.has(id));
      return NextResponse.json(
        {
          success: false,
          message: `Bulk deletion aborted: ${missingIds.length} product(s) do not exist or were already removed: [${missingIds.join(', ')}]. No products were deleted.`,
        },
        { status: 404 }
      );
    }

    // 5. Verify that EVERY product is currently ARCHIVED (isArchived === true)
    // NEVER allow deletion of active or draft products (Strict All-or-Nothing)
    const ineligibleProducts = foundProducts.filter((p: any) => !p.isArchived);
    if (ineligibleProducts.length > 0) {
      const names = ineligibleProducts.map((p: any) => `"${p.name}" (${p.sku || p._id})`);
      return NextResponse.json(
        {
          success: false,
          message: `Bulk deletion aborted: ${ineligibleProducts.length} product(s) are active or draft and cannot be permanently deleted: [${names.join(', ')}]. Only archived products can be permanently deleted. No products were deleted.`,
        },
        { status: 409 }
      );
    }

    // 6. Atomic deletion of verified archived products
    const deleteResult = await Product.deleteMany({
      _id: { $in: objectIds },
      isArchived: true,
    });

    if (!deleteResult || deleteResult.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No products were deleted. They may have already been removed by another session.',
        },
        { status: 409 }
      );
    }

    // 7. Cascading cleanup for references (Audit & Related Data Protected):
    // - NEVER delete InventoryMovement
    // - NEVER delete Category or Collection
    // - NEVER delete Cloudinary images
    const allRefs: string[] = [];
    const affectedCategories = new Set<string>();
    const affectedSlugs = new Set<string>();
    const affectedGroupIds = new Set<string>();

    for (const p of foundProducts as any[]) {
      if (p._id) allRefs.push(p._id.toString());
      if (p.legacyId) allRefs.push(p.legacyId);
      if (p.slug) {
        allRefs.push(p.slug);
        affectedSlugs.add(p.slug);
      }
      if (p.sku) allRefs.push(p.sku);
      if (p.category) affectedCategories.add(p.category);
      if (p.colorGroupId) affectedGroupIds.add(p.colorGroupId);
    }

    // Prune references in collections (collections themselves are never deleted)
    if (allRefs.length > 0) {
      await Collection.updateMany(
        {},
        { $pull: { featuredProductIds: { $in: allRefs } } }
      );
    }

    // Clean up singleton color groups if left with only 1 member
    for (const gid of affectedGroupIds) {
      const cleanedSlugs = await cleanupSingletonColorGroup(gid);
      for (const s of cleanedSlugs) affectedSlugs.add(s);
    }

    // Synchronize category item counts
    await syncCategoryItemCounts();

    // Revalidate public catalog and admin routes
    revalidateCatalogPaths(Array.from(affectedCategories), Array.from(affectedSlugs));

    return NextResponse.json({
      success: true,
      message: `Successfully permanently deleted ${deleteResult.deletedCount} archived product(s).`,
      deletedCount: deleteResult.deletedCount,
      deletedIds: uniqueIds,
    });
  } catch (error) {
    return handleApiError(
      error,
      'Failed to execute bulk permanent deletion',
      '[Admin Product Bulk Permanent Delete Error]'
    );
  }
}

export async function POST(request: NextRequest) {
  return handleBulkPermanentDelete(request);
}

export async function DELETE(request: NextRequest) {
  return handleBulkPermanentDelete(request);
}
