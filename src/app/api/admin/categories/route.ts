import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { slugify } from '@/lib/validations/product';
import { CategoryCreateSchema, normalizeSubcategoriesInput } from '@/lib/validations/category';
import { escapeRegex, revalidateCatalogPaths } from '@/lib/category-cleanup';

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
  } catch (error) {
    return handleApiError(error, 'Failed to fetch categories', '[Admin Categories GET Error]');
  }
}

export async function POST(request: NextRequest) {
  try {
    assertValidOrigin(request);
    await requireAdminSession(undefined, request);
    await connectDB();

    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    const validated = CategoryCreateSchema.parse(rawBody);
    const duplicateName = await Category.findOne({
      name: new RegExp(`^${escapeRegex(validated.name)}$`, 'i'),
    }).lean();

    if (duplicateName) {
      return NextResponse.json(
        {
          success: false,
          message: `A category named "${duplicateName.name}" already exists.`,
        },
        { status: 409 }
      );
    }

    const baseSlug = validated.slug || slugify(validated.name);
    let cleanSlug = baseSlug;
    let existing = await Category.findOne({ slug: cleanSlug });
    let count = 1;
    while (existing) {
      count++;
      cleanSlug = `${baseSlug}-${count}`;
      existing = await Category.findOne({ slug: cleanSlug });
    }

    const cleanSubcategories = normalizeSubcategoriesInput(validated.subcategories);

    let assignedOrder =
      typeof validated.orderIndex === 'number' && validated.orderIndex > 0
        ? validated.orderIndex
        : undefined;
    if (!assignedOrder) {
      const highest = await Category.findOne({}).sort({ orderIndex: -1 }).select('orderIndex').lean();
      assignedOrder = (highest?.orderIndex || 0) + 1;
    }

    const newCategory = await Category.create({
      name: validated.name,
      slug: cleanSlug,
      title: validated.title || validated.name,
      description: validated.description || `Handcrafted ${validated.name} by MNC LifeStyle.`,
      image: validated.image || '/hero-bg.webp',
      imageKey: validated.imageKey || undefined,
      subcategories: cleanSubcategories,
      orderIndex: assignedOrder,
      isActive: validated.isActive ?? true,
    });

    revalidateCatalogPaths([newCategory.slug]);

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
  } catch (error) {
    return handleApiError(error, 'Failed to create category', '[Admin Categories POST Error]');
  }
}
