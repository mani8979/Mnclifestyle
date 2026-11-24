import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { InventoryMovement } from '@/models/InventoryMovement';
import { StockReleaseSchema } from '@/lib/validations/inventory';

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

    const parsed = StockReleaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid release data.',
        },
        { status: 400 }
      );
    }

    const { quantity, isSold, reason, notes } = parsed.data;

    const product = await Product.findOne(findProductQuery(id));
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    const prevReserved = product.reservedQuantity || 0;
    if (prevReserved < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot release ${quantity} units. Only ${prevReserved} units currently reserved.`,
        },
        { status: 400 }
      );
    }

    const prevPhysical = product.stockQuantity;
    const newReserved = prevReserved - quantity;
    let newPhysical = prevPhysical;
    let adjustmentType: 'Stock Sold' | 'Reservation Release' = 'Reservation Release';
    let quantityChanged = 0;

    if (isSold) {
      // Confirmed sale from reservation: physical inventory decreases by quantity
      newPhysical = Math.max(0, prevPhysical - quantity);
      quantityChanged = -quantity;
      adjustmentType = 'Stock Sold';
    }

    const newAvailable = product.trackInventory
      ? Math.max(0, newPhysical - newReserved)
      : newPhysical;

    product.stockQuantity = newPhysical;
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
      previousQuantity: prevPhysical,
      quantityChanged,
      newQuantity: newPhysical,
      previousReserved: prevReserved,
      newReserved,
      adjustmentType,
      reason: reason || (isSold ? 'Order fulfillment from reservation' : 'Reservation cancellation/release'),
      notes: notes || '',
      adminId: (admin as any).id || (admin as any)._id?.toString() || '',
      adminName: (admin as any).name || (admin as any).email || 'Administrator',
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: isSold
        ? `Confirmed sale of ${quantity} units for ${product.name}. Physical stock and reservation updated.`
        : `Released ${quantity} reserved units for ${product.name}. Available stock restored.`,
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
