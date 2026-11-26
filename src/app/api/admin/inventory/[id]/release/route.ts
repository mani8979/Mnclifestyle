import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { StockReleaseSchema } from '@/lib/validations/inventory';
import { releaseInventoryStock } from '@/services/inventoryService';
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

    const parsed = StockReleaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid release data.',
        },
        { status: 400 }
      );
    }

    const result = await releaseInventoryStock(id, parsed.data, admin);

    revalidateCatalogPaths(
      result.category ? [result.category] : [],
      result.slug ? [result.slug] : []
    );

    return NextResponse.json({
      success: true,
      message: parsed.data.isSold
        ? `Confirmed sale of ${parsed.data.quantity} units for ${result.product?.name || 'product'}. Physical stock and reservation updated.`
        : `Released ${parsed.data.quantity} reserved units for ${result.product?.name || 'product'}. Available stock restored.`,
      product: result.product,
      movement: result.movement,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to release reserved inventory', '[Inventory Release Error]');
  }
}
