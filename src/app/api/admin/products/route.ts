import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { requireAdminSession } from '@/lib/auth';
import { ProductInputSchema, getCategoryLabel, slugify } from '@/lib/validations/product';
import { escapeRegex } from '@/lib/category-cleanup';
import {
  ColorVariantValidationError,
  getCategoryKeySet,
  syncProductColorGroup,
  validateLinkedVariantCandidates,
} from '@/lib/color-variants';
import { ZodError } from 'zod';

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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    const andConditions: any[] = [{ isArchived: { $ne: true } }];

    // Search filter (matches name, SKU, legacyId, or colorName)
    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { legacyId: { $regex: search, $options: 'i' } },
          { colorName: { $regex: search, $options: 'i' } },
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

    // Status filter
    if (status === 'published') {
      andConditions.push({ isActive: true });
    } else if (status === 'draft') {
      andConditions.push({ isActive: false });
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
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('[Admin Products GET Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Create a new furniture product in MongoDB Atlas.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    // Query category to get proper label and subcategories if needed
    const catDoc = await Category.findOne({
      $or: [{ slug: body.category }, { legacyId: body.category }],
    }).lean();

    if (!body.categoryLabel) {
      body.categoryLabel = catDoc?.name || getCategoryLabel(body.category || 'furniture');
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

    // Auto-derive slug from product name if not supplied or ensure uniqueness
    let targetSlug = productFields.slug || slugify(productFields.name);
    let slugSuffix = 1;
    let existingSlug = await Product.findOne({ slug: targetSlug });
    while (existingSlug) {
      slugSuffix++;
      targetSlug = `${productFields.slug || slugify(productFields.name)}-${slugSuffix}`;
      existingSlug = await Product.findOne({ slug: targetSlug });
    }
    productFields.slug = targetSlug;

    // Auto-derive SKU if not supplied or ensure uniqueness
    let targetSku = productFields.sku || `FUR-${targetSlug.slice(0, 10).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let existingSku = await Product.findOne({ sku: targetSku });
    while (existingSku) {
      targetSku = `FUR-${targetSlug.slice(0, 10).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      existingSku = await Product.findOne({ sku: targetSku });
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

    // Automatically sync subcategory to Category document in MongoDB
    if (productFields.subCategory && catDoc) {
      await Category.updateOne(
        { _id: catDoc._id },
        { $addToSet: { subcategories: productFields.subCategory.trim() } }
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
      revalidatePath(`/category/${productFields.category}`);
      revalidatePath(`/product/${productFields.slug}`);
      for (const relSlug of affectedSlugs) {
        revalidatePath(`/product/${relSlug}`);
      }
    } catch (e) {
      // Revalidation warning non-blocking
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        product: newProduct,
      },
      { status: 201 }
    );
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
    console.error('[Admin Products POST Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
