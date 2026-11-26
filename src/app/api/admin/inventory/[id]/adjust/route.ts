import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { StockAdjustmentSchema } from '@/lib/validations/inventory';
import { adjustInventoryStock } from '@/services/inventoryService';
import { revalidateCatalogPaths } from '@/lib/category-cleanup';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    assertValidOrigin(request);
    const admin = await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

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

    const result = await adjustInventoryStock(id, parsed.data, admin);

    revalidateCatalogPaths(
      result.category ? [result.category] : [],
      result.slug ? [result.slug] : []
    );

    return NextResponse.json({
      success: true,
      message: `Stock successfully adjusted for ${result.product?.name || 'product'}.`,
      product: result.product,
      movement: result.movement,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to adjust inventory stock', '[Inventory Adjust Error]');
  }
}
