import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { requireAdminSession } from '@/lib/auth';
import { ProductInputSchema, getCategoryLabel, slugify } from '@/lib/validations/product';
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
    const status = searchParams.get('status')?.trim() || 'all'; // all, published, draft
    const stock = searchParams.get('stock')?.trim() || 'all'; // all, in-stock, out-of-stock
    const sort = searchParams.get('sort')?.trim() || 'updated-desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    const query: any = { isArchived: { $ne: true } };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { legacyId: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category !== 'all') {
      query.category = category;
    }

    // Status filter
    if (status === 'published') {
      query.isActive = true;
    } else if (status === 'draft') {
      query.isActive = false;
    }

    // Stock filter
    if (stock === 'in-stock') {
      query.inStock = true;
      query.stockQuantity = { $gt: 0 };
    } else if (stock === 'out-of-stock') {
      query.$or = [{ inStock: false }, { stockQuantity: { $lte: 0 } }];
    }

    // Sorting
    let sortQuery: any = { updatedAt: -1 };
    if (sort === 'updated-asc') {
      sortQuery = { updatedAt: 1 };
    } else if (sort === 'price-low') {
      sortQuery = { price: 1 };
    } else if (sort === 'price-high') {
      sortQuery = { price: -1 };
    } else if (sort === 'name-asc') {
      sortQuery = { name: 1 };
    } else if (sort === 'name-desc') {
      sortQuery = { name: -1 };
    }

    const skip = (page - 1) * limit;

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort(sortQuery).skip(skip).limit(limit).lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      count: products.length,
      total,
      page,
      totalPages,
      products,
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

    // Zod schema validation
    const validatedData = ProductInputSchema.parse(body);

    // Auto-derive categoryLabel if not supplied
    if (!validatedData.categoryLabel) {
      validatedData.categoryLabel = getCategoryLabel(validatedData.category);
    }

    // Auto-derive slug from product name if not supplied or ensure uniqueness
    let targetSlug = validatedData.slug || slugify(validatedData.name);
    let slugSuffix = 1;
    let existingSlug = await Product.findOne({ slug: targetSlug });
    while (existingSlug) {
      slugSuffix++;
      targetSlug = `${validatedData.slug || slugify(validatedData.name)}-${slugSuffix}`;
      existingSlug = await Product.findOne({ slug: targetSlug });
    }
    validatedData.slug = targetSlug;

    // Auto-derive SKU if not supplied or ensure uniqueness
    let targetSku = validatedData.sku || `FUR-${targetSlug.slice(0, 10).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let existingSku = await Product.findOne({ sku: targetSku });
    while (existingSku) {
      targetSku = `FUR-${targetSlug.slice(0, 10).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      existingSku = await Product.findOne({ sku: targetSku });
    }
    validatedData.sku = targetSku;

    // Build and save new product
    const newProduct = new Product({
      ...validatedData,
      legacyId: validatedData.sku.toLowerCase(),
      isArchived: false,
    });

    await newProduct.save();

    // Revalidate public storefront caches
    try {
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/collections');
      revalidatePath(`/category/${validatedData.category}`);
      revalidatePath(`/product/${validatedData.slug}`);
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
