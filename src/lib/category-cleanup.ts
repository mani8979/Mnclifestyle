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
  category: { slug?: string; legacyId?: string | null },
  subCategory?: string
) {
  const categoryKeys = Array.from(
    new Set(
      [category.slug, category.legacyId]
        .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
        .map((v) => v.trim())
    )
  );

  const query: any = {
    isArchived: { $ne: true },
    category: { $in: categoryKeys },
  };

  if (subCategory && subCategory.trim()) {
    query.subCategory = new RegExp(`^${escapeRegex(subCategory.trim())}$`, 'i');
  }

  return query;
}

export async function findAffectedProducts(
  category: { slug?: string; legacyId?: string | null },
  subCategory?: string
) {
  const query = buildCategoryProductQuery(category, subCategory);
  return Product.find(query)
    .select('_id sku legacyId slug name category categoryLabel subCategory price isActive images colorGroupId')
    .sort({ updatedAt: -1 })
    .lean();
}

export async function deleteProductsAndCleanupRefs(products: any[]) {
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
  }

  const deleteRes = await Product.deleteMany({ _id: { $in: productIds } });

  for (const gid of groupIds) {
    await cleanupSingletonColorGroup(gid);
  }

  if (refs.length > 0) {
    await Collection.updateMany({}, { $pull: { featuredProductIds: { $in: refs } } });
  }

  return deleteRes.deletedCount || 0;
}

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

export function revalidateCatalogPaths(extraCategorySlugs: string[] = []) {
  try {
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/inventory');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/collections');
    for (const slug of extraCategorySlugs) {
      if (slug) {
        revalidatePath(`/category/${slug}`);
      }
    }
  } catch {
    // Non-blocking in non-Next script environments
  }
}
