import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { requireAdminSession, handleApiError } from '@/lib/auth';
import { buildCategoryLookupQuery, findAffectedProducts } from '@/lib/category-cleanup';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const subCategory = searchParams.get('subCategory')?.trim() || undefined;

    const category = await Category.findOne(buildCategoryLookupQuery(id)).lean();
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    const products = await findAffectedProducts(category as any, subCategory);

    return NextResponse.json({
      success: true,
      category: {
        id: (category as any)._id.toString(),
        name: (category as any).name,
        slug: (category as any).slug,
      },
      subCategory: subCategory || null,
      count: products.length,
      products: products.map((p: any) => ({
        _id: p._id.toString(),
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        category: p.category,
        subCategory: p.subCategory,
        price: p.price,
        isActive: p.isActive,
        image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '',
      })),
    });
  } catch (error) {
    return handleApiError(error, 'Failed to inspect category products', '[Admin Category Impact Error]');
  }
}
