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

export async function getCollections() {
  if (process.env.MONGODB_URI) {
    try {
    await connectDB();
    const [docs, productDocs] = await Promise.all([
      Collection.find({ isActive: true }).select('-__v').sort({ orderIndex: 1 }).lean(),
      Product.find({ isActive: true }).select('-__v').lean(),
    ]);

    if (docs && docs.length > 0) {
      const sanitizedProducts = productDocs.map(sanitizeProduct);
      return docs.map((doc) => {
        const sanitized = sanitizeCollection(doc);
        const associated = sanitizedProducts.filter((p) =>
          sanitized.featuredProductIds?.includes(p.id) ||
          sanitized.featuredProductIds?.includes(p.legacyId) ||
          sanitized.featuredProductIds?.includes(p.slug)
        );
        return {
          ...sanitized,
          products: associated,
        };
      });
    }
    } catch (error) {
      console.error('[Database Error] MongoDB getCollections query failed. Falling back to static collections:', error);
    }
  }
  return staticCollections.map((col) => ({
    ...col,
    products: staticProducts.filter((p) => col.featuredProductIds?.includes(p.id)),
  }));
}

export async function getCollectionBySlug(slugOrId: string) {
  if (process.env.MONGODB_URI) {
    try {
    await connectDB();
    const doc = await Collection.findOne({
      $or: [{ slug: slugOrId }, { legacyId: slugOrId }],
      isActive: true,
    })
      .select('-__v')
      .lean();

    if (doc) {
      const sanitized = sanitizeCollection(doc);
      const productDocs = await Product.find({
        $or: [
          { legacyId: { $in: sanitized.featuredProductIds || [] } },
          { slug: { $in: sanitized.featuredProductIds || [] } },
        ],
        isActive: true,
      })
        .select('-__v')
        .lean();
      return {
        ...sanitized,
        products: productDocs.map(sanitizeProduct),
      };
    }
    } catch (error) {
      console.error(`[Database Error] MongoDB getCollectionBySlug('${slugOrId}') failed. Falling back to static collections:`, error);
    }
  }
  const found = staticCollections.find((c) => c.id === slugOrId || c.title?.toLowerCase() === slugOrId?.toLowerCase());
  if (found) {
    return {
      ...found,
      products: staticProducts.filter((p) => found.featuredProductIds?.includes(p.id)),
    };
  }
  return null;
}
