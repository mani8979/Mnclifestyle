import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Collection } from '@/models/Collection';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { revalidateCatalogPaths, syncCategoryItemCounts } from '@/lib/category-cleanup';
import { cleanupSingletonColorGroup } from '@/lib/color-variants';

export const dynamic = 'force-dynamic';

function isValidProductIdFormat(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length < 3 || trimmed.length > 100) return false;
  if (['null', 'undefined', 'invalid', 'invalid-id'].includes(trimmed.toLowerCase())) return false;
  if (mongoose.Types.ObjectId.isValid(trimmed)) return true;
  return /^[a-zA-Z0-9][a-zA-Z0-9_\-\.]{1,99}$/.test(trimmed);
}

function getLookupQuery(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { _id: id };
  }
  return { $or: [{ legacyId: id }, { slug: id }, { sku: id.toUpperCase() }] };
}

/**
 * DELETE /api/admin/products/[id]/permanent
 * Dedicated endpoint to permanently delete a product (Active or Draft)
 * with mandatory confirmation phrase "DELETE <PRODUCT NAME>".
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    assertValidOrigin(request);
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const trimmedId = (id || '').trim();

    if (!isValidProductIdFormat(trimmedId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product identifier' },
        { status: 400 }
      );
    }

    const product = await Product.findOne(getLookupQuery(trimmedId));

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // 1. Validate mandatory confirmation phrase: "DELETE <EXACT PRODUCT NAME>"
    let body: any = null;
    try {
      body = await request.json();
    } catch {
      // body optional if passed via query
    }
    const { searchParams } = new URL(request.url);
    const submittedPhrase = (
      body?.confirmationPhrase ??
      body?.confirmationName ??
      searchParams.get('confirmationPhrase') ??
      searchParams.get('confirmationName') ??
      ''
    ).toString().trim();

    const expectedPhrase = `DELETE ${product.name.trim()}`;
    const isValidMatch =
      submittedPhrase.toUpperCase() === expectedPhrase.toUpperCase() ||
      submittedPhrase.toUpperCase() === product.name.trim().toUpperCase();

    if (!isValidMatch) {
      return NextResponse.json(
        {
          success: false,
          message: `Confirmation phrase does not match. Expected: "${expectedPhrase}".`,
        },
        { status: 400 }
      );
    }

    // 2. Atomic deletion
    const deletedProduct = await Product.findOneAndDelete({
      _id: product._id,
    });

    if (!deletedProduct) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product could not be deleted or was already removed by another session.',
        },
        { status: 409 }
      );
    }

    // 3. Prune dangling references from collections (collections themselves preserved)
    const refKeys = [
      deletedProduct._id.toString(),
      deletedProduct.legacyId,
      deletedProduct.slug,
      deletedProduct.sku,
    ].filter(Boolean);

    if (refKeys.length > 0) {
      await Collection.updateMany(
        {},
        { $pull: { featuredProductIds: { $in: refKeys } } }
      );
    }

    // 4. Clean up singleton color variant group if orphaned
    let cleanedGroupSlugs: string[] = [];
    if (deletedProduct.colorGroupId) {
      cleanedGroupSlugs = await cleanupSingletonColorGroup(deletedProduct.colorGroupId);
    }

    // 5. Automatically sync category item counts (categories preserved)
    await syncCategoryItemCounts();

    // 6. Revalidate storefront & admin caches
    revalidateCatalogPaths(
      [deletedProduct.category],
      [deletedProduct.slug, ...cleanedGroupSlugs]
    );

    return NextResponse.json({
      success: true,
      message: `Product "${deletedProduct.name}" permanently deleted.`,
      deletedProduct: {
        id: deletedProduct._id.toString(),
        name: deletedProduct.name,
        sku: deletedProduct.sku,
      },
    });
  } catch (error) {
    return handleApiError(error, 'Failed to permanently delete product', '[Admin Product Permanent DELETE Error]');
  }
}
