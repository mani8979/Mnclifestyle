import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, handleApiError } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { InventoryMovement } from '@/models/InventoryMovement';

export const dynamic = 'force-dynamic';

const FORMULA_TRIGGER_RE = /^[=+\-@\t\r]/;

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (FORMULA_TRIGGER_RE.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'stock';

    if (reportType === 'movements') {
      const limit = Math.min(5000, Math.max(1, parseInt(searchParams.get('limit') || '1000', 10) || 1000));
      const [totalCount, movements] = await Promise.all([
        InventoryMovement.countDocuments({}),
        InventoryMovement.find({}).sort({ timestamp: -1 }).limit(limit).lean(),
      ]);

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
        'Admin ID',
        'Admin Name',
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
        m.adminId ? m.adminId.toString() : '',
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
          'X-Total-Count': String(totalCount),
          'X-Export-Truncated': String(totalCount > movements.length),
        },
      });
    }

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
      'Recorded Cost Price (INR)',
      'Cost Data Status',
      'Total Retail Valuation (INR)',
      'Total Recorded Cost Valuation (INR)',
      'Stock Status',
      'Last Updated',
    ];

    const rows = products.map((p: any) => {
      const isTracked = p.trackInventory !== false;
      const physical = isTracked ? p.stockQuantity || 0 : 0;
      const reserved = isTracked ? p.reservedQuantity || 0 : 0;
      const available = isTracked
        ? p.availableQuantity ?? Math.max(0, physical - reserved)
        : 0;
      const retail = p.price || 0;
      const hasCost = typeof p.costPrice === 'number' && p.costPrice > 0;
      const cost = hasCost ? p.costPrice : 0;
      const threshold = typeof p.lowStockThreshold === 'number' ? p.lowStockThreshold : 5;
      const status = !isTracked
        ? 'Made to Order'
        : available <= 0
          ? 'Out of Stock'
          : available <= threshold
            ? 'Low Stock'
            : 'In Stock';

      return [
        p.sku,
        p.name,
        p.categoryLabel || p.category,
        physical,
        reserved,
        available,
        threshold,
        isTracked ? 'Tracked' : 'Made to Order',
        retail,
        cost,
        hasCost ? 'Recorded' : 'Missing',
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
  } catch (error) {
    return handleApiError(error, 'Failed to export inventory report', '[Inventory Export Error]');
  }
}
