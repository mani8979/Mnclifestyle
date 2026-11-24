import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const body = await request.json();
    const orders: Array<{ id: string; orderIndex: number }> = body.orders;

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid orders payload' },
        { status: 400 }
      );
    }

    const bulkOps = orders.map((item, index) => {
      const orderVal = typeof item.orderIndex === 'number' ? item.orderIndex : index + 1;
      const idOrSlug = item.id;
      const filterConditions: any[] = [{ slug: idOrSlug }, { legacyId: idOrSlug }];
      if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        filterConditions.unshift({ _id: new mongoose.Types.ObjectId(idOrSlug) });
      }

      return {
        updateOne: {
          filter: { $or: filterConditions },
          update: { $set: { orderIndex: orderVal } },
        },
      };
    });

    if (bulkOps.length > 0) {
      await Category.bulkWrite(bulkOps);
    }

    revalidatePath('/admin/categories');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/collections');

    return NextResponse.json({
      success: true,
      message: 'Category orders updated successfully',
    });
  } catch (error: any) {
    console.error('POST /api/admin/categories/reorder error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update category order' },
      { status: 500 }
    );
  }
}
