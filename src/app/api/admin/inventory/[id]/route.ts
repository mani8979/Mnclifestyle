import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { InventorySettingsSchema } from '@/lib/validations/inventory';
import { findProductByIdentifierQuery, updateInventorySettings } from '@/services/inventoryService';
import { revalidateCatalogPaths } from '@/lib/category-cleanup';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const product = await Product.findOne(findProductByIdentifierQuery(id)).lean();

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        id: (product as any).legacyId || (product as any)._id.toString(),
      },
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch inventory item', '[Inventory Item GET Error]');
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    assertValidOrigin(request);
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    const parsed = InventorySettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const product = await updateInventorySettings(id, parsed.data);

    revalidateCatalogPaths(
      (product as any)?.category ? [(product as any).category] : [],
      (product as any)?.slug ? [(product as any).slug] : []
    );

    return NextResponse.json({
      success: true,
      message: 'Inventory settings updated successfully.',
      product,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to update inventory settings', '[Inventory Item PATCH Error]');
  }
}
