import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { requireAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/validations/product';

export const dynamic = 'force-dynamic';

function getLookupQuery(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { _id: id };
  }
  return { $or: [{ slug: id }, { legacyId: id }] };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const category = await Category.findOne(getLookupQuery(id)).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        id: (category as any)._id.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const body = await request.json();

    const category = await Category.findOne(getLookupQuery(id));
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    if (body.name !== undefined) category.name = body.name.trim();
    if (body.title !== undefined) category.title = body.title.trim();
    if (body.description !== undefined) category.description = body.description.trim();
    if (body.image !== undefined) category.image = body.image.trim();
    if (body.orderIndex !== undefined) category.orderIndex = Number(body.orderIndex);
    if (body.isActive !== undefined) category.isActive = Boolean(body.isActive);

    if (body.name !== undefined && (!body.slug || body.slug.trim() === '')) {
      const cleanSlug = slugify(body.name);
      if (cleanSlug && cleanSlug !== category.slug) {
        const conflict = await Category.findOne({ slug: cleanSlug, _id: { $ne: category._id } });
        if (!conflict) {
          category.slug = cleanSlug;
        }
      }
    } else if (body.slug !== undefined) {
      const cleanSlug = body.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (cleanSlug && cleanSlug !== category.slug) {
        const conflict = await Category.findOne({ slug: cleanSlug, _id: { $ne: category._id } });
        if (conflict) {
          return NextResponse.json(
            { success: false, message: `Slug "${cleanSlug}" is already taken` },
            { status: 409 }
          );
        }
        category.slug = cleanSlug;
      }
    }

    if (body.subcategories !== undefined) {
      const cleanSubcategories = Array.isArray(body.subcategories)
        ? body.subcategories.map((s: string) => s.trim()).filter(Boolean)
        : typeof body.subcategories === 'string'
        ? body.subcategories.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      category.subcategories = cleanSubcategories;
    }

    await category.save();

    revalidatePath('/admin/categories');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/collections');
    revalidatePath(`/category/${category.slug}`);

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: {
        ...category.toObject(),
        id: category._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('PATCH /api/admin/categories/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const category = await Category.findOne(getLookupQuery(id));

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    await Category.deleteOne({ _id: category._id });

    revalidatePath('/admin/categories');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/collections');
    revalidatePath(`/category/${category.slug}`);

    return NextResponse.json({
      success: true,
      message: `Category "${category.name}" removed successfully`,
    });
  } catch (error: any) {
    console.error('DELETE /api/admin/categories/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}
