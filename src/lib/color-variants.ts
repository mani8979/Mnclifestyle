import mongoose from 'mongoose';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { escapeRegex } from '@/lib/category-cleanup';

export interface SerializedColorVariant {
  id: string;
  _id: string;
  slug: string;
  sku: string;
  name: string;
  colorName: string;
  colorHex: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  inStock: boolean;
  isActive: boolean;
  category: string;
  subCategory: string;
  colorGroupId: string;
}

export class ColorVariantValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ColorVariantValidationError';
    this.status = status;
  }
}

export async function getCategoryKeySet(categoryValue: string): Promise<string[]> {
  const raw = (categoryValue || '').trim();
  if (!raw) return [];

  const keys = new Set<string>([raw, raw.toLowerCase()]);
  const catDoc = await Category.findOne({
    $or: [
      { slug: raw },
      { slug: raw.toLowerCase() },
      { legacyId: raw },
      { name: new RegExp(`^${escapeRegex(raw)}$`, 'i') },
    ],
  })
    .select('slug legacyId name')
    .lean();

  if (catDoc) {
    if (catDoc.slug) keys.add(catDoc.slug);
    if (catDoc.legacyId) keys.add(catDoc.legacyId);
    if (catDoc.name) keys.add(catDoc.name);
  }

  return Array.from(keys);
}

export async function buildSameCategorySubcategoryQuery(
  categoryValue: string,
  subCategory: string
) {
  const categoryKeys = await getCategoryKeySet(categoryValue);
  const cleanSub = (subCategory || '').trim();

  const query: any = {
    isArchived: { $ne: true },
    category: { $in: categoryKeys },
  };

  if (cleanSub) {
    query.subCategory = new RegExp(`^${escapeRegex(cleanSub)}$`, 'i');
  }

  return query;
}

export function serializeColorVariantSummary(doc: any): SerializedColorVariant {
  const idStr = doc._id?.toString() || doc.id || '';
  const fallbackColor = Array.isArray(doc.colors) && doc.colors[0] ? doc.colors[0] : null;
  const colorName =
    (typeof doc.colorName === 'string' && doc.colorName.trim()) ||
    (typeof fallbackColor?.name === 'string' && fallbackColor.name.trim()) ||
    doc.name ||
    'Standard';
  const colorHex =
    (typeof doc.colorHex === 'string' && doc.colorHex.trim()) ||
    (typeof fallbackColor?.hex === 'string' && fallbackColor.hex.trim()) ||
    '#211710';

  const trackInventory = Boolean(doc.trackInventory);
  const allowBackorders = Boolean(doc.allowBackorders);
  const availableQty =
    typeof doc.availableQuantity === 'number'
      ? doc.availableQuantity
      : typeof doc.stockQuantity === 'number'
      ? doc.stockQuantity
      : 1;
  const inStock =
    doc.inStock !== false && (!trackInventory || allowBackorders || availableQty > 0);

  const images = Array.isArray(doc.images) ? doc.images.filter(Boolean) : [];

  return {
    id: doc.legacyId || idStr,
    _id: idStr,
    slug: doc.slug || '',
    sku: doc.sku || '',
    name: doc.name || '',
    colorName,
    colorHex,
    price: Number(doc.price) || 0,
    originalPrice: Number(doc.originalPrice) || 0,
    image: images[0] || '',
    images,
    inStock,
    isActive: doc.isActive !== false,
    category: doc.category || '',
    subCategory: doc.subCategory || '',
    colorGroupId: doc.colorGroupId || '',
  };
}

export async function cleanupSingletonColorGroup(groupId?: string | null): Promise<string[]> {
  const cleanGroup = typeof groupId === 'string' ? groupId.trim() : '';
  if (!cleanGroup) return [];

  const members = await Product.find({
    colorGroupId: cleanGroup,
    isArchived: { $ne: true },
  })
    .select('_id slug')
    .lean();

  if (members.length === 1) {
    await Product.updateOne({ _id: members[0]._id }, { $set: { colorGroupId: '' } });
    return members[0].slug ? [members[0].slug] : [];
  }

  return [];
}

export async function validateLinkedVariantCandidates({
  linkedVariantIds,
  category,
  subCategory,
  excludeProductId,
}: {
  linkedVariantIds: string[];
  category: string;
  subCategory: string;
  excludeProductId?: string;
}) {
  const uniqueIds = Array.from(
    new Set(
      linkedVariantIds
        .map((id) => (typeof id === 'string' ? id.trim() : ''))
        .filter((id) => mongoose.Types.ObjectId.isValid(id) && id !== excludeProductId)
    )
  );

  if (uniqueIds.length === 0) {
    return [];
  }

  const scopeQuery = await buildSameCategorySubcategoryQuery(category, subCategory);
  const objectIds = uniqueIds.map((id) => new mongoose.Types.ObjectId(id));

  const candidates = await Product.find({
    ...scopeQuery,
    _id: { $in: objectIds },
  })
    .select('_id slug colorGroupId category subCategory')
    .lean();

  if (candidates.length !== uniqueIds.length) {
    throw new ColorVariantValidationError(
      'Only active/non-archived products in the exact same category and subcategory can be linked as color variants.'
    );
  }

  return candidates;
}

export async function syncProductColorGroup({
  product,
  linkedVariantIds,
  categoryOrSubCategoryChanged = false,
}: {
  product: any;
  linkedVariantIds?: string[];
  categoryOrSubCategoryChanged?: boolean;
}): Promise<{ colorGroupId: string; affectedSlugs: string[] }> {
  const affectedSlugs = new Set<string>();
  if (product.slug) affectedSlugs.add(product.slug);

  const oldGroupId = typeof product.colorGroupId === 'string' ? product.colorGroupId.trim() : '';

  if (linkedVariantIds === undefined) {
    if (categoryOrSubCategoryChanged && oldGroupId) {
      product.colorGroupId = '';
      await product.save();
      const cleanedSlugs = await cleanupSingletonColorGroup(oldGroupId);
      cleanedSlugs.forEach((s) => affectedSlugs.add(s));
    }
    return { colorGroupId: product.colorGroupId || '', affectedSlugs: Array.from(affectedSlugs) };
  }

  const candidates = await validateLinkedVariantCandidates({
    linkedVariantIds,
    category: product.category,
    subCategory: product.subCategory,
    excludeProductId: product._id.toString(),
  });

  if (candidates.length === 0) {
    if (oldGroupId) {
      product.colorGroupId = '';
      await product.save();
      const remaining = await Product.find({
        colorGroupId: oldGroupId,
        isArchived: { $ne: true },
      })
        .select('slug')
        .lean();
      remaining.forEach((r: any) => r.slug && affectedSlugs.add(r.slug));
      const cleanedSlugs = await cleanupSingletonColorGroup(oldGroupId);
      cleanedSlugs.forEach((s) => affectedSlugs.add(s));
    }
    return { colorGroupId: '', affectedSlugs: Array.from(affectedSlugs) };
  }

  const candidateIds = candidates.map((c: any) => c._id);
  const candidateIdStrings = new Set(candidates.map((c: any) => c._id.toString()));
  candidates.forEach((c: any) => c.slug && affectedSlugs.add(c.slug));

  const targetGroupId =
    oldGroupId ||
    candidates.find((c: any) => typeof c.colorGroupId === 'string' && c.colorGroupId.trim())
      ?.colorGroupId ||
    `cg-${product._id.toString()}`;

  const oldGroupIdsToCheck = new Set<string>();
  if (oldGroupId && oldGroupId !== targetGroupId) {
    oldGroupIdsToCheck.add(oldGroupId);
  }
  for (const c of candidates as any[]) {
    if (c.colorGroupId && c.colorGroupId !== targetGroupId) {
      oldGroupIdsToCheck.add(c.colorGroupId);
    }
  }

  // Detach any siblings that previously shared targetGroupId with this product but were unchecked
  if (oldGroupId === targetGroupId) {
    const previouslyInGroup = await Product.find({
      colorGroupId: targetGroupId,
      _id: { $ne: product._id },
      isArchived: { $ne: true },
    })
      .select('_id slug')
      .lean();

    const toDetachIds: any[] = [];
    for (const prev of previouslyInGroup as any[]) {
      if (!candidateIdStrings.has(prev._id.toString())) {
        toDetachIds.push(prev._id);
        if (prev.slug) affectedSlugs.add(prev.slug);
      }
    }
    if (toDetachIds.length > 0) {
      await Product.updateMany({ _id: { $in: toDetachIds } }, { $set: { colorGroupId: '' } });
    }
  }

  // Assign targetGroupId to product + all linked candidates
  if (product.colorGroupId !== targetGroupId) {
    product.colorGroupId = targetGroupId;
    await product.save();
  }

  await Product.updateMany({ _id: { $in: candidateIds } }, { $set: { colorGroupId: targetGroupId } });

  // Clean up any singleton leftovers from prior groups
  for (const gid of oldGroupIdsToCheck) {
    const cleaned = await cleanupSingletonColorGroup(gid);
    cleaned.forEach((s) => affectedSlugs.add(s));
  }

  return { colorGroupId: targetGroupId, affectedSlugs: Array.from(affectedSlugs) };
}

export async function getColorVariantsForProduct(product: any): Promise<SerializedColorVariant[]> {
  const groupId = typeof product?.colorGroupId === 'string' ? product.colorGroupId.trim() : '';
  if (!groupId || !process.env.MONGODB_URI) {
    return [];
  }

  try {
    const scopeQuery = await buildSameCategorySubcategoryQuery(
      product.category,
      product.subCategory
    );

    const siblings = await Product.find({
      ...scopeQuery,
      colorGroupId: groupId,
      isActive: true,
    })
      .select(
        '_id legacyId sku slug name colorName colorHex colorGroupId colors price originalPrice images inStock trackInventory allowBackorders availableQuantity stockQuantity isActive category subCategory createdAt'
      )
      .sort({ createdAt: 1 })
      .lean();

    if (!siblings || siblings.length <= 1) {
      return [];
    }

    return siblings.map(serializeColorVariantSummary);
  } catch (err) {
    console.error('[Color Variants Query Warning]:', err);
    return [];
  }
}

export async function getLinkedAdminVariants(product: any): Promise<SerializedColorVariant[]> {
  const groupId = typeof product?.colorGroupId === 'string' ? product.colorGroupId.trim() : '';
  if (!groupId) {
    return [];
  }

  const scopeQuery = await buildSameCategorySubcategoryQuery(product.category, product.subCategory);
  const currentId = product._id?.toString() || product.id;

  const docs = await Product.find({
    ...scopeQuery,
    colorGroupId: groupId,
  })
    .select(
      '_id legacyId sku slug name colorName colorHex colorGroupId colors price originalPrice images inStock trackInventory allowBackorders availableQuantity stockQuantity isActive category subCategory createdAt'
    )
    .sort({ createdAt: 1 })
    .lean();

  return docs
    .filter((d: any) => d._id.toString() !== currentId)
    .map(serializeColorVariantSummary);
}
