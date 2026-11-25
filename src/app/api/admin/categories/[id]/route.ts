import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { requireAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/validations/product';
import {
  buildCategoryLookupQuery,
  buildCategoryProductQuery,
  deleteProductsAndCleanupRefs,
  findAffectedProducts,
  reindexCategoriesSequentially,
  revalidateCatalogPaths,
} from '@/lib/category-cleanup';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const category = await Category.findOne(buildCategoryLookupQuery(id)).lean();

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
    if (error.message?.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
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

    const category = await Category.findOne(buildCategoryLookupQuery(id));
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
    if (body.imageKey !== undefined) category.imageKey = body.imageKey.trim();
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

      const nextSet = new Set(cleanSubcategories.map((s: string) => s.toLowerCase()));
      const removedSubcategories = (category.subcategories || []).filter(
        (existingSub: string) => !nextSet.has(existingSub.toLowerCase())
      );

      if (removedSubcategories.length > 0 && !body.forceRemoveSubcategories) {
        for (const removedSub of removedSubcategories) {
          const affected = await findAffectedProducts(category, removedSub);
          if (affected.length > 0) {
            return NextResponse.json(
              {
                success: false,
                requiresAction: true,
                subCategory: removedSub,
                affectedCount: affected.length,
                message: `Subcategory "${removedSub}" has ${affected.length} product(s). Remove it via the popup to transfer or delete those products first.`,
              },
              { status: 409 }
            );
          }
        }
      }

      category.subcategories = cleanSubcategories;
    }

    // Keep categoryLabel synced on existing products if category name was edited
    if (body.name !== undefined) {
      const catKeys = [category.slug, category.legacyId].filter(
        (v): v is string => typeof v === 'string' && v.trim().length > 0
      );
      if (catKeys.length > 0) {
        await Product.updateMany(
          { category: { $in: catKeys } },
          { $set: { categoryLabel: category.name } }
        );
      }
    }

    await category.save();

    revalidateCatalogPaths([category.slug]);

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: {
        ...category.toObject(),
        id: category._id.toString(),
      },
    });
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
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
    const category = await Category.findOne(buildCategoryLookupQuery(id));

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    const action = (body?.action || searchParams.get('action') || undefined) as
      | 'transfer'
      | 'delete-all'
      | undefined;
    const targetCategoryId =
      (typeof body?.targetCategoryId === 'string' && body.targetCategoryId.trim()) ||
      searchParams.get('targetCategoryId')?.trim() ||
      '';
    const targetSubCategory =
      (typeof body?.targetSubCategory === 'string' && body.targetSubCategory.trim()) ||
      searchParams.get('targetSubCategory')?.trim() ||
      '';

    const affectedProducts = await findAffectedProducts(category);
    let transferredCount = 0;
    let deletedCount = 0;
    let targetCategorySlug = '';

    if (affectedProducts.length > 0) {
      if (action === 'transfer') {
        if (!targetCategoryId) {
          return NextResponse.json(
            { success: false, message: 'Please select a destination category for product transfer' },
            { status: 400 }
          );
        }

        const targetCategory = await Category.findOne(buildCategoryLookupQuery(targetCategoryId));
        if (!targetCategory || targetCategory._id.toString() === category._id.toString()) {
          return NextResponse.json(
            { success: false, message: 'Destination category must be another active category' },
            { status: 400 }
          );
        }

        targetCategorySlug = targetCategory.slug;

        const updateFields: Record<string, any> = {
          category: targetCategory.slug,
          categoryLabel: targetCategory.name,
        };
        if (targetSubCategory) {
          updateFields.subCategory = targetSubCategory;
        }

        const updateRes = await Product.updateMany(buildCategoryProductQuery(category), {
          $set: updateFields,
        });
        transferredCount = updateRes.modifiedCount || affectedProducts.length;

        if (targetSubCategory) {
          await Category.updateOne(
            { _id: targetCategory._id },
            { $addToSet: { subcategories: targetSubCategory } }
          );
        }
      } else if (action === 'delete-all') {
        deletedCount = await deleteProductsAndCleanupRefs(affectedProducts);
      } else {
        return NextResponse.json(
          {
            success: false,
            requiresAction: true,
            affectedCount: affectedProducts.length,
            products: affectedProducts.map((p: any) => ({
              _id: p._id.toString(),
              name: p.name,
              sku: p.sku,
            })),
            message: `${affectedProducts.length} product(s) belong to "${category.name}". Choose to transfer or delete them first.`,
          },
          { status: 409 }
        );
      }
    }

    await Category.deleteOne({ _id: category._id });
    await reindexCategoriesSequentially();

    revalidateCatalogPaths([category.slug, targetCategorySlug]);

    return NextResponse.json({
      success: true,
      transferredCount,
      deletedCount,
      message:
        transferredCount > 0
          ? `Category "${category.name}" removed and ${transferredCount} product(s) transferred`
          : deletedCount > 0
          ? `Category "${category.name}" and ${deletedCount} product(s) deleted`
          : `Category "${category.name}" removed successfully`,
    });
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('DELETE /api/admin/categories/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}
