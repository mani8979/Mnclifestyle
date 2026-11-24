import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const activeFilter = { isArchived: { $ne: true } };

    const [allProducts, lowStockProducts, outOfStockProducts, madeToOrderCount] = await Promise.all([
      Product.find(activeFilter).select('price costPrice stockQuantity reservedQuantity availableQuantity lowStockThreshold trackInventory allowBackorders').lean(),
      Product.countDocuments({
        ...activeFilter,
        trackInventory: true,
        availableQuantity: { $gt: 0 },
        $expr: { $lte: ['$availableQuantity', '$lowStockThreshold'] },
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
      const stock = typeof p.stockQuantity === 'number' ? p.stockQuantity : 0;
      const reserved = typeof p.reservedQuantity === 'number' ? p.reservedQuantity : 0;
      const available = typeof p.availableQuantity === 'number' ? p.availableQuantity : Math.max(0, stock - reserved);
      const cost = typeof p.costPrice === 'number' && p.costPrice > 0 ? p.costPrice : Math.round((p.price || 0) * 0.45);
      const retail = typeof p.price === 'number' ? p.price : 0;

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
  } catch (error: any) {
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
