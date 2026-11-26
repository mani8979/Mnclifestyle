import mongoose from 'mongoose';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { escapeRegex } from '@/lib/category-cleanup';

export function buildCollectionLookupQuery(id: string) {
  const decoded = decodeURIComponent(id).trim();
  const queries: any[] = [{ slug: decoded }, { slug: decoded.toLowerCase() }, { legacyId: decoded }];
  if (mongoose.Types.ObjectId.isValid(decoded)) {
    queries.unshift({ _id: new mongoose.Types.ObjectId(decoded) });
  }
  return { $or: queries };
}

export async function resolveCategoryForCollection(categoryInput: string) {
  const clean = categoryInput.trim();
  const escaped = escapeRegex(clean);
  return Category.findOne({
    $or: [
      { slug: clean.toLowerCase() },
      { legacyId: clean },
      { name: new RegExp(`^${escaped}$`, 'i') },
    ],
  })
    .select('slug name')
    .lean();
}

export async function resolveCanonicalFeaturedProductSlugs(featuredIds: string[]) {
  const cleaned = Array.from(new Set(featuredIds.map((id) => id.trim()).filter(Boolean)));
  if (cleaned.length === 0) return [];

  const objectIds = cleaned
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  const upperSkus = cleaned.map((id) => id.toUpperCase());

  const products = await Product.find({
    isArchived: { $ne: true },
    $or: [
      ...(objectIds.length > 0 ? [{ _id: { $in: objectIds } }] : []),
      { slug: { $in: cleaned } },
      { legacyId: { $in: cleaned } },
      { sku: { $in: upperSkus } },
    ],
  })
    .select('_id slug legacyId sku')
    .lean();

  const resolved: string[] = [];
  const seenSlugs = new Set<string>();

  for (const inputRef of cleaned) {
    const match = (products as any[]).find(
      (p) =>
        p._id.toString() === inputRef ||
        p.slug === inputRef ||
        p.legacyId === inputRef ||
        p.sku?.toUpperCase() === inputRef.toUpperCase()
    );
    if (!match) {
      throw Object.assign(
        new Error(`Featured product reference "${inputRef}" does not exist or is archived.`),
        { status: 400 }
      );
    }
    if (!seenSlugs.has(match.slug)) {
      seenSlugs.add(match.slug);
      resolved.push(match.slug);
    }
  }

  return resolved;
}
