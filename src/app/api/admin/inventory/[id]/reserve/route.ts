import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { InventoryMovement } from '@/models/InventoryMovement';
import { StockReservationSchema } from '@/lib/validations/inventory';

export const dynamic = 'force-dynamic';

function findProductQuery(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { _id: id };
  }
  return {
    $or: [{ sku: id.toUpperCase() }, { slug: id.toLowerCase() }, { legacyId: id }],
  };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));

    const parsed = StockReservationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid reservation data.',
        },
        { status: 400 }
      );
    }

    const { quantity, reason, notes } = parsed.data;

    const product = await Product.findOne(findProductQuery(id));
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    if (product.trackInventory) {
      if (product.availableQuantity < quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot reserve ${quantity} units. Only ${product.availableQuantity} units currently available.`,
          },
          { status: 400 }
        );
      }
    }

    const prevReserved = product.reservedQuantity || 0;
    const newReserved = prevReserved + quantity;
    const newAvailable = product.trackInventory
      ? Math.max(0, product.stockQuantity - newReserved)
      : product.stockQuantity;

    product.reservedQuantity = newReserved;
    product.availableQuantity = newAvailable;
    product.inStock = product.trackInventory
      ? (newAvailable > 0 || Boolean(product.allowBackorders))
      : true;
    product.inventoryUpdatedAt = new Date();

    await product.save();

    // Record movement audit
    const movement = await InventoryMovement.create({
      productId: product._id,
      sku: product.sku,
      productName: product.name,
      previousQuantity: product.stockQuantity,
      quantityChanged: 0,
      newQuantity: product.stockQuantity,
      previousReserved: prevReserved,
      newReserved,
      adjustmentType: 'Reservation',
      reason,
      notes: notes || `Reserved ${quantity} units`,
      adminId: (admin as any).id || (admin as any)._id?.toString() || '',
      adminName: (admin as any).name || (admin as any).email || 'Administrator',
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Successfully reserved ${quantity} units of ${product.name}.`,
      product: {
        id: product.legacyId || product._id.toString(),
        sku: product.sku,
        name: product.name,
        stockQuantity: product.stockQuantity,
        availableQuantity: product.availableQuantity,
        reservedQuantity: product.reservedQuantity,
      },
      movement,
    });
  } catch (error: any) {
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
