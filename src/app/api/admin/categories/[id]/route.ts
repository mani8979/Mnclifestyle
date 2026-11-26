import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { Collection } from '@/models/Collection';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { slugify } from '@/lib/validations/product';
import {
  CategoryDeleteBodySchema,
  CategoryUpdateSchema,
  normalizeSubcategoriesInput,
} from '@/lib/validations/category';
import {
  archiveProductsAndCleanupRefs,
  buildCategoryLookupQuery,
  buildCategoryProductQuery,
  escapeRegex,
  findAffectedProducts,
  reindexCategoriesSequentially,
  revalidateCatalogPaths,
  syncCategoryItemCounts,
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
  } catch (error) {
    return handleApiError(error, 'Failed to fetch category', '[Admin Category GET Error]');
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    assertValidOrigin(request);
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    const validated = CategoryUpdateSchema.parse(rawBody);

    const category = await Category.findOne(buildCategoryLookupQuery(id));
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    if (validated.name !== undefined) {
      const duplicateName = await Category.findOne({
        name: new RegExp(`^${escapeRegex(validated.name)}$`, 'i'),
        _id: { $ne: category._id },
      }).lean();
      if (duplicateName) {
        return NextResponse.json(
          { success: false, message: `Another category named "${duplicateName.name}" already exists.` },
          { status: 409 }
        );
      }
      category.name = validated.name;
    }

    if (validated.title !== undefined) category.title = validated.title;
    if (validated.description !== undefined) category.description = validated.description;
    if (validated.image !== undefined) category.image = validated.image;
    if (validated.imageKey !== undefined) category.imageKey = validated.imageKey;
    if (validated.orderIndex !== undefined) category.orderIndex = validated.orderIndex;
    if (validated.isActive !== undefined) category.isActive = validated.isActive;

    const oldSlug = category.slug;

    if (validated.slug) {
      const cleanSlug = slugify(validated.slug);
      if (cleanSlug && cleanSlug !== category.slug) {
        const conflict = await Category.findOne({ slug: cleanSlug, _id: { $ne: category._id } });
        if (conflict) {
          return NextResponse.json(
            { success: false, message: `Slug "${cleanSlug}" is already used by another category.` },
            { status: 409 }
          );
        }
        category.slug = cleanSlug;
        const legacyMatchQuery = buildCategoryProductQuery({
          slug: oldSlug,
          legacyId: category.legacyId,
          name: category.name,
        });
        await Product.updateMany(legacyMatchQuery, {
          $set: { category: cleanSlug, categoryLabel: category.name },
        });
        await Collection.updateMany(
          { category: oldSlug },
          { $set: { category: cleanSlug } }
        );
      }
    }

    if (validated.subcategories !== undefined) {
      const cleanSubcategories = normalizeSubcategoriesInput(validated.subcategories);
      const nextSet = new Set(cleanSubcategories.map((s) => s.toLowerCase()));
      const removedSubcategories = (category.subcategories || []).filter(
        (existingSub: string) => !nextSet.has(existingSub.toLowerCase())
      );

      if (removedSubcategories.length > 0 && !validated.forceRemoveSubcategories) {
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

    if (validated.name !== undefined) {
      await Product.updateMany(buildCategoryProductQuery(category), {
        $set: { categoryLabel: category.name },
      });
    }

    await category.save();
    await syncCategoryItemCounts();
    revalidateCatalogPaths([oldSlug, category.slug]);

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: {
        ...category.toObject(),
        id: category._id.toString(),
      },
    });
  } catch (error) {
    return handleApiError(error, 'Failed to update category', '[Admin Category PATCH Error]');
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    assertValidOrigin(request);
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

    const rawBody = await request.json().catch(() => ({}));
    const parsedBody = CategoryDeleteBodySchema.safeParse(rawBody && typeof rawBody === 'object' ? rawBody : {});
    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid delete request payload' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = (parsedBody.data.action || searchParams.get('action') || undefined) as
      | 'transfer'
      | 'delete-all'
      | undefined;
    const targetCategoryId =
      parsedBody.data.targetCategoryId ||
      searchParams.get('targetCategoryId')?.trim() ||
      '';
    const targetSubCategory =
      parsedBody.data.targetSubCategory ||
      searchParams.get('targetSubCategory')?.trim() ||
      '';

    const affectedProducts = await findAffectedProducts(category);
    let transferredCount = 0;
    let archivedCount = 0;
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

        await Collection.updateMany(
          { category: category.slug },
          { $set: { category: targetCategory.slug } }
        );
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
            message: `${affectedProducts.length} product(s) belong to "${category.name}". Choose to transfer or delete them first.`,
          },
          { status: 409 }
        );
      }
    }

    // Refuse removing category if any Collection still references this category slug (transfer updated it above)
    await Category.deleteOne({ _id: category._id });
    await reindexCategoriesSequentially();
    await syncCategoryItemCounts();

    revalidateCatalogPaths([category.slug, targetCategorySlug]);

    return NextResponse.json({
      success: true,
      transferredCount,
      deletedCount: archivedCount,
      message:
        transferredCount > 0
          ? `Category "${category.name}" removed and ${transferredCount} product(s) transferred`
          : archivedCount > 0
            ? `Category "${category.name}" removed and ${archivedCount} product(s) archived safely`
            : `Category "${category.name}" removed successfully`,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to delete category', '[Admin Category DELETE Error]');
  }
}
