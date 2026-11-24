import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { InventorySettingsSchema } from '@/lib/validations/inventory';

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
    const product = await Product.findOne(findProductQuery(id)).lean();

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        id: (product as any).legacyId || (product as any)._id.toString(),
      },
    });
  } catch (error: any) {
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const parsed = InventorySettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const product = await Product.findOne(findProductQuery(id));
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const updates = parsed.data;
    if (updates.lowStockThreshold !== undefined) product.lowStockThreshold = updates.lowStockThreshold;
    if (updates.trackInventory !== undefined) product.trackInventory = updates.trackInventory;
    if (updates.allowBackorders !== undefined) product.allowBackorders = updates.allowBackorders;
    if (updates.costPrice !== undefined) product.costPrice = updates.costPrice;

    // Recalculate status
    if (product.trackInventory === false) {
      product.inStock = true;
      product.availableQuantity = product.stockQuantity;
    } else {
      product.availableQuantity = Math.max(0, product.stockQuantity - product.reservedQuantity);
      product.inStock = product.availableQuantity > 0 || Boolean(product.allowBackorders);
    }
    product.inventoryUpdatedAt = new Date();

    await product.save();

    return NextResponse.json({
      success: true,
      message: 'Inventory settings updated successfully.',
      product,
    });
  } catch (error: any) {
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
