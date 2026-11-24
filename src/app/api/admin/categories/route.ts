import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const categories = await Category.find({})
      .sort({ orderIndex: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      categories: categories.map((c: any) => ({
        ...c,
        id: c._id.toString(),
      })),
    });
  } catch (error: any) {
    console.error('GET /api/admin/categories error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch categories' },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const body = await request.json();
    const { name, slug, title, description, image, subcategories, orderIndex } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await Category.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Category with slug "${cleanSlug}" already exists` },
        { status: 409 }
      );
    }

    const cleanSubcategories = Array.isArray(subcategories)
      ? subcategories.map((s: string) => s.trim()).filter(Boolean)
      : typeof subcategories === 'string'
      ? subcategories.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const newCategory = await Category.create({
      name: name.trim(),
      slug: cleanSlug,
      title: title?.trim() || name.trim(),
      description: description?.trim() || `Handcrafted ${name.trim()} by MNC LifeStyle.`,
      image: image?.trim() || '/hero-bg.webp',
      subcategories: cleanSubcategories,
      orderIndex: typeof orderIndex === 'number' ? orderIndex : 0,
      isActive: true,
    });

    revalidatePath('/admin/categories');
    revalidatePath('/');
    revalidatePath('/shop');

    return NextResponse.json(
      {
        success: true,
        message: 'Category created successfully',
        category: {
          ...newCategory.toObject(),
          id: newCategory._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/admin/categories error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create category' },
      { status: error.status || 500 }
    );
  }
}
