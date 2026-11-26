import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { StockReservationSchema } from '@/lib/validations/inventory';
import { reserveInventoryStock } from '@/services/inventoryService';
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

    const parsed = StockReservationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid reservation data.',
        },
        { status: 400 }
      );
    }

    const result = await reserveInventoryStock(id, parsed.data, admin);

    revalidateCatalogPaths(
      result.category ? [result.category] : [],
      result.slug ? [result.slug] : []
    );

    return NextResponse.json({
      success: true,
      message: `Successfully reserved ${parsed.data.quantity} units of ${result.product?.name || 'product'}.`,
      product: result.product,
      movement: result.movement,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to reserve inventory stock', '[Inventory Reserve Error]');
  }
}
