import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { Collection } from '@/models/Collection';
import { requireAdminSession } from '@/lib/auth';
import { ProductUpdateSchema, getCategoryLabel, slugify } from '@/lib/validations/product';
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

    return NextResponse.json({ success: true, product });
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

    // If updating category, keep categoryLabel in sync
    if (validatedData.category && !validatedData.categoryLabel) {
      const catDoc = await Category.findOne({
        $or: [{ slug: validatedData.category }, { legacyId: validatedData.category }],
      }).lean();
      validatedData.categoryLabel = catDoc?.name || getCategoryLabel(validatedData.category);
    }

    // If updating name and slug not explicitly provided, update slug
    if (validatedData.name && !validatedData.slug) {
      let candidateSlug = slugify(validatedData.name);
      let suffix = 1;
      let existingSlug = await Product.findOne({
        slug: candidateSlug,
        _id: { $ne: product._id },
      });
      while (existingSlug) {
        suffix++;
        candidateSlug = `${slugify(validatedData.name)}-${suffix}`;
        existingSlug = await Product.findOne({
          slug: candidateSlug,
          _id: { $ne: product._id },
        });
      }
      validatedData.slug = candidateSlug;
    }

    // Check and auto-resolve duplicate SKU if changed
    if (validatedData.sku && validatedData.sku !== product.sku) {
      let candidateSku = validatedData.sku;
      let existingSku = await Product.findOne({
        sku: candidateSku,
        _id: { $ne: product._id },
      });
      if (existingSku) {
        candidateSku = `${candidateSku}-${Math.floor(100 + Math.random() * 900)}`;
        validatedData.sku = candidateSku;
      }
    }

    // Check and auto-resolve duplicate Slug if changed
    if (validatedData.slug && validatedData.slug !== product.slug) {
      let candidateSlug = validatedData.slug;
      let suffix = 1;
      let existingSlug = await Product.findOne({
        slug: candidateSlug,
        _id: { $ne: product._id },
      });
      while (existingSlug) {
        suffix++;
        candidateSlug = `${validatedData.slug}-${suffix}`;
        existingSlug = await Product.findOne({
          slug: candidateSlug,
          _id: { $ne: product._id },
        });
      }
      validatedData.slug = candidateSlug;
    }

    // Apply updates
    const oldSlug = product.slug;
    const oldCategory = product.category;

    Object.assign(product, validatedData);
    await product.save();

    // Automatically sync subcategory to Category document in MongoDB
    if (validatedData.subCategory && product.category) {
      await Category.updateOne(
        { $or: [{ slug: product.category }, { legacyId: product.category }] },
        { $addToSet: { subcategories: validatedData.subCategory.trim() } }
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

    // Perform soft deletion / archive
    product.isArchived = true;
    product.isActive = false;
    await product.save();

    // Revalidate storefront cache
    try {
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath(`/category/${product.category}`);
      revalidatePath(`/product/${product.slug}`);
      revalidatePath('/collections');
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
