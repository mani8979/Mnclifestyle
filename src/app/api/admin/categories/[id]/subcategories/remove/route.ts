import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { requireAdminSession } from '@/lib/auth';
import {
  buildCategoryLookupQuery,
  buildCategoryProductQuery,
  deleteProductsAndCleanupRefs,
  findAffectedProducts,
  revalidateCatalogPaths,
} from '@/lib/category-cleanup';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const subCategory = typeof body?.subCategory === 'string' ? body.subCategory.trim() : '';
    const action = body?.action as 'transfer' | 'delete-all' | undefined;
    const targetCategoryId = typeof body?.targetCategoryId === 'string' ? body.targetCategoryId.trim() : '';
    const targetSubCategoryInput =
      typeof body?.targetSubCategory === 'string' ? body.targetSubCategory.trim() : '';

    if (!subCategory) {
      return NextResponse.json(
        { success: false, message: 'Subcategory name is required' },
        { status: 400 }
      );
    }

    const category = await Category.findOne(buildCategoryLookupQuery(id));
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    const affectedProducts = await findAffectedProducts(category, subCategory);
    let transferredCount = 0;
    let deletedCount = 0;
    let targetCategorySlug = '';
    let resolvedTargetSubCategory = '';

    if (affectedProducts.length > 0) {
      if (action === 'transfer') {
        const targetCategory = targetCategoryId
          ? await Category.findOne(buildCategoryLookupQuery(targetCategoryId))
          : category;

        if (!targetCategory) {
          return NextResponse.json(
            { success: false, message: 'Please select a valid destination category' },
            { status: 400 }
          );
        }

        const isSameCategory = targetCategory._id.toString() === category._id.toString();
        if (isSameCategory && targetSubCategoryInput.toLowerCase() === subCategory.toLowerCase()) {
          return NextResponse.json(
            {
              success: false,
              message: 'Destination subcategory must be different from the subcategory being removed',
            },
            { status: 400 }
          );
        }

        const fallbackTargetSub = isSameCategory
          ? (targetCategory.subcategories || []).find(
              (s: string) => s.toLowerCase() !== subCategory.toLowerCase()
            ) || targetCategory.name
          : targetCategory.subcategories?.[0] || targetCategory.name;

        resolvedTargetSubCategory = targetSubCategoryInput || fallbackTargetSub;
        targetCategorySlug = targetCategory.slug;

        const updateQuery = buildCategoryProductQuery(category, subCategory);
        const updateRes = await Product.updateMany(updateQuery, {
          $set: {
            category: targetCategory.slug,
            categoryLabel: targetCategory.name,
            subCategory: resolvedTargetSubCategory,
          },
        });
        transferredCount = updateRes.modifiedCount || affectedProducts.length;

        if (resolvedTargetSubCategory) {
          if (isSameCategory) {
            if (
              !category.subcategories.some(
                (s: string) => s.toLowerCase() === resolvedTargetSubCategory.toLowerCase()
              )
            ) {
              category.subcategories.push(resolvedTargetSubCategory);
            }
          } else {
            await Category.updateOne(
              { _id: targetCategory._id },
              { $addToSet: { subcategories: resolvedTargetSubCategory } }
            );
          }
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
            message: `${affectedProducts.length} product(s) belong to "${subCategory}". Choose to transfer or delete them first.`,
          },
          { status: 409 }
        );
      }
    }

    category.subcategories = (category.subcategories || []).filter(
      (s: string) => s.toLowerCase() !== subCategory.toLowerCase()
    );
    await category.save();

    revalidateCatalogPaths([category.slug, targetCategorySlug]);

    return NextResponse.json({
      success: true,
      message:
        transferredCount > 0
          ? `Removed "${subCategory}" and transferred ${transferredCount} product(s)`
          : deletedCount > 0
          ? `Removed "${subCategory}" and deleted ${deletedCount} product(s)`
          : `Removed "${subCategory}" from ${category.name}`,
      transferredCount,
      deletedCount,
      category: {
        ...category.toObject(),
        id: category._id.toString(),
      },
    });
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('POST /api/admin/categories/[id]/subcategories/remove error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to remove subcategory' },
      { status: 500 }
    );
  }
}
