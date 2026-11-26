import { NextRequest, NextResponse } from 'next/server';
import { getProductByIdOrSlug } from '@/services/productService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await getProductByIdOrSlug(id);

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product, data: product });
  } catch (error) {
    console.error('[Public Product Detail GET Error]:', error);
    return NextResponse.json({ success: false, message: 'Failed to load product' }, { status: 500 });
  }
}
