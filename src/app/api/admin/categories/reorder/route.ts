import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { CategoryReorderSchema } from '@/lib/validations/category';
import { revalidateCatalogPaths } from '@/lib/category-cleanup';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    assertValidOrigin(request);
    await requireAdminSession(undefined, request);
    await connectDB();

    const body = await request.json().catch(() => null);
    const parsed = CategoryReorderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || 'Invalid orders payload' },
        { status: 400 }
      );
    }

    const bulkOps = parsed.data.orders.map((item, index) => {
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

    revalidateCatalogPaths([]);

    return NextResponse.json({
      success: true,
      message: 'Category orders updated successfully',
    });
  } catch (error) {
    return handleApiError(error, 'Failed to update category order', '[Admin Categories Reorder Error]');
  }
}
