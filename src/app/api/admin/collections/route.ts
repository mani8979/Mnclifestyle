import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Collection } from '@/models/Collection';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { slugify } from '@/lib/validations/product';
import {
  CollectionCreateSchema,
  normalizeCollectionStringList,
} from '@/lib/validations/collection';
import { escapeRegex, revalidateCatalogPaths } from '@/lib/category-cleanup';
import {
  resolveCanonicalFeaturedProductSlugs,
  resolveCategoryForCollection,
} from '@/lib/collection-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(undefined, request);
    await connectDB();

    const collections = await Collection.find({})
      .sort({ orderIndex: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      collections: collections.map((c: any) => ({
        ...c,
        id: c._id.toString(),
      })),
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch collections', '[Admin Collections GET Error]');
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

    const validated = CollectionCreateSchema.parse(rawBody);

    const duplicateTitle = await Collection.findOne({
      title: new RegExp(`^${escapeRegex(validated.title)}$`, 'i'),
    }).lean();

    if (duplicateTitle) {
      return NextResponse.json(
        {
          success: false,
          message: `A collection titled "${duplicateTitle.title}" already exists.`,
        },
        { status: 409 }
      );
    }

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

    let cleanSlug = validated.slug || slugify(validated.title);
    if (!cleanSlug) {
      cleanSlug = `collection-${Date.now()}`;
    }

    if (validated.slug) {
      const slugConflict = await Collection.findOne({ slug: cleanSlug }).select('_id').lean();
      if (slugConflict) {
        return NextResponse.json(
          {
            success: false,
            message: `Collection slug "${cleanSlug}" is already in use.`,
          },
          { status: 409 }
        );
      }
    } else {
      const baseSlug = cleanSlug;
      let existingSlug = await Collection.findOne({ slug: cleanSlug }).select('_id').lean();
      let suffix = 1;
      while (existingSlug) {
        suffix++;
        cleanSlug = `${baseSlug}-${suffix}`;
        existingSlug = await Collection.findOne({ slug: cleanSlug }).select('_id').lean();
      }
    }

    const featuredProductIds = await resolveCanonicalFeaturedProductSlugs(
      validated.featuredProductIds || []
    );
    const materials = normalizeCollectionStringList(validated.materials);

    let assignedOrder =
      typeof validated.orderIndex === 'number' && validated.orderIndex > 0
        ? validated.orderIndex
        : undefined;
    if (!assignedOrder) {
      const highest = await Collection.findOne({})
        .sort({ orderIndex: -1 })
        .select('orderIndex')
        .lean();
      assignedOrder = (highest?.orderIndex || 0) + 1;
    }

    const seoMeta = validated.seoMeta
      ? {
          title: validated.seoMeta.title || '',
          description: validated.seoMeta.description || '',
          keywords: normalizeCollectionStringList(validated.seoMeta.keywords),
        }
      : { title: '', description: '', keywords: [] };

    const newCollection = await Collection.create({
      slug: cleanSlug,
      legacyId: validated.legacyId ?? cleanSlug,
      title: validated.title,
      category: categoryDoc.slug,
      subtitle: validated.subtitle || '',
      tagline: validated.tagline || '',
      description: validated.description,
      image: validated.image,
      imageKey: validated.imageKey || '',
      materials,
      piecesCount: validated.piecesCount || '',
      featuredProductIds,
      orderIndex: assignedOrder,
      isActive: validated.isActive ?? true,
      seoMeta,
    });

    revalidateCatalogPaths([categoryDoc.slug], featuredProductIds, [newCollection.slug]);

    return NextResponse.json(
      {
        success: true,
        message: 'Collection created successfully',
        collection: {
          ...newCollection.toObject(),
          id: newCollection._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'Failed to create collection', '[Admin Collections POST Error]');
  }
}
