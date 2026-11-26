import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { ProductInputSchema, getCategoryLabel, slugify } from '@/lib/validations/product';
import { escapeRegex, revalidateCatalogPaths, syncCategoryItemCounts } from '@/lib/category-cleanup';
import {
  ColorVariantValidationError,
  getCategoryKeySet,
  syncProductColorGroup,
  validateLinkedVariantCandidates,
} from '@/lib/color-variants';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/products
 * Fetch products with search, filtering, sorting, and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || 'all';
    const subCategory = searchParams.get('subCategory')?.trim() || '';
    const excludeId = searchParams.get('excludeId')?.trim() || '';
    const status = searchParams.get('status')?.trim() || 'all'; // all, published, draft
    const stock = searchParams.get('stock')?.trim() || 'all'; // all, in-stock, out-of-stock
    const sort = searchParams.get('sort')?.trim() || 'updated-desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));

    const andConditions: any[] = [];

    // Search filter (matches name, SKU, legacyId, or colorName)
    if (search) {
      const safeSearch = escapeRegex(search);
      andConditions.push({
        $or: [
          { name: { $regex: safeSearch, $options: 'i' } },
          { sku: { $regex: safeSearch, $options: 'i' } },
          { legacyId: { $regex: safeSearch, $options: 'i' } },
          { colorName: { $regex: safeSearch, $options: 'i' } },
        ],
      });
    }

    // Category filter (supports slug, legacyId, or name match)
    if (category !== 'all') {
      const catKeys = await getCategoryKeySet(category);
      andConditions.push({ category: { $in: catKeys } });
    }

    // Subcategory filter (case-insensitive exact match)
    if (subCategory && subCategory !== 'all') {
      andConditions.push({
        subCategory: new RegExp(`^${escapeRegex(subCategory)}$`, 'i'),
      });
    }

    // Optional exclude current product id (used in variant mapping picker)
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      andConditions.push({ _id: { $ne: new mongoose.Types.ObjectId(excludeId) } });
    }

    // Status filter (archived queries isArchived=true; all/published/draft exclude archived)
    if (status === 'archived') {
      andConditions.push({ isArchived: true });
    } else {
      andConditions.push({ isArchived: { $ne: true } });
      if (status === 'published') {
        andConditions.push({ isActive: true });
      } else if (status === 'draft') {
        andConditions.push({ isActive: false });
      }
    }

    // Stock filter
    if (stock === 'in-stock') {
      andConditions.push({ inStock: true, stockQuantity: { $gt: 0 } });
    } else if (stock === 'out-of-stock') {
      andConditions.push({ $or: [{ inStock: false }, { stockQuantity: { $lte: 0 } }] });
    }

    const query: any = andConditions.length === 1 ? andConditions[0] : { $and: andConditions };

    // Sorting (always include _id tie-breaker so paginated requests never repeat items)
    let sortQuery: any = { updatedAt: -1, _id: -1 };
    if (sort === 'updated-asc') {
      sortQuery = { updatedAt: 1, _id: 1 };
    } else if (sort === 'price-low') {
      sortQuery = { price: 1, _id: 1 };
    } else if (sort === 'price-high') {
      sortQuery = { price: -1, _id: -1 };
    } else if (sort === 'name-asc') {
      sortQuery = { name: 1, _id: 1 };
    } else if (sort === 'name-desc') {
      sortQuery = { name: -1, _id: -1 };
    }

    const skip = (page - 1) * limit;

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort(sortQuery).skip(skip).limit(limit).lean(),
    ]);

    // Attach color group member counts so admin list & variant mapper display existing groups cleanly
    const groupIds = Array.from(
      new Set(
        products
          .map((p: any) => (typeof p.colorGroupId === 'string' ? p.colorGroupId.trim() : ''))
          .filter(Boolean)
      )
    );

    const groupCountMap = new Map<string, number>();
    if (groupIds.length > 0) {
      const groupedCounts = await Product.aggregate([
        { $match: { colorGroupId: { $in: groupIds }, isArchived: { $ne: true } } },
        { $group: { _id: '$colorGroupId', count: { $sum: 1 } } },
      ]);
      for (const row of groupedCounts) {
        groupCountMap.set(row._id, row.count);
      }
    }

    const enrichedProducts = products.map((p: any) => ({
      ...p,
      linkedVariantCount: p.colorGroupId ? groupCountMap.get(p.colorGroupId) || 1 : 0,
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      count: enrichedProducts.length,
      total,
      page,
      totalPages,
      products: enrichedProducts,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch products', '[Admin Products GET Error]');
  }
}

/**
 * POST /api/admin/products
 * Create a new furniture product in MongoDB Atlas.
 */
export async function POST(request: NextRequest) {
  try {
    assertValidOrigin(request);
    await requireAdminSession(undefined, request);
    await connectDB();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    const rawCategory = typeof body.category === 'string' ? body.category.trim() : '';
    const catDoc = rawCategory
      ? await Category.findOne({
        $or: [
          { slug: rawCategory },
          { slug: rawCategory.toLowerCase() },
          { legacyId: rawCategory },
        ],
      }).lean()
      : null;

    if (!catDoc) {
      return NextResponse.json(
        {
          success: false,
          message: `Referenced category "${rawCategory || '(empty)'}" does not exist. Choose an existing category.`,
        },
        { status: 400 }
      );
    }

    body.category = catDoc.slug;
    if (!body.categoryLabel) {
      body.categoryLabel = catDoc.name || getCategoryLabel(catDoc.slug);
    }

    if (!body.subCategory || !body.subCategory.trim()) {
      body.subCategory = catDoc?.subcategories?.[0] || catDoc?.name || 'General';
    }

    if (!body.shortDescription || body.shortDescription.trim().length < 5) {
      body.shortDescription = `${body.name || 'Furniture'} — Handcrafted ${body.categoryLabel || 'luxury piece'} tailored for contemporary Indian living.`;
    }

    if (!body.fullDescription || body.fullDescription.trim().length < 10) {
      body.fullDescription = `${body.name || 'Furniture'} is an exquisite handcrafted furniture piece made with seasoned materials, precision joinery, and tailored luxury aesthetics.`;
    }

    if (!Array.isArray(body.materials) || body.materials.length === 0) {
      body.materials = ['Kiln-Dried Hardwood', 'High-Density Foam'];
    }

    if (!Array.isArray(body.images)) {
      body.images = [];
    }

    // Zod schema validation
    const validatedData = ProductInputSchema.parse(body);
    const { linkedVariantIds, ...productFields } = validatedData;

    if (!productFields.categoryLabel) {
      productFields.categoryLabel = catDoc?.name || getCategoryLabel(productFields.category);
    }

    // Keep product.colors synced when colorName is provided and colors list was empty
    if (productFields.colorName?.trim() && (!productFields.colors || productFields.colors.length === 0)) {
      productFields.colors = [
        {
          name: productFields.colorName.trim(),
          hex: productFields.colorHex?.trim() || '#211710',
          inStock: productFields.inStock ?? true,
          image: productFields.images?.[0] || '',
        },
      ];
    }

    // Pre-validate linked color variant products BEFORE inserting to prevent half-saved writes
    if (Array.isArray(linkedVariantIds) && linkedVariantIds.length > 0) {
      await validateLinkedVariantCandidates({
        linkedVariantIds,
        category: productFields.category,
        subCategory: productFields.subCategory,
      });
    }

    // Prevent silent duplicate creation for identical (name, colorName) pairs
    const duplicateCandidates = await Product.find({
      name: { $regex: new RegExp(`^${escapeRegex(productFields.name.trim())}$`, 'i') },
      isArchived: { $ne: true },
    })
      .select('name colorName slug')
      .lean();

    const normalizedNewColor = (productFields.colorName || '').trim().toLowerCase();
    const existingDuplicate = duplicateCandidates.find(
      (doc: any) => (doc.colorName || '').trim().toLowerCase() === normalizedNewColor
    );
    if (existingDuplicate) {
      return NextResponse.json(
        {
          success: false,
          message: normalizedNewColor
            ? `A "${productFields.name}" product in "${productFields.colorName}" colour already exists. Edit the existing product instead.`
            : `A product named "${productFields.name}" already exists. Edit the existing product instead of creating a duplicate.`,
        },
        { status: 409 }
      );
    }

    // Validate uniqueness of explicitly supplied slug/SKU (allow variant slug suffixing only when distinct colorName uses default name slug)
    const baseDerivedSlug = slugify(productFields.name);
    let targetSlug = productFields.slug || baseDerivedSlug;
    let existingSlug = await Product.findOne({ slug: targetSlug }).select('_id').lean();
    if (existingSlug) {
      const isColorVariantAutoSlug =
        Boolean(productFields.colorName?.trim()) &&
        (!productFields.slug || productFields.slug === baseDerivedSlug);

      if (productFields.slug && !isColorVariantAutoSlug) {
        return NextResponse.json(
          {
            success: false,
            message: `A product with slug "${productFields.slug}" already exists.`,
          },
          { status: 409 }
        );
      }

      let slugSuffix = 1;
      while (existingSlug) {
        slugSuffix++;
        targetSlug = `${baseDerivedSlug}-${slugSuffix}`;
        existingSlug = await Product.findOne({ slug: targetSlug }).select('_id').lean();
      }
    }
    productFields.slug = targetSlug;

    // Enforce uniqueness on explicitly submitted SKUs; auto-derive only when omitted
    let targetSku = productFields.sku || '';
    if (targetSku) {
      const existingSku = await Product.findOne({ sku: targetSku }).select('_id').lean();
      if (existingSku) {
        return NextResponse.json(
          {
            success: false,
            message: `A product with SKU "${targetSku}" already exists.`,
          },
          { status: 409 }
        );
      }
    } else {
      targetSku = `FUR-${targetSlug.slice(0, 10).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      let existingSku = await Product.findOne({ sku: targetSku }).select('_id').lean();
      while (existingSku) {
        targetSku = `FUR-${targetSlug.slice(0, 10).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        existingSku = await Product.findOne({ sku: targetSku }).select('_id').lean();
      }
    }
    productFields.sku = targetSku;

    // Build and save new product
    const newProduct = new Product({
      ...productFields,
      legacyId: productFields.sku.toLowerCase(),
      isArchived: false,
    });

    await newProduct.save();

    // Sync mapped color variant group if sibling products were selected
    const { affectedSlugs } = await syncProductColorGroup({
      product: newProduct,
      linkedVariantIds,
    });

    // Automatically sync subcategory to Category document & update itemCount
    if (productFields.subCategory && catDoc) {
      await Category.updateOne(
        { _id: catDoc._id },
        { $addToSet: { subcategories: productFields.subCategory.trim() } }
      );
    }
    await syncCategoryItemCounts();

    // Revalidate public storefront caches including /search & root layout
    revalidateCatalogPaths(
      [productFields.category],
      [productFields.slug, ...affectedSlugs]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'Failed to create product', '[Admin Products POST Error]');
  }
}
