import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { products as staticProducts, findProductById as findStaticProductById, slugify } from '@/data/products';

export interface GetProductsOptions {
  category?: string;
  subCategory?: string;
  isBestseller?: boolean;
  isFeatured?: boolean;
  limit?: number;
  sort?: 'price-low' | 'price-high' | 'rating' | 'featured' | 'newest';
  search?: string;
}

export function sanitizeProduct(doc: any) {
  if (!doc) return null;
  // Convert any Mongoose/BSON objects to plain JSON object for Next.js Server Components
  const clean = JSON.parse(JSON.stringify(doc));
  const { __v, _id, costPrice, ...rest } = clean;
  if (Array.isArray(rest.customSections)) {
    rest.customSections = rest.customSections.map((sec: any) => ({
      title: sec.title || '',
      content: sec.content || '',
      icon: sec.icon || 'check',
    }));
  }
  return {
    ...rest,
    id: clean.legacyId || clean.id || _id?.toString(),
    slug: clean.slug || slugify(clean.name),
    sku: clean.sku,
  };
}

export async function getProducts(options: GetProductsOptions = {}) {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const query: any = { isActive: true, isArchived: { $ne: true } };

      if (options.category && options.category !== 'all') {
        query.$or = [{ category: options.category }, { categoryLabel: options.category }];
      }

      if (options.subCategory && options.subCategory !== 'all') {
        query.subCategory = options.subCategory;
      }

      if (options.isBestseller) {
        query.isBestseller = true;
      }

      if (options.isFeatured) {
        query.isFeatured = true;
      }

      if (options.search) {
        const q = options.search.trim();
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { shortDescription: { $regex: q, $options: 'i' } },
          { categoryLabel: { $regex: q, $options: 'i' } },
          { materials: { $elemMatch: { $regex: q, $options: 'i' } } },
        ];
      }

      let mQuery = Product.find(query).select('-__v');

      if (options.sort === 'price-low') {
        mQuery = mQuery.sort({ price: 1 });
      } else if (options.sort === 'price-high') {
        mQuery = mQuery.sort({ price: -1 });
      } else if (options.sort === 'rating') {
        mQuery = mQuery.sort({ rating: -1 });
      } else if (options.sort === 'newest') {
        mQuery = mQuery.sort({ createdAt: -1 });
      } else {
        mQuery = mQuery.sort({ isFeatured: -1, isBestseller: -1 });
      }

      if (typeof options.limit === 'number' && options.limit > 0) {
        mQuery = mQuery.limit(options.limit);
      }

      const docs = await mQuery.lean();

      if (docs && docs.length > 0) {
        return docs.map(sanitizeProduct);
      }
    } catch (error) {
      console.error('[Database Error] MongoDB getProducts query failed. Falling back to static products:', error);
    }
  }

  // Controlled static fallback
  let list = [...staticProducts];
  if (options.category && options.category !== 'all') {
    list = list.filter((p) => p.category === options.category);
  }
  if (options.isBestseller) {
    list = list.filter((p) => p.isBestseller);
  }
  if (options.isFeatured) {
    list = list.filter((p) => p.isFeatured);
  }
  if (options.limit) {
    list = list.slice(0, options.limit);
  }
  return list;
}

export async function getProductByIdOrSlug(idOrSlug: string) {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const doc = await Product.findOne({
        $or: [
          { slug: idOrSlug },
          { legacyId: idOrSlug },
          { sku: idOrSlug.toUpperCase() },
        ],
        isActive: true,
        isArchived: { $ne: true },
      })
        .select('-__v')
        .lean();

      if (doc) {
        return sanitizeProduct(doc);
      }
    } catch (error) {
      console.error(`[Database Error] MongoDB getProductByIdOrSlug('${idOrSlug}') failed. Falling back to static products:`, error);
    }
  }

  // Controlled static fallback
  return findStaticProductById(idOrSlug) || null;
}
