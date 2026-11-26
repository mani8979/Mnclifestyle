import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { categories as staticCategories, findCategoryById as findStaticCategoryById } from '@/data/categories';

export function sanitizeCategory(doc: any) {
  if (!doc) return null;
  const { __v, _id, ...rest } = doc;
  return {
    ...rest,
    id: doc.slug || doc.id || _id?.toString(),
    slug: doc.slug,
  };
}

export async function getCategories() {
  if (!process.env.MONGODB_URI) {
    return staticCategories;
  }
  await connectDB();
  const docs = await Category.find({ isActive: true }).select('-__v').sort({ orderIndex: 1 }).lean();
  return (docs || []).map(sanitizeCategory);
}

export async function getCategoryBySlug(slugOrId: string) {
  if (!process.env.MONGODB_URI) {
    return findStaticCategoryById(slugOrId);
  }
  await connectDB();
  const doc = await Category.findOne({
    $or: [{ slug: slugOrId }, { legacyId: slugOrId }],
    isActive: true,
  })
    .select('-__v')
    .lean();

  return doc ? sanitizeCategory(doc) : null;
}
