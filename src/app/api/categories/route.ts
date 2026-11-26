import { NextResponse } from 'next/server';
import { getCategories } from '@/services/categoryService';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({
      success: true,
      count: categories.length,
      total: categories.length,
      categories,
      data: categories,
    });
  } catch (error) {
    console.error('[Public Categories GET Error]:', error);
    return NextResponse.json({ success: false, message: 'Failed to load categories' }, { status: 500 });
  }
}
