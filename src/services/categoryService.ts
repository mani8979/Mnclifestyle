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
  try {
    await connectDB();
    const docs = await Category.find({ isActive: true }).select('-__v').sort({ orderIndex: 1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(sanitizeCategory);
    }
  } catch (error) {
    console.error('[Database Error] MongoDB getCategories query failed. Falling back to static categories:', error);
  }
  return staticCategories;
}

export async function getCategoryBySlug(slugOrId: string) {
  if (!process.env.MONGODB_URI) {
    return findStaticCategoryById(slugOrId);
  }
  try {
    await connectDB();
    const doc = await Category.findOne({
      $or: [{ slug: slugOrId }, { legacyId: slugOrId }],
      isActive: true,
    })
      .select('-__v')
      .lean();

    if (doc) {
      return sanitizeCategory(doc);
    }

    // If MongoDB already has managed categories, do not resurrect deleted static categories
    const totalActive = await Category.countDocuments({ isActive: true });
    if (totalActive > 0) {
      return null;
    }
  } catch (error) {
    console.error(`[Database Error] MongoDB getCategoryBySlug('${slugOrId}') failed. Falling back to static categories:`, error);
  }
  return findStaticCategoryById(slugOrId);
}
