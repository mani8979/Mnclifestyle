import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, handleApiError } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { escapeRegex } from '@/lib/category-cleanup';
import { getCategoryKeySet } from '@/lib/color-variants';

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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10) || 20));
    const skip = (page - 1) * limit;

    const andConditions: any[] = [{ isArchived: { $ne: true } }];

    if (search) {
      const safeSearch = escapeRegex(search);
      andConditions.push({
        $or: [
          { name: { $regex: safeSearch, $options: 'i' } },
          { sku: { $regex: safeSearch, $options: 'i' } },
          { categoryLabel: { $regex: safeSearch, $options: 'i' } },
          { subCategory: { $regex: safeSearch, $options: 'i' } },
        ],
      });
    }

    if (category && category !== 'all') {
      const catKeys = await getCategoryKeySet(category);
      andConditions.push({
        $or: [{ category: { $in: catKeys } }, { categoryLabel: { $in: catKeys } }],
      });
    }

    if (status === 'low_stock') {
      andConditions.push({
        trackInventory: true,
        availableQuantity: { $gt: 0 },
        $expr: { $lte: ['$availableQuantity', { $ifNull: ['$lowStockThreshold', 5] }] },
      });
    } else if (status === 'out_of_stock') {
      andConditions.push({
        trackInventory: true,
        availableQuantity: { $lte: 0 },
        allowBackorders: { $ne: true },
      });
    } else if (status === 'in_stock') {
      andConditions.push({
        $or: [
          { trackInventory: false },
          { availableQuantity: { $gt: 0 } },
          { allowBackorders: true },
        ],
      });
    } else if (status === 'made_to_order') {
      andConditions.push({ trackInventory: false });
    }

    const query: any = andConditions.length === 1 ? andConditions[0] : { $and: andConditions };

    let sortObj: any = { stockQuantity: -1, _id: -1 };
    if (sort === 'stock-asc') sortObj = { stockQuantity: 1, _id: 1 };
    else if (sort === 'stock-desc') sortObj = { stockQuantity: -1, _id: -1 };
    else if (sort === 'available-asc') sortObj = { availableQuantity: 1, _id: 1 };
    else if (sort === 'available-desc') sortObj = { availableQuantity: -1, _id: -1 };
    else if (sort === 'name-asc') sortObj = { name: 1, _id: 1 };
    else if (sort === 'name-desc') sortObj = { name: -1, _id: -1 };
    else if (sort === 'price-desc') sortObj = { price: -1, _id: -1 };
    else if (sort === 'newest') sortObj = { inventoryUpdatedAt: -1, _id: -1 };

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
          : p.availableQuantity <= (typeof p.lowStockThreshold === 'number' ? p.lowStockThreshold : 5)
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
  } catch (error) {
    return handleApiError(error, 'Failed to fetch inventory list', '[Admin Inventory GET Error]');
  }
}
