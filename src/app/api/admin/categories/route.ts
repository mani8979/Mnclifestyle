import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { requireAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/validations/product';

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
    const { name, slug, title, description, image, imageKey, subcategories, orderIndex } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    let cleanSlug = (slug || slugify(name));
    let existing = await Category.findOne({ slug: cleanSlug });
    let count = 1;
    while (existing) {
      count++;
      cleanSlug = `${slug || slugify(name)}-${count}`;
      existing = await Category.findOne({ slug: cleanSlug });
    }

    const cleanSubcategories = Array.isArray(subcategories)
      ? subcategories.map((s: string) => s.trim()).filter(Boolean)
      : typeof subcategories === 'string'
      ? subcategories.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    // Ensure sequential unique orderIndex if not explicitly given or <= 0
    let assignedOrder = typeof orderIndex === 'number' && orderIndex > 0 ? orderIndex : undefined;
    if (!assignedOrder) {
      const highest = await Category.findOne({}).sort({ orderIndex: -1 }).select('orderIndex').lean();
      assignedOrder = (highest?.orderIndex || 0) + 1;
    }

    const newCategory = await Category.create({
      name: name.trim(),
      slug: cleanSlug,
      title: title?.trim() || name.trim(),
      description: description?.trim() || `Handcrafted ${name.trim()} by MNC LifeStyle.`,
      image: image?.trim() || '/hero-bg.webp',
      imageKey: imageKey?.trim() || undefined,
      subcategories: cleanSubcategories,
      orderIndex: assignedOrder,
      isActive: true,
    });

    revalidatePath('/admin/categories');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/collections');
    revalidatePath(`/category/${newCategory.slug}`);

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
