import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { SubcategoryRemoveSchema } from '@/lib/validations/category';
import { cleanupSingletonColorGroup } from '@/lib/color-variants';
import {
  archiveProductsAndCleanupRefs,
  buildCategoryLookupQuery,
  buildCategoryProductQuery,
  findAffectedProducts,
  revalidateCatalogPaths,
  syncCategoryItemCounts,
} from '@/lib/category-cleanup';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    assertValidOrigin(request);
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const rawBody = await request.json().catch(() => null);
    const parsed = SubcategoryRemoveSchema.safeParse(rawBody && typeof rawBody === 'object' ? rawBody : {});
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || 'Subcategory removal payload invalid' },
        { status: 400 }
      );
    }

    const { subCategory, action, targetCategoryId, targetSubCategory: targetSubCategoryInput } = parsed.data;

    const category = await Category.findOne(buildCategoryLookupQuery(id));
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    const affectedProducts = await findAffectedProducts(category, subCategory);
    let transferredCount = 0;
    let archivedCount = 0;
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
        if (isSameCategory && (targetSubCategoryInput || '').toLowerCase() === subCategory.toLowerCase()) {
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

        // Clean singleton color groups if products moved into a new category/subcategory split
        if (!isSameCategory) {
          const groupIds = Array.from(
            new Set(
              affectedProducts
                .map((p: any) => (typeof p.colorGroupId === 'string' ? p.colorGroupId.trim() : ''))
                .filter(Boolean)
            )
          );
          for (const gid of groupIds) {
            await cleanupSingletonColorGroup(gid);
          }
        }

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
        archivedCount = await archiveProductsAndCleanupRefs(affectedProducts);
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
    await syncCategoryItemCounts();

    revalidateCatalogPaths([category.slug, targetCategorySlug]);

    return NextResponse.json({
      success: true,
      message:
        transferredCount > 0
          ? `Removed "${subCategory}" and transferred ${transferredCount} product(s)`
          : archivedCount > 0
            ? `Removed "${subCategory}" and archived ${archivedCount} product(s)`
            : `Removed "${subCategory}" from ${category.name}`,
      transferredCount,
      deletedCount: archivedCount,
      category: {
        ...category.toObject(),
        id: category._id.toString(),
      },
    });
  } catch (error) {
    return handleApiError(error, 'Failed to remove subcategory', '[Subcategory Remove Error]');
  }
}

