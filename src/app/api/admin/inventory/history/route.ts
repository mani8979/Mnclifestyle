import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { InventoryMovement } from '@/models/InventoryMovement';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const type = searchParams.get('type')?.trim() || '';
    const startDate = searchParams.get('startDate')?.trim();
    const endDate = searchParams.get('endDate')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '25', 10)));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search) {
      query.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
      ];
    }

    if (type && type !== 'all') {
      query.adjustmentType = type;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    const [total, movements] = await Promise.all([
      InventoryMovement.countDocuments(query),
      InventoryMovement.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
    ]);

    return NextResponse.json({
      success: true,
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
