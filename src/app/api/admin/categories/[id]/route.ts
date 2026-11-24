import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { requireAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/validations/product';

export const dynamic = 'force-dynamic';

function getLookupQuery(id: string) {
  const decoded = decodeURIComponent(id).trim();
  const queries: any[] = [
    { slug: decoded },
    { slug: decoded.toLowerCase() },
    { legacyId: decoded },
    { name: new RegExp(`^${decoded}$`, 'i') },
  ];

  if (mongoose.Types.ObjectId.isValid(decoded)) {
    queries.unshift({ _id: new mongoose.Types.ObjectId(decoded) });
  }

  return { $or: queries };
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

    // Slug management: preserve existing slug if conflict exists so editing category never throws 409
    if (body.slug && typeof body.slug === 'string') {
      const cleanSlug = slugify(body.slug);
      if (cleanSlug && cleanSlug !== category.slug) {
        const conflict = await Category.findOne({ slug: cleanSlug, _id: { $ne: category._id } });
        if (!conflict) {
          const oldSlug = category.slug;
          category.slug = cleanSlug;
          try {
            await Product.updateMany(
              { category: oldSlug },
              { $set: { category: cleanSlug, categoryLabel: category.name } }
            );
          } catch (e) {
            console.error('Failed to sync products category:', e);
          }
        }
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

    // Automatically re-index remaining categories sequentially (1, 2, 3...)
    const remainingCategories = await Category.find({})
      .sort({ orderIndex: 1, createdAt: 1 });

    for (let i = 0; i < remainingCategories.length; i++) {
      const cat = remainingCategories[i];
      if (cat.orderIndex !== i + 1) {
        cat.orderIndex = i + 1;
        await cat.save();
      }
    }

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
