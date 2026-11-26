import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { Collection } from '@/models/Collection';
import { cleanupSingletonColorGroup } from '@/lib/color-variants';

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildCategoryLookupQuery(id: string) {
  const decoded = decodeURIComponent(id).trim();
  const escaped = escapeRegex(decoded);
  const queries: any[] = [
    { slug: decoded },
    { slug: decoded.toLowerCase() },
    { legacyId: decoded },
    { name: new RegExp(`^${escaped}$`, 'i') },
  ];

  if (mongoose.Types.ObjectId.isValid(decoded)) {
    queries.unshift({ _id: new mongoose.Types.ObjectId(decoded) });
  }

  return { $or: queries };
}

export function buildCategoryProductQuery(
  category: { slug?: string; legacyId?: string | null; name?: string | null },
  subCategory?: string
) {
  const rawKeys = [category.slug, category.legacyId, category.name]
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map((v) => v.trim());

  const seenLower = new Set<string>();
  const categoryMatchers: RegExp[] = [];
  for (const key of rawKeys) {
    const lower = key.toLowerCase();
    if (seenLower.has(lower)) continue;
    seenLower.add(lower);
    categoryMatchers.push(new RegExp(`^${escapeRegex(key)}$`, 'i'));
  }

  const query: any = {
    isArchived: { $ne: true },
    category: categoryMatchers.length > 0 ? { $in: categoryMatchers } : { $in: [] },
  };

  if (subCategory && subCategory.trim()) {
    query.subCategory = new RegExp(`^${escapeRegex(subCategory.trim())}$`, 'i');
  }

  return query;
}

export async function findAffectedProducts(
  category: { slug?: string; legacyId?: string | null; name?: string | null },
  subCategory?: string
) {
  const query = buildCategoryProductQuery(category, subCategory);
  return Product.find(query)
    .select('_id sku legacyId slug name category categoryLabel subCategory price isActive images colorGroupId')
    .sort({ updatedAt: -1 })
    .lean();
}

/**
 * Recompute and synchronize stored Category.itemCount from active, non-archived Product documents.
 */
export async function syncCategoryItemCounts() {
  const [categories, countRows] = await Promise.all([
    Category.find({}).select('_id slug legacyId name itemCount').lean(),
    Product.aggregate([
      { $match: { isArchived: { $ne: true }, isActive: true } },
      { $group: { _id: { $toLower: '$category' }, count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map<string, number>();
  for (const row of countRows) {
    if (typeof row._id === 'string') {
      countMap.set(row._id, row.count || 0);
    }
  }

  const bulkOps: any[] = [];
  for (const cat of categories as any[]) {
    const candidateKeys = Array.from(
      new Set(
        [cat.slug, cat.legacyId, cat.name]
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
          .map((v) => v.trim().toLowerCase())
      )
    );
    const actualCount = candidateKeys.reduce((sum, key) => sum + (countMap.get(key) || 0), 0);
    if (cat.itemCount !== actualCount) {
      bulkOps.push({
        updateOne: {
          filter: { _id: cat._id },
          update: { $set: { itemCount: actualCount } },
        },
      });
    }
  }

  if (bulkOps.length > 0) {
    await Category.bulkWrite(bulkOps);
  }
}

/**
 * Soft-archive products cleanly so historical InventoryMovement rows are preserved without orphans,
 * while detaching color groups, collection featured references, and syncing category counts.
 */
export async function archiveProductsAndCleanupRefs(products: any[]) {
  if (!Array.isArray(products) || products.length === 0) {
    return 0;
  }

  const productIds = products.map((p) => p._id);
  const groupIds = Array.from(
    new Set(
      products
        .map((p) => (typeof p.colorGroupId === 'string' ? p.colorGroupId.trim() : ''))
        .filter(Boolean)
    )
  );
  const refs: string[] = [];
  for (const p of products) {
    if (p._id) refs.push(p._id.toString());
    if (p.legacyId) refs.push(p.legacyId);
    if (p.slug) refs.push(p.slug);
    if (p.sku) refs.push(p.sku);
  }

  const archiveRes = await Product.updateMany(
    { _id: { $in: productIds } },
    { $set: { isArchived: true, isActive: false, colorGroupId: '' } }
  );

  for (const gid of groupIds) {
    await cleanupSingletonColorGroup(gid);
  }

  if (refs.length > 0) {
    await Collection.updateMany({}, { $pull: { featuredProductIds: { $in: refs } } });
  }

  await syncCategoryItemCounts();

  return archiveRes.modifiedCount || productIds.length;
}

export const deleteProductsAndCleanupRefs = archiveProductsAndCleanupRefs;

export async function reindexCategoriesSequentially() {
  const remainingCategories = await Category.find({}).sort({ orderIndex: 1, createdAt: 1 });
  for (let i = 0; i < remainingCategories.length; i++) {
    const cat = remainingCategories[i];
    if (cat.orderIndex !== i + 1) {
      cat.orderIndex = i + 1;
      await cat.save();
    }
  }
}

export function revalidateCatalogPaths(
  extraCategorySlugs: string[] = [],
  extraProductSlugs: string[] = []
) {
  try {
    // Revalidate layout root so Header and Footer live category menus refresh immediately
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/search');
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');

    for (const slug of Array.from(new Set(extraCategorySlugs))) {
      if (slug) revalidatePath(`/category/${slug}`);
    }
    for (const slug of Array.from(new Set(extraProductSlugs))) {
      if (slug) revalidatePath(`/product/${slug}`);
    }
  } catch {
    // Non-blocking in non-Next script environments
  }
}
