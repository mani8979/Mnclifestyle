import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { products as staticProducts, findProductById as findStaticProductById, slugify } from '@/data/products';
import { escapeRegex } from '@/lib/category-cleanup';
import {
  getCategoryKeySet,
  getColorVariantsForProduct,
  serializeColorVariantSummary,
} from '@/lib/color-variants';

export interface GetProductsOptions {
  category?: string;
  subCategory?: string;
  color?: string;
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
      const andConditions: any[] = [{ isActive: true, isArchived: { $ne: true } }];

      if (options.category && options.category !== 'all') {
        const catKeys = await getCategoryKeySet(options.category);
        andConditions.push({
          $or: [{ category: { $in: catKeys } }, { categoryLabel: { $in: catKeys } }],
        });
      }

      if (options.subCategory && options.subCategory !== 'all') {
        andConditions.push({
          subCategory: new RegExp(`^${escapeRegex(options.subCategory.trim())}$`, 'i'),
        });
      }

      if (options.color && options.color !== 'all') {
        const colorRegex = new RegExp(`^${escapeRegex(options.color.trim())}$`, 'i');
        andConditions.push({
          $or: [{ colorName: colorRegex }, { 'colors.name': colorRegex }],
        });
      }

      if (options.isBestseller) {
        andConditions.push({ isBestseller: true });
      }

      if (options.isFeatured) {
        andConditions.push({ isFeatured: true });
      }

      if (options.search) {
        const q = options.search.trim();
        andConditions.push({
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { shortDescription: { $regex: q, $options: 'i' } },
            { categoryLabel: { $regex: q, $options: 'i' } },
            { colorName: { $regex: q, $options: 'i' } },
            { materials: { $elemMatch: { $regex: q, $options: 'i' } } },
          ],
        });
      }

      const query: any = andConditions.length === 1 ? andConditions[0] : { $and: andConditions };

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
        const groupIds = Array.from(
          new Set(
            docs
              .map((d: any) => (typeof d.colorGroupId === 'string' ? d.colorGroupId.trim() : ''))
              .filter(Boolean)
          )
        );

        const groupMembersMap = new Map<string, any[]>();
        if (groupIds.length > 0) {
          const allGroupDocs = await Product.find({
            colorGroupId: { $in: groupIds },
            isActive: true,
            isArchived: { $ne: true },
          })
            .select(
              '_id legacyId sku slug name colorName colorHex colorGroupId colors price originalPrice images inStock trackInventory allowBackorders availableQuantity stockQuantity isActive category subCategory createdAt'
            )
            .sort({ createdAt: 1 })
            .lean();

          for (const member of allGroupDocs as any[]) {
            const gid = (member.colorGroupId || '').trim();
            if (!gid) continue;
            const list = groupMembersMap.get(gid) || [];
            list.push(member);
            groupMembersMap.set(gid, list);
          }
        }

        return docs.map((doc: any) => {
          const sanitized = sanitizeProduct(doc);
          const gid = typeof doc.colorGroupId === 'string' ? doc.colorGroupId.trim() : '';
          if (gid && groupMembersMap.has(gid)) {
            const subLower = (doc.subCategory || '').trim().toLowerCase();
            const catLower = (doc.category || '').trim().toLowerCase();
            const matchingSiblings = (groupMembersMap.get(gid) || []).filter(
              (m: any) =>
                (m.category || '').trim().toLowerCase() === catLower &&
                (m.subCategory || '').trim().toLowerCase() === subLower
            );
            sanitized.colorVariants =
              matchingSiblings.length > 1
                ? matchingSiblings.map(serializeColorVariantSummary)
                : [];
          } else {
            sanitized.colorVariants = [];
          }
          return sanitized;
        });
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
  if (options.subCategory && options.subCategory !== 'all') {
    const subLower = options.subCategory.trim().toLowerCase();
    list = list.filter((p) => (p.subCategory || '').toLowerCase() === subLower);
  }
  if (options.color && options.color !== 'all') {
    const colorLower = options.color.trim().toLowerCase();
    list = list.filter((p: any) =>
      p.colors?.some((c: any) => c.name?.toLowerCase() === colorLower)
    );
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
        const sanitized = sanitizeProduct(doc);
        sanitized.colorVariants = await getColorVariantsForProduct(sanitized);
        return sanitized;
      }
    } catch (error) {
      console.error(`[Database Error] MongoDB getProductByIdOrSlug('${idOrSlug}') failed. Falling back to static products:`, error);
    }
  }

  // Controlled static fallback
  return findStaticProductById(idOrSlug) || null;
}
