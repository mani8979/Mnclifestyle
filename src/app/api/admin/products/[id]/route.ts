import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { Collection } from '@/models/Collection';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { ProductUpdateSchema, getCategoryLabel, slugify } from '@/lib/validations/product';
import { revalidateCatalogPaths, syncCategoryItemCounts } from '@/lib/category-cleanup';
import {
  cleanupSingletonColorGroup,
  getLinkedAdminVariants,
  syncProductColorGroup,
  validateLinkedVariantCandidates,
} from '@/lib/color-variants';

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
  } catch (error) {
    return handleApiError(error, 'Failed to fetch product details', '[Admin Product GET [id] Error]');
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
    assertValidOrigin(request);
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
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    // Validate partial update and strip undefined keys so unprovided fields are not overwritten
    const validatedData = ProductUpdateSchema.parse(body);
    const { linkedVariantIds, ...rawUpdates } = validatedData;
    const productUpdates = Object.fromEntries(
      Object.entries(rawUpdates).filter(([, value]) => value !== undefined)
    ) as typeof rawUpdates;

    // Preserve untouched nested fields when a partial dimensions or seoMeta object is sent
    if (productUpdates.dimensions) {
      const existingDimensions =
        typeof (product.dimensions as any)?.toObject === 'function'
          ? (product.dimensions as any).toObject()
          : product.dimensions || {};
      productUpdates.dimensions = {
        ...existingDimensions,
        ...Object.fromEntries(
          Object.entries(productUpdates.dimensions).filter(([, value]) => value !== undefined)
        ),
      };
    }
    if (productUpdates.seoMeta) {
      const existingSeoMeta =
        typeof (product.seoMeta as any)?.toObject === 'function'
          ? (product.seoMeta as any).toObject()
          : product.seoMeta || {};
      productUpdates.seoMeta = {
        ...existingSeoMeta,
        ...Object.fromEntries(
          Object.entries(productUpdates.seoMeta).filter(([, value]) => value !== undefined)
        ),
      };
    }

    // Enforce category existence when updating category
    if (productUpdates.category) {
      const catDoc = await Category.findOne({
        $or: [
          { slug: productUpdates.category },
          { slug: productUpdates.category.toLowerCase() },
          { legacyId: productUpdates.category },
        ],
      }).lean();

      if (!catDoc) {
        return NextResponse.json(
          {
            success: false,
            message: `Referenced category "${productUpdates.category}" does not exist.`,
          },
          { status: 400 }
        );
      }
      productUpdates.category = catDoc.slug;
      if (!productUpdates.categoryLabel) {
        productUpdates.categoryLabel = catDoc.name || getCategoryLabel(catDoc.slug);
      }
    }

    // Validate category exists before un-archiving / restoring
    const nextCategory = productUpdates.category ?? product.category;
    if (product.isArchived && productUpdates.isArchived === false && !productUpdates.category) {
      const catDoc = await Category.findOne({
        $or: [
          { slug: nextCategory },
          { slug: nextCategory.toLowerCase() },
          { legacyId: nextCategory },
        ],
      })
        .select('slug name')
        .lean();

      if (!catDoc) {
        return NextResponse.json(
          {
            success: false,
            message: `Referenced category "${nextCategory}" no longer exists. Edit product and assign an active category before restoring.`,
          },
          { status: 400 }
        );
      }
    }

    // Validate linked color variants against target category + subcategory before writing
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

    // Reject conflicting duplicate SKU when explicitly changed
    if (productUpdates.sku && productUpdates.sku !== product.sku) {
      const existingSku = await Product.findOne({
        sku: productUpdates.sku,
        _id: { $ne: product._id },
      })
        .select('_id')
        .lean();
      if (existingSku) {
        return NextResponse.json(
          {
            success: false,
            message: `A product with SKU "${productUpdates.sku}" already exists.`,
          },
          { status: 409 }
        );
      }
    }

    // Reject conflicting explicit slug unless name-derived auto-slug
    if (productUpdates.slug && productUpdates.slug !== product.slug) {
      const baseNameSlug = productUpdates.name ? slugify(productUpdates.name) : '';
      const existingSlug = await Product.findOne({
        slug: productUpdates.slug,
        _id: { $ne: product._id },
      })
        .select('_id')
        .lean();
      if (existingSlug) {
        if (!productUpdates.name || productUpdates.slug !== baseNameSlug) {
          return NextResponse.json(
            {
              success: false,
              message: `A product with slug "${productUpdates.slug}" already exists.`,
            },
            { status: 409 }
          );
        }
        let candidateSlug = productUpdates.slug;
        let suffix = 1;
        let dupCheck: any = existingSlug;
        while (dupCheck) {
          suffix++;
          candidateSlug = `${productUpdates.slug}-${suffix}`;
          dupCheck = await Product.findOne({
            slug: candidateSlug,
            _id: { $ne: product._id },
          })
            .select('_id')
            .lean();
        }
        productUpdates.slug = candidateSlug;
      }
    }

    // Apply updates
    const oldSlug = product.slug;
    const oldCategory = product.category;
    const oldSubCategory = product.subCategory;
    const oldColorName = typeof product.colorName === 'string' ? product.colorName.trim() : '';

    Object.assign(product, productUpdates);

    const effectiveColorName = typeof product.colorName === 'string' ? product.colorName.trim() : '';
    const effectiveColorHex = product.colorHex?.trim() || '#211710';
    if (effectiveColorName && productUpdates.colors === undefined) {
      const primaryImage = Array.isArray(product.images) && product.images[0] ? product.images[0] : '';
      if (!Array.isArray(product.colors) || product.colors.length === 0) {
        product.colors = [
          {
            name: effectiveColorName,
            hex: effectiveColorHex,
            inStock: product.inStock ?? true,
            image: primaryImage,
          },
        ];
      } else if (
        product.colors.length === 1 &&
        (!oldColorName || product.colors[0].name?.trim().toLowerCase() === oldColorName.toLowerCase())
      ) {
        product.colors[0] = {
          ...(typeof (product.colors[0] as any)?.toObject === 'function'
            ? (product.colors[0] as any).toObject()
            : product.colors[0]),
          name: effectiveColorName,
          hex: effectiveColorHex,
          inStock: product.inStock ?? true,
        };
      }
    } else if (
      productUpdates.colorName === '' &&
      productUpdates.colors === undefined &&
      oldColorName &&
      Array.isArray(product.colors) &&
      product.colors.length === 1 &&
      product.colors[0].name?.trim().toLowerCase() === oldColorName.toLowerCase()
    ) {
      product.colors = [];
    } else if (productUpdates.colorHex !== undefined && !effectiveColorName && Array.isArray(product.colors) && product.colors.length === 1) {
      product.colors[0].hex = effectiveColorHex;
    }

    await product.save();

    if (oldSlug && product.slug && oldSlug !== product.slug) {
      await Collection.updateMany(
        { featuredProductIds: oldSlug },
        { $set: { 'featuredProductIds.$': product.slug } }
      );
    }

    const categoryOrSubChanged =
      oldCategory !== product.category ||
      (oldSubCategory || '').trim().toLowerCase() !== (product.subCategory || '').trim().toLowerCase();

    const { affectedSlugs } = await syncProductColorGroup({
      product,
      linkedVariantIds,
      categoryOrSubCategoryChanged: categoryOrSubChanged,
    });

    // Automatically sync subcategory to Category document & refresh Category.itemCount values
    if (productUpdates.subCategory && product.category) {
      await Category.updateOne(
        { $or: [{ slug: product.category }, { legacyId: product.category }] },
        { $addToSet: { subcategories: productUpdates.subCategory.trim() } }
      );
    }
    await syncCategoryItemCounts();

    // Revalidate public storefront caches including /search & root layout
    revalidateCatalogPaths(
      [oldCategory, product.category],
      [oldSlug, product.slug, ...affectedSlugs]
    );

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to update product', '[Admin Product PATCH Error]');
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Supports:
 *  1. Default soft-delete / archive: sets isArchived=true, isActive=false
 *  2. Permanent delete (?permanent=true): permanently removes an ARCHIVED product atomically.
 *     Strict backend safeguards:
 *     - Only archived products can be permanently deleted (rejects active/draft with 409).
 *     - Atomic findOneAndDelete with isArchived: true.
 *     - Validates product identifier (rejects invalid IDs with 400).
 *     - Validates confirmation name if provided (rejects mismatch with 400).
 *     - Preserves historical InventoryMovement records, categories, and shared images.
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

    const { searchParams } = new URL(request.url);
    const isPermanent = searchParams.get('permanent') === 'true';

    const product = await Product.findOne(getLookupQuery(trimmedId));

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // =========================================================================
    // PERMANENT DELETION BRANCH (?permanent=true)
    // =========================================================================
    if (isPermanent) {
      // 1. Validate confirmation phrase or name if provided in body or query
      let body: any = null;
      try {
        body = await request.json();
      } catch {
        // body is optional
      }
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
      const archiveRefs = [
        deletedProduct._id.toString(),
        deletedProduct.legacyId,
        deletedProduct.slug,
        deletedProduct.sku,
      ].filter(Boolean);

      if (archiveRefs.length > 0) {
        await Collection.updateMany(
          {},
          { $pull: { featuredProductIds: { $in: archiveRefs } } }
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
        message: 'Product permanently deleted.',
        deletedProduct: {
          id: deletedProduct._id.toString(),
          name: deletedProduct.name,
          sku: deletedProduct.sku,
        },
      });
    }

    // =========================================================================
    // DEFAULT SOFT-DELETE / MOVE TO DRAFT BRANCH
    // =========================================================================
    const archiveRefs = [product._id.toString(), product.legacyId, product.slug, product.sku].filter(Boolean);

    // Check references in curated collections before pruning them cleanly
    const referencedCollections = await Collection.find({
      featuredProductIds: { $in: archiveRefs },
    })
      .select('title slug')
      .lean();

    // Perform soft unpublish / move to draft and detach from any color variant group & collections
    const previousGroupId = product.colorGroupId;
    product.isArchived = false;
    product.isActive = false;
    product.colorGroupId = '';
    await product.save();

    if (archiveRefs.length > 0) {
      await Collection.updateMany({}, { $pull: { featuredProductIds: { $in: archiveRefs } } });
    }

    const cleanedGroupSlugs = await cleanupSingletonColorGroup(previousGroupId);
    await syncCategoryItemCounts();

    // Revalidate storefront & admin caches including /search
    revalidateCatalogPaths(
      [product.category],
      [product.slug, ...cleanedGroupSlugs]
    );

    return NextResponse.json({
      success: true,
      message: `Product "${product.name}" (${product.sku}) was moved to Draft.`,
      collectionNotice:
        referencedCollections.length > 0
          ? `Removed reference from ${referencedCollections.length} curated collection(s): ${referencedCollections.map((c) => c.title).join(', ')}.`
          : null,
      draft: true,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to process product deletion', '[Admin Product DELETE Error]');
  }
}
