import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Collection } from '@/models/Collection';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { slugify } from '@/lib/validations/product';
import {
  CollectionUpdateSchema,
  normalizeCollectionStringList,
} from '@/lib/validations/collection';
import { escapeRegex, revalidateCatalogPaths } from '@/lib/category-cleanup';
import {
  buildCollectionLookupQuery,
  resolveCanonicalFeaturedProductSlugs,
  resolveCategoryForCollection,
} from '@/lib/collection-helpers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const { id } = await context.params;
    const collection = await Collection.findOne(buildCollectionLookupQuery(id)).lean();

    if (!collection) {
      return NextResponse.json(
        { success: false, message: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      collection: {
        ...collection,
        id: (collection as any)._id.toString(),
      },
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch collection', '[Admin Collection GET Error]');
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

    const validated = CollectionUpdateSchema.parse(rawBody);
    const collection = await Collection.findOne(buildCollectionLookupQuery(id));
    if (!collection) {
      return NextResponse.json(
        { success: false, message: 'Collection not found' },
        { status: 404 }
      );
    }

    const oldSlug = collection.slug;
    const oldCategory = collection.category;
    const oldFeatured = [...(collection.featuredProductIds || [])];

    if (validated.title !== undefined) {
      const duplicateTitle = await Collection.findOne({
        title: new RegExp(`^${escapeRegex(validated.title)}$`, 'i'),
        _id: { $ne: collection._id },
      })
        .select('title')
        .lean();

      if (duplicateTitle) {
        return NextResponse.json(
          {
            success: false,
            message: `Another collection titled "${duplicateTitle.title}" already exists.`,
          },
          { status: 409 }
        );
      }
      collection.title = validated.title;
    }

    if (validated.slug !== undefined) {
      const nextSlug = slugify(validated.slug);
      if (nextSlug && nextSlug !== collection.slug) {
        const conflict = await Collection.findOne({
          slug: nextSlug,
          _id: { $ne: collection._id },
        })
          .select('_id')
          .lean();
        if (conflict) {
          return NextResponse.json(
            {
              success: false,
              message: `Collection slug "${nextSlug}" is already used by another collection.`,
            },
            { status: 409 }
          );
        }
        collection.slug = nextSlug;
      }
    }

    if (validated.category !== undefined) {
      const categoryDoc = await resolveCategoryForCollection(validated.category);
      if (!categoryDoc) {
        return NextResponse.json(
          {
            success: false,
            message: `Referenced category "${validated.category}" does not exist.`,
          },
          { status: 400 }
        );
      }
      collection.category = categoryDoc.slug;
    }

    if (validated.legacyId !== undefined) collection.legacyId = validated.legacyId ?? undefined;
    if (validated.subtitle !== undefined) collection.subtitle = validated.subtitle;
    if (validated.tagline !== undefined) collection.tagline = validated.tagline;
    if (validated.description !== undefined) collection.description = validated.description;
    if (validated.image !== undefined) collection.image = validated.image;
    if (validated.imageKey !== undefined) collection.imageKey = validated.imageKey;
    if (validated.piecesCount !== undefined) collection.piecesCount = validated.piecesCount;
    if (validated.orderIndex !== undefined) collection.orderIndex = validated.orderIndex;
    if (validated.isActive !== undefined) collection.isActive = validated.isActive;

    if (validated.materials !== undefined) {
      collection.materials = normalizeCollectionStringList(validated.materials);
    }

    if (validated.featuredProductIds !== undefined) {
      collection.featuredProductIds = await resolveCanonicalFeaturedProductSlugs(
        validated.featuredProductIds
      );
    }

    if (validated.seoMeta !== undefined) {
      const existingSeo =
        typeof (collection.seoMeta as any)?.toObject === 'function'
          ? (collection.seoMeta as any).toObject()
          : collection.seoMeta || {};
      collection.seoMeta = {
        ...existingSeo,
        ...(validated.seoMeta.title !== undefined ? { title: validated.seoMeta.title } : {}),
        ...(validated.seoMeta.description !== undefined
          ? { description: validated.seoMeta.description }
          : {}),
        ...(validated.seoMeta.keywords !== undefined
          ? { keywords: normalizeCollectionStringList(validated.seoMeta.keywords) }
          : {}),
      };
    }

    await collection.save();

    revalidateCatalogPaths(
      [oldCategory, collection.category],
      [...oldFeatured, ...(collection.featuredProductIds || [])],
      [oldSlug, collection.slug]
    );

    return NextResponse.json({
      success: true,
      message: 'Collection updated successfully',
      collection: {
        ...collection.toObject(),
        id: collection._id.toString(),
      },
    });
  } catch (error) {
    return handleApiError(error, 'Failed to update collection', '[Admin Collection PATCH Error]');
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
    const collection = await Collection.findOne(buildCollectionLookupQuery(id));
    if (!collection) {
      return NextResponse.json(
        { success: false, message: 'Collection not found' },
        { status: 404 }
      );
    }

    await Collection.deleteOne({ _id: collection._id });

    // Re-index remaining collections sequentially
    const remaining = await Collection.find({}).sort({ orderIndex: 1, createdAt: 1 });
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].orderIndex !== i + 1) {
        remaining[i].orderIndex = i + 1;
        await remaining[i].save();
      }
    }

    revalidateCatalogPaths(
      [collection.category],
      collection.featuredProductIds || [],
      [collection.slug]
    );

    return NextResponse.json({
      success: true,
      message: `Collection "${collection.title}" deleted successfully`,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to delete collection', '[Admin Collection DELETE Error]');
  }
}
