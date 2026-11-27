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

type BulkActionType = 'archive' | 'draft' | 'publish';

/**
 * POST /api/admin/products/bulk-status
 * Safely updates publication and archival status for selected products.
 * Supported actions:
 *  - 'archive': Sets isArchived=true, isActive=false for active or draft products.
 *  - 'draft': Sets isActive=false, isArchived=false for active products.
 *  - 'publish': Sets isActive=true, isArchived=false for draft products.
 *
 * Strict backend safeguards:
 *  - Requires authenticated admin session and valid origin.
 *  - Rejects if any product ID is missing, malformed, or does not exist (all-or-nothing).
 *  - Rejects if any product status is ineligible for the requested action (all-or-nothing).
 *  - Never allows permanent deletion through this endpoint.
 *  - Prunes collection references when archiving or moving to draft.
 *  - Cleans singleton color groups if orphaned when archiving.
 *  - Preserves historical InventoryMovement records, categories, and Cloudinary images.
 *  - Automatically syncs category item counts and revalidates Next.js caches.
 */
export async function POST(request: NextRequest) {
  try {
    assertValidOrigin(request);
    await requireAdminSession(undefined, request);
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

    // Maximum batch size guard (100 products)
    if (uniqueIds.length > 100) {
      return NextResponse.json(
        { success: false, message: 'Cannot bulk update more than 100 products in a single operation.' },
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

    // 2. Validate action
    const action: BulkActionType = body.action;
    const allowedActions: BulkActionType[] = ['archive', 'draft', 'publish'];
    if (!action || !allowedActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid action "${action}". Allowed bulk actions: ${allowedActions.join(', ')}.`,
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
          message: `Bulk ${action} aborted: ${missingIds.length} product(s) do not exist: [${missingIds.join(', ')}]. No products were modified.`,
        },
        { status: 404 }
      );
    }

    // 5. Enforce Action-Specific Status Eligibility (Strict All-or-Nothing)
    const affectedCategories = new Set<string>();
    const affectedSlugs = new Set<string>();
    const allRefs: string[] = [];
    const colorGroupIdsToClean = new Set<string>();

    for (const p of foundProducts as any[]) {
      if (p.category) affectedCategories.add(p.category);
      if (p.slug) affectedSlugs.add(p.slug);
      allRefs.push(p._id.toString());
      if (p.legacyId) allRefs.push(p.legacyId);
      if (p.slug) allRefs.push(p.slug);
      if (p.sku) allRefs.push(p.sku);
      if (p.colorGroupId) colorGroupIdsToClean.add(p.colorGroupId);
    }

    let updateFields: Record<string, any> = {};
    let successMessage = '';

    if (action === 'archive') {
      // Products must not already be archived
      const alreadyArchived = (foundProducts as any[]).filter((p) => p.isArchived);
      if (alreadyArchived.length > 0) {
        const names = alreadyArchived.map((p) => `"${p.name}" (${p.sku || p._id})`);
        return NextResponse.json(
          {
            success: false,
            message: `Bulk archiving aborted: ${alreadyArchived.length} product(s) are already archived: [${names.join(', ')}]. No products were modified.`,
          },
          { status: 409 }
        );
      }

      updateFields = { isArchived: true, isActive: false };
      successMessage = `Successfully archived ${uniqueIds.length} ${uniqueIds.length === 1 ? 'product' : 'products'}.`;
    } else if (action === 'draft') {
      // Archived products cannot be drafted directly without unarchiving/restoring
      const archivedProducts = (foundProducts as any[]).filter((p) => p.isArchived);
      if (archivedProducts.length > 0) {
        const names = archivedProducts.map((p) => `"${p.name}" (${p.sku || p._id})`);
        return NextResponse.json(
          {
            success: false,
            message: `Bulk move to draft aborted: ${archivedProducts.length} product(s) are archived: [${names.join(', ')}]. Archived products must be restored first before drafting. No products were modified.`,
          },
          { status: 409 }
        );
      }

      // Check if all selected products are already in draft status
      const alreadyDraft = (foundProducts as any[]).filter((p) => !p.isActive && !p.isArchived);
      if (alreadyDraft.length === foundProducts.length) {
        return NextResponse.json(
          {
            success: false,
            message: `All selected products are already in Draft status. No changes needed.`,
          },
          { status: 400 }
        );
      }

      updateFields = { isActive: false, isArchived: false };
      successMessage = `Successfully moved ${uniqueIds.length} ${uniqueIds.length === 1 ? 'product' : 'products'} to Draft.`;
    } else if (action === 'publish') {
      // Archived products cannot be published directly without restoring
      const archivedProducts = (foundProducts as any[]).filter((p) => p.isArchived);
      if (archivedProducts.length > 0) {
        const names = archivedProducts.map((p) => `"${p.name}" (${p.sku || p._id})`);
        return NextResponse.json(
          {
            success: false,
            message: `Bulk publish aborted: ${archivedProducts.length} product(s) are archived: [${names.join(', ')}]. Archived products must be restored first before publishing. No products were modified.`,
          },
          { status: 409 }
        );
      }

      // Check if all selected products are already published
      const alreadyPublished = (foundProducts as any[]).filter((p) => p.isActive && !p.isArchived);
      if (alreadyPublished.length === foundProducts.length) {
        return NextResponse.json(
          {
            success: false,
            message: `All selected products are already Published. No changes needed.`,
          },
          { status: 400 }
        );
      }

      updateFields = { isActive: true, isArchived: false };
      successMessage = `Successfully published ${uniqueIds.length} ${uniqueIds.length === 1 ? 'product' : 'products'}.`;
    }

    // 6. Perform Atomic Multi-Document Update
    const updateResult = await Product.updateMany(
      { _id: { $in: objectIds } },
      { $set: updateFields }
    );

    // 7. Prune collections if products were archived or moved to draft
    if ((action === 'archive' || action === 'draft') && allRefs.length > 0) {
      await Collection.updateMany(
        { featuredProductIds: { $in: allRefs } },
        { $pull: { featuredProductIds: { $in: allRefs } } }
      );
    }

    // 8. Clean up singleton color groups if products were archived
    if (action === 'archive' && colorGroupIdsToClean.size > 0) {
      for (const groupId of Array.from(colorGroupIdsToClean)) {
        const cleaned = await cleanupSingletonColorGroup(groupId);
        cleaned.forEach((s) => affectedSlugs.add(s));
      }
    }

    // 9. Sync Category item counts
    await syncCategoryItemCounts();

    // 10. Revalidate catalog paths
    revalidateCatalogPaths(
      Array.from(affectedCategories),
      Array.from(affectedSlugs)
    );

    return NextResponse.json({
      success: true,
      message: successMessage,
      action,
      count: updateResult.modifiedCount,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to process bulk product status update', '[Bulk Status API Error]');
  }
}
