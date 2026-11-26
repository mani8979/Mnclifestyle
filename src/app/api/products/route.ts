import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/services/productService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const subCategory = searchParams.get('subCategory') || undefined;
    const color = searchParams.get('color') || undefined;
    const isBestseller = searchParams.get('isBestseller') === 'true';
    const isFeatured = searchParams.get('isFeatured') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const sort = (searchParams.get('sort') as any) || undefined;
    const search = searchParams.get('search') || undefined;

    const products = await getProducts({
      category,
      subCategory,
      color,
      isBestseller,
      isFeatured,
      limit,
      sort,
      search,
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      total: products.length,
      products,
      data: products,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
