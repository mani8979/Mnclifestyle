import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const status = searchParams.get('status')?.trim() || 'all';
    const sort = searchParams.get('sort')?.trim() || 'stock-desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const query: any = { isArchived: { $ne: true } };

    // Search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { categoryLabel: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.$or = query.$or
        ? [{ $and: [{ $or: query.$or }, { $or: [{ category }, { categoryLabel: category }] }] }]
        : [{ category }, { categoryLabel: category }];
    }

    // Status filter
    if (status === 'low_stock') {
      query.trackInventory = true;
      query.availableQuantity = { $gt: 0 };
      query.$expr = { $lte: ['$availableQuantity', '$lowStockThreshold'] };
    } else if (status === 'out_of_stock') {
      query.trackInventory = true;
      query.availableQuantity = { $lte: 0 };
      query.allowBackorders = { $ne: true };
    } else if (status === 'in_stock') {
      query.$or = [
        { trackInventory: false },
        { availableQuantity: { $gt: 0 } },
        { allowBackorders: true },
      ];
    } else if (status === 'made_to_order') {
      query.trackInventory = false;
    }

    // Sorting
    let sortObj: any = { stockQuantity: -1 };
    if (sort === 'stock-asc') sortObj = { stockQuantity: 1 };
    else if (sort === 'stock-desc') sortObj = { stockQuantity: -1 };
    else if (sort === 'available-asc') sortObj = { availableQuantity: 1 };
    else if (sort === 'available-desc') sortObj = { availableQuantity: -1 };
    else if (sort === 'name-asc') sortObj = { name: 1 };
    else if (sort === 'name-desc') sortObj = { name: -1 };
    else if (sort === 'price-desc') sortObj = { price: -1 };
    else if (sort === 'newest') sortObj = { inventoryUpdatedAt: -1 };

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
    ]);

    const formattedProducts = products.map((p: any) => ({
      ...p,
      id: p.legacyId || p._id.toString(),
      calculatedStatus: !p.trackInventory
        ? 'made_to_order'
        : p.availableQuantity <= 0 && !p.allowBackorders
        ? 'out_of_stock'
        : p.availableQuantity <= (p.lowStockThreshold || 5)
        ? 'low_stock'
        : 'in_stock',
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
