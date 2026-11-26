import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { Collection } from '@/models/Collection';
import { requireAdminSession } from '@/lib/auth';
import { ProductUpdateSchema, getCategoryLabel, slugify } from '@/lib/validations/product';
import {
  ColorVariantValidationError,
  cleanupSingletonColorGroup,
  getLinkedAdminVariants,
  syncProductColorGroup,
  validateLinkedVariantCandidates,
} from '@/lib/color-variants';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

function getLookupQuery(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { _id: id };
  }
  return { $or: [{ legacyId: id }, { slug: id }, { sku: id.toUpperCase() }] };
}

/**
 * GET /api/admin/products/[id]
 * Fetch a single product for editing or preview.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const product = await Product.findOne(getLookupQuery(id)).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const linkedVariants = await getLinkedAdminVariants(product);

    return NextResponse.json({ success: true, product, linkedVariants });
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('[Admin Product GET [id] Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/products/[id]
 * Update an existing product.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const product = await Product.findOne(getLookupQuery(id));

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    // Validate partial update
    const validatedData = ProductUpdateSchema.parse(body);
    const { linkedVariantIds, ...productUpdates } = validatedData;

    // If updating category, keep categoryLabel in sync
    if (productUpdates.category && !productUpdates.categoryLabel) {
      const catDoc = await Category.findOne({
        $or: [{ slug: productUpdates.category }, { legacyId: productUpdates.category }],
      }).lean();
      productUpdates.categoryLabel = catDoc?.name || getCategoryLabel(productUpdates.category);
    }

    // Validate linked color variants against target category + subcategory before writing
    const nextCategory = productUpdates.category ?? product.category;
    const nextSubCategory = productUpdates.subCategory ?? product.subCategory;
    if (Array.isArray(linkedVariantIds) && linkedVariantIds.length > 0) {
      await validateLinkedVariantCandidates({
        linkedVariantIds,
        category: nextCategory,
        subCategory: nextSubCategory,
        excludeProductId: product._id.toString(),
      });
    }

    // If updating name and slug not explicitly provided, update slug
    if (productUpdates.name && !productUpdates.slug) {
      let candidateSlug = slugify(productUpdates.name);
      let suffix = 1;
      let existingSlug = await Product.findOne({
        slug: candidateSlug,
        _id: { $ne: product._id },
      });
      while (existingSlug) {
        suffix++;
        candidateSlug = `${slugify(productUpdates.name)}-${suffix}`;
        existingSlug = await Product.findOne({
          slug: candidateSlug,
          _id: { $ne: product._id },
        });
      }
      productUpdates.slug = candidateSlug;
    }

    // Check and auto-resolve duplicate SKU if changed
    if (productUpdates.sku && productUpdates.sku !== product.sku) {
      let candidateSku = productUpdates.sku;
      let existingSku = await Product.findOne({
        sku: candidateSku,
        _id: { $ne: product._id },
      });
      if (existingSku) {
        candidateSku = `${candidateSku}-${Math.floor(100 + Math.random() * 900)}`;
        productUpdates.sku = candidateSku;
      }
    }

    // Check and auto-resolve duplicate Slug if changed
    if (productUpdates.slug && productUpdates.slug !== product.slug) {
      let candidateSlug = productUpdates.slug;
      let suffix = 1;
      let existingSlug = await Product.findOne({
        slug: candidateSlug,
        _id: { $ne: product._id },
      });
      while (existingSlug) {
        suffix++;
        candidateSlug = `${productUpdates.slug}-${suffix}`;
        existingSlug = await Product.findOne({
          slug: candidateSlug,
          _id: { $ne: product._id },
        });
      }
      productUpdates.slug = candidateSlug;
    }

    // Apply updates
    const oldSlug = product.slug;
    const oldCategory = product.category;
    const oldSubCategory = product.subCategory;

    Object.assign(product, productUpdates);

    const effectiveColorName = typeof product.colorName === 'string' ? product.colorName.trim() : '';
    if (effectiveColorName && (!product.colors || product.colors.length === 0)) {
      product.colors = [
        {
          name: effectiveColorName,
          hex: product.colorHex?.trim() || '#211710',
          inStock: product.inStock ?? true,
        },
      ];
    }

    await product.save();

    const categoryOrSubChanged =
      oldCategory !== product.category ||
      (oldSubCategory || '').trim().toLowerCase() !== (product.subCategory || '').trim().toLowerCase();

    const { affectedSlugs } = await syncProductColorGroup({
      product,
      linkedVariantIds,
      categoryOrSubCategoryChanged: categoryOrSubChanged,
    });

    // Automatically sync subcategory to Category document in MongoDB
    if (productUpdates.subCategory && product.category) {
      await Category.updateOne(
        { $or: [{ slug: product.category }, { legacyId: product.category }] },
        { $addToSet: { subcategories: productUpdates.subCategory.trim() } }
      );
    }

    // Revalidate public storefront caches
    try {
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/collections');
      revalidatePath('/admin/products');
      revalidatePath('/admin/categories');
      revalidatePath('/admin/inventory');
      revalidatePath(`/category/${oldCategory}`);
      revalidatePath(`/category/${product.category}`);
      revalidatePath(`/product/${oldSlug}`);
      revalidatePath(`/product/${product.slug}`);
      for (const relSlug of affectedSlugs) {
        revalidatePath(`/product/${relSlug}`);
      }
    } catch (e) {
      // Revalidation warning non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ColorVariantValidationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    if (error instanceof ZodError) {
      const issues = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      return NextResponse.json(
        { success: false, message: `Validation failed: ${issues}` },
        { status: 400 }
      );
    }
    console.error('[Admin Product PATCH Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Soft-delete / archive a product safely.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const product = await Product.findOne(getLookupQuery(id));

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Check references in curated collections
    const referencedCollections = await Collection.find({
      featuredProductIds: {
        $in: [product._id.toString(), product.legacyId, product.slug],
      },
    }).select('title slug').lean();

    // Perform soft deletion / archive and detach from any color variant group
    const previousGroupId = product.colorGroupId;
    product.isArchived = true;
    product.isActive = false;
    product.colorGroupId = '';
    await product.save();

    const cleanedGroupSlugs = await cleanupSingletonColorGroup(previousGroupId);

    // Revalidate storefront cache
    try {
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath(`/category/${product.category}`);
      revalidatePath(`/product/${product.slug}`);
      revalidatePath('/collections');
      for (const relSlug of cleanedGroupSlugs) {
        revalidatePath(`/product/${relSlug}`);
      }
    } catch (e) {
      // Revalidation warning non-blocking
    }

    return NextResponse.json({
      success: true,
      message: `Product "${product.name}" (${product.sku}) was archived successfully.`,
      collectionNotice:
        referencedCollections.length > 0
          ? `Note: This product is referenced in ${referencedCollections.length} curated collection(s): ${referencedCollections.map((c) => c.title).join(', ')}.`
          : null,
      archived: true,
    });
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('[Admin Product DELETE Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to archive product' },
      { status: 500 }
    );
  }
}
