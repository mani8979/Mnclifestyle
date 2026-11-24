import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { InventoryMovement } from '@/models/InventoryMovement';
import { StockAdjustmentSchema } from '@/lib/validations/inventory';

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

    const parsed = StockAdjustmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid adjustment data.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { adjustmentType, quantity, reason, notes } = parsed.data;

    const product = await Product.findOne(findProductQuery(id));
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    const prevPhysical = product.stockQuantity;
    const reserved = product.reservedQuantity || 0;

    // For reductions (Manual Reduction, Stock Sold, Damaged Goods), enforce atomic conditional update
    if (['Stock Sold', 'Manual Reduction', 'Damaged Goods'].includes(adjustmentType)) {
      const minRequiredStock = reserved + quantity;

      const updated = await Product.findOneAndUpdate(
        {
          _id: product._id,
          stockQuantity: { $gte: minRequiredStock },
        },
        {
          $inc: { stockQuantity: -quantity },
          $set: { inventoryUpdatedAt: new Date() },
        },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot adjust stock below zero or below reserved quantity (${reserved} reserved). Current physical stock is ${product.stockQuantity}, requested reduction: ${quantity}.`,
          },
          { status: 400 }
        );
      }

      const newPhysical = updated.stockQuantity;
      const newAvailable = updated.trackInventory
        ? Math.max(0, newPhysical - reserved)
        : newPhysical;

      updated.availableQuantity = newAvailable;
      updated.inStock = updated.trackInventory
        ? (newAvailable > 0 || Boolean(updated.allowBackorders))
        : true;
      await updated.save();

      const movement = await InventoryMovement.create({
        productId: updated._id,
        sku: updated.sku,
        productName: updated.name,
        previousQuantity: newPhysical + quantity,
        quantityChanged: -quantity,
        newQuantity: newPhysical,
        previousReserved: reserved,
        newReserved: reserved,
        adjustmentType,
        reason,
        notes: notes || '',
        adminId: (admin as any).id || (admin as any)._id?.toString() || '',
        adminName: (admin as any).name || (admin as any).email || 'Administrator',
        timestamp: new Date(),
      });

      try {
        revalidatePath('/');
        revalidatePath('/shop');
        revalidatePath('/collections');
        if (updated.slug) revalidatePath(`/product/${updated.slug}`);
        if (updated.category) revalidatePath(`/category/${updated.category}`);
      } catch (e) {}

      return NextResponse.json({
        success: true,
        message: `Stock successfully adjusted for ${updated.name}.`,
        product: {
          id: updated.legacyId || updated._id.toString(),
          sku: updated.sku,
          name: updated.name,
          stockQuantity: updated.stockQuantity,
          availableQuantity: updated.availableQuantity,
          reservedQuantity: updated.reservedQuantity,
          inStock: updated.inStock,
        },
        movement,
      });
    }

    let newPhysical = prevPhysical;

    switch (adjustmentType) {
      case 'Stock Received':
      case 'Manual Addition':
      case 'Returned Goods':
        newPhysical = prevPhysical + quantity;
        break;

      case 'Stock Correction':
        newPhysical = quantity;
        break;

      default:
        return NextResponse.json(
          { success: false, message: `Unsupported adjustment type for this route: ${adjustmentType}` },
          { status: 400 }
        );
    }

    // Safety checks for corrections
    if (newPhysical < 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot adjust stock below zero. Current stock is ${prevPhysical}, reduction requested is ${quantity}.`,
        },
        { status: 400 }
      );
    }

    if (newPhysical < reserved) {
      return NextResponse.json(
        {
          success: false,
          message: `Stock cannot be reduced below reserved quantity (${reserved} units currently reserved). New physical stock would be ${newPhysical}.`,
        },
        { status: 400 }
      );
    }

    const quantityChanged = newPhysical - prevPhysical;
    const newAvailable = product.trackInventory
      ? Math.max(0, newPhysical - reserved)
      : newPhysical;

    // Update Product atomically
    product.stockQuantity = newPhysical;
    product.availableQuantity = newAvailable;
    product.inStock = product.trackInventory
      ? (newAvailable > 0 || Boolean(product.allowBackorders))
      : true;
    product.inventoryUpdatedAt = new Date();

    await product.save();

    // Record immutable movement
    const movement = await InventoryMovement.create({
      productId: product._id,
      sku: product.sku,
      productName: product.name,
      previousQuantity: prevPhysical,
      quantityChanged,
      newQuantity: newPhysical,
      previousReserved: reserved,
      newReserved: reserved,
      adjustmentType,
      reason,
      notes: notes || '',
      adminId: (admin as any).id || (admin as any)._id?.toString() || '',
      adminName: (admin as any).name || (admin as any).email || 'Administrator',
      timestamp: new Date(),
    });

    try {
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/collections');
      if (product.slug) revalidatePath(`/product/${product.slug}`);
      if (product.category) revalidatePath(`/category/${product.category}`);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `Stock successfully adjusted for ${product.name}.`,
      product: {
        id: product.legacyId || product._id.toString(),
        sku: product.sku,
        name: product.name,
        stockQuantity: product.stockQuantity,
        availableQuantity: product.availableQuantity,
        reservedQuantity: product.reservedQuantity,
        inStock: product.inStock,
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
