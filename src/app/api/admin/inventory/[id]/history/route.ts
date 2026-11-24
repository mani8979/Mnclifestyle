import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { InventoryMovement } from '@/models/InventoryMovement';

export const dynamic = 'force-dynamic';

function findProductQuery(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { _id: id };
  }
  return {
    $or: [{ sku: id.toUpperCase() }, { slug: id.toLowerCase() }, { legacyId: id }],
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const product = await Product.findOne(findProductQuery(id)).select('_id sku name').lean();
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    const query = {
      $or: [{ productId: product._id }, { sku: product.sku }],
    };

    const [total, movements] = await Promise.all([
      InventoryMovement.countDocuments(query),
      InventoryMovement.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
    ]);

    return NextResponse.json({
      success: true,
      product: {
        id: (product as any)._id.toString(),
        sku: product.sku,
        name: product.name,
      },
      movements,
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
