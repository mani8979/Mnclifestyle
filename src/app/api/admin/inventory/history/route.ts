import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, handleApiError } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { InventoryMovement } from '@/models/InventoryMovement';
import { escapeRegex } from '@/lib/category-cleanup';

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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '25', 10) || 25));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { sku: { $regex: safeSearch, $options: 'i' } },
        { productName: { $regex: safeSearch, $options: 'i' } },
        { reason: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    if (type && type !== 'all') {
      query.adjustmentType = type;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        const parsedStart = new Date(startDate);
        if (Number.isNaN(parsedStart.getTime())) {
          return NextResponse.json(
            { success: false, message: 'Invalid startDate parameter format' },
            { status: 400 }
          );
        }
        query.timestamp.$gte = parsedStart;
      }
      if (endDate) {
        const parsedEnd = new Date(endDate);
        if (Number.isNaN(parsedEnd.getTime())) {
          return NextResponse.json(
            { success: false, message: 'Invalid endDate parameter format' },
            { status: 400 }
          );
        }
        parsedEnd.setHours(23, 59, 59, 999);
        query.timestamp.$lte = parsedEnd;
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
  } catch (error) {
    return handleApiError(error, 'Failed to load inventory movement history', '[Inventory History Error]');
  }
}
