import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, handleApiError } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const activeFilter = { isArchived: { $ne: true } };

    const [allProducts, lowStockProducts, outOfStockProducts, madeToOrderCount] = await Promise.all([
      Product.find(activeFilter)
        .select('price costPrice stockQuantity reservedQuantity availableQuantity lowStockThreshold trackInventory allowBackorders')
        .lean(),
      Product.countDocuments({
        ...activeFilter,
        trackInventory: true,
        availableQuantity: { $gt: 0 },
        $expr: { $lte: ['$availableQuantity', { $ifNull: ['$lowStockThreshold', 5] }] },
      }),
      Product.countDocuments({
        ...activeFilter,
        trackInventory: true,
        availableQuantity: { $lte: 0 },
        allowBackorders: { $ne: true },
      }),
      Product.countDocuments({
        ...activeFilter,
        trackInventory: false,
      }),
    ]);

    let totalStockUnits = 0;
    let availableStockUnits = 0;
    let reservedStockUnits = 0;
    let totalCostValuation = 0;
    let totalRetailValuation = 0;

    for (const p of allProducts as any[]) {
      const isTracked = p.trackInventory !== false;
      const stock = isTracked && typeof p.stockQuantity === 'number' ? p.stockQuantity : 0;
      const reserved = isTracked && typeof p.reservedQuantity === 'number' ? p.reservedQuantity : 0;
      const available = isTracked
        ? typeof p.availableQuantity === 'number'
          ? p.availableQuantity
          : Math.max(0, stock - reserved)
        : 0;
      const retail = typeof p.price === 'number' ? p.price : 0;
      const hasRecordedCost = typeof p.costPrice === 'number' && p.costPrice > 0;
      const cost = hasRecordedCost ? p.costPrice : Math.round(retail * 0.45);

      totalStockUnits += stock;
      availableStockUnits += available;
      reservedStockUnits += reserved;
      totalCostValuation += stock * cost;
      totalRetailValuation += stock * retail;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: allProducts.length,
        totalStockUnits,
        availableStockUnits,
        reservedStockUnits,
        lowStockProducts,
        outOfStockProducts,
        madeToOrderCount,
        totalCostValuation,
        totalRetailValuation,
        estimatedGrossProfitPotential: totalRetailValuation - totalCostValuation,
      },
    });
  } catch (error) {
    return handleApiError(error, 'Failed to load inventory statistics', '[Inventory Stats Error]');
  }
}
