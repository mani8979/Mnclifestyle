import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Collection } from '@/models/Collection';
import { Product } from '@/models/Product';
import { sanitizeProduct } from '@/services/productService';
import { collections as staticCollections } from '@/data/collections';
import { products as staticProducts } from '@/data/products';

export function sanitizeCollection(doc: any) {
  if (!doc) return null;
  const { __v, _id, ...rest } = doc;
  return {
    ...rest,
    id: doc.legacyId || doc.slug || doc.id || _id?.toString(),
    slug: doc.slug,
  };
}

function buildFeaturedProductsFilter(featuredIds: string[]) {
  const cleanIds = Array.from(new Set(featuredIds.map((id) => String(id || '').trim()).filter(Boolean)));
  if (cleanIds.length === 0) return null;

  const objectIds = cleanIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  const upperSkus = cleanIds.map((id) => id.toUpperCase());

  const orConditions: any[] = [
    { legacyId: { $in: cleanIds } },
    { slug: { $in: cleanIds } },
    { sku: { $in: upperSkus } },
  ];
  if (objectIds.length > 0) {
    orConditions.unshift({ _id: { $in: objectIds } });
  }

  return {
    isActive: true,
    isArchived: { $ne: true },
    $or: orConditions,
  };
}

function matchesFeaturedId(rawDoc: any, sanitized: any, idSet: Set<string>) {
  return (
    idSet.has(rawDoc._id?.toString()) ||
    idSet.has(sanitized.id) ||
    (sanitized.legacyId && idSet.has(sanitized.legacyId)) ||
    (sanitized.slug && idSet.has(sanitized.slug)) ||
    (sanitized.sku && idSet.has(sanitized.sku)) ||
    (sanitized.sku && idSet.has(sanitized.sku.toLowerCase()))
  );
}

export async function getCollections() {
  if (!process.env.MONGODB_URI) {
    return staticCollections.map((col) => ({
      ...col,
      products: staticProducts.filter((p) => col.featuredProductIds?.includes(p.id)),
    }));
  }

  await connectDB();
  const docs = await Collection.find({ isActive: true })
    .select('-__v')
    .sort({ orderIndex: 1, createdAt: 1 })
    .lean();
  if (!docs || docs.length === 0) {
    return [];
  }

  const allFeaturedIds = docs.flatMap((d: any) => d.featuredProductIds || []);
  const productFilter = buildFeaturedProductsFilter(allFeaturedIds);
  const rawProducts = productFilter
    ? await Product.find(productFilter).select('-__v').lean()
    : [];
  const pairs = (rawProducts as any[]).map((raw) => ({ raw, clean: sanitizeProduct(raw) }));

  return docs.map((doc: any) => {
    const sanitized = sanitizeCollection(doc);
    const featuredIds: string[] = (sanitized.featuredProductIds || [])
      .map((v: string) => String(v).trim())
      .filter(Boolean);
    const idSet = new Set<string>(featuredIds);
    const ordered: any[] = [];
    const seenIds = new Set<string>();

    // Preserve explicit featuredProductIds ordering while strictly filtering active non-archived products
    for (const fid of featuredIds) {
      const hit = pairs.find(({ raw, clean }) => matchesFeaturedId(raw, clean, new Set([fid])));
      if (hit && !seenIds.has(hit.clean.id)) {
        seenIds.add(hit.clean.id);
        ordered.push(hit.clean);
      }
    }
    for (const { raw, clean } of pairs) {
      if (!seenIds.has(clean.id) && matchesFeaturedId(raw, clean, idSet)) {
        seenIds.add(clean.id);
        ordered.push(clean);
      }
    }

    return {
      ...sanitized,
      products: ordered,
    };
  });
}

export async function getCollectionBySlug(slugOrId: string) {
  if (!process.env.MONGODB_URI) {
    const found = staticCollections.find(
      (c) => c.id === slugOrId || c.title?.toLowerCase() === slugOrId?.toLowerCase()
    );
    if (!found) return null;
    return {
      ...found,
      products: staticProducts.filter((p) => found.featuredProductIds?.includes(p.id)),
    };
  }

  await connectDB();
  const decoded = decodeURIComponent(slugOrId || '').trim();
  const orQueries: any[] = [{ slug: decoded.toLowerCase() }, { legacyId: decoded }];
  if (mongoose.Types.ObjectId.isValid(decoded)) {
    orQueries.unshift({ _id: new mongoose.Types.ObjectId(decoded) });
  }

  const doc = await Collection.findOne({
    $or: orQueries,
    isActive: true,
  })
    .select('-__v')
    .lean();

  if (!doc) {
    return null;
  }

  const sanitized = sanitizeCollection(doc);
  const featuredIds: string[] = (sanitized.featuredProductIds || [])
    .map((v: string) => String(v).trim())
    .filter(Boolean);
  const productFilter = buildFeaturedProductsFilter(featuredIds);
  const productDocs = productFilter
    ? await Product.find(productFilter).select('-__v').lean()
    : [];

  const pairs = (productDocs as any[]).map((raw) => ({ raw, clean: sanitizeProduct(raw) }));
  const ordered: any[] = [];
  const seenIds = new Set<string>();
  for (const fid of featuredIds) {
    const hit = pairs.find(({ raw, clean }) => matchesFeaturedId(raw, clean, new Set([fid])));
    if (hit && !seenIds.has(hit.clean.id)) {
      seenIds.add(hit.clean.id);
      ordered.push(hit.clean);
    }
  }

  return {
    ...sanitized,
    products: ordered,
  };
}
