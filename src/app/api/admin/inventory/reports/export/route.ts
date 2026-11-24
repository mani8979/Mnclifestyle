import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { InventoryMovement } from '@/models/InventoryMovement';

export const dynamic = 'force-dynamic';

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'stock';

    if (reportType === 'movements') {
      // Export movements
      const movements = await InventoryMovement.find({}).sort({ timestamp: -1 }).limit(1000).lean();
      const headers = [
        'Timestamp',
        'SKU',
        'Product Name',
        'Adjustment Type',
        'Previous Qty',
        'Changed Qty',
        'New Qty',
        'Previous Reserved',
        'New Reserved',
        'Reason',
        'Notes',
        'Admin',
      ];

      const rows = movements.map((m: any) => [
        new Date(m.timestamp).toISOString(),
        m.sku,
        m.productName,
        m.adjustmentType,
        m.previousQuantity,
        m.quantityChanged,
        m.newQuantity,
        m.previousReserved || 0,
        m.newReserved || 0,
        m.reason || '',
        m.notes || '',
        m.adminName || 'Admin',
      ]);

      const csvContent = [
        headers.map(escapeCsvCell).join(','),
        ...rows.map((r) => r.map(escapeCsvCell).join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="inventory-movements-${Date.now()}.csv"`,
        },
      });
    }

    // Default: Export inventory status & valuation
    const products = await Product.find({ isArchived: { $ne: true } })
      .sort({ category: 1, name: 1 })
      .lean();

    const headers = [
      'SKU',
      'Product Name',
      'Category',
      'Physical Stock',
      'Reserved Stock',
      'Available Stock',
      'Low Stock Threshold',
      'Inventory Mode',
      'Retail Price (INR)',
      'Estimated Cost Price (INR)',
      'Total Retail Valuation (INR)',
      'Total Cost Valuation (INR)',
      'Stock Status',
      'Last Updated',
    ];

    const rows = products.map((p: any) => {
      const physical = p.stockQuantity || 0;
      const reserved = p.reservedQuantity || 0;
      const available = p.availableQuantity ?? Math.max(0, physical - reserved);
      const retail = p.price || 0;
      const cost = p.costPrice || Math.round(retail * 0.45);
      const status = !p.trackInventory
        ? 'Made to Order'
        : available <= 0
        ? 'Out of Stock'
        : available <= (p.lowStockThreshold || 5)
        ? 'Low Stock'
        : 'In Stock';

      return [
        p.sku,
        p.name,
        p.categoryLabel || p.category,
        physical,
        reserved,
        available,
        p.lowStockThreshold || 5,
        p.trackInventory ? 'Tracked' : 'Made to Order',
        retail,
        cost,
        physical * retail,
        physical * cost,
        status,
        p.inventoryUpdatedAt ? new Date(p.inventoryUpdatedAt).toISOString() : '',
      ];
    });

    const csvContent = [
      headers.map(escapeCsvCell).join(','),
      ...rows.map((r) => r.map(escapeCsvCell).join(',')),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inventory-valuation-${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
