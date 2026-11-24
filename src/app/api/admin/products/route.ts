import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { requireAdminSession } from '@/lib/auth';
import { ProductInputSchema, getCategoryLabel } from '@/lib/validations/product';
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

    // Check duplicate SKU
    const existingSku = await Product.findOne({ sku: validatedData.sku });
    if (existingSku) {
      return NextResponse.json(
        { success: false, message: `Product SKU "${validatedData.sku}" is already in use.` },
        { status: 409 }
      );
    }

    // Check duplicate Slug
    const existingSlug = await Product.findOne({ slug: validatedData.slug });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, message: `Product URL slug "${validatedData.slug}" is already in use.` },
        { status: 409 }
      );
    }

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
