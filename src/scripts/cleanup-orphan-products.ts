import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../lib/mongodb';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Collection } from '../models/Collection';

async function cleanupOrphanProducts() {
  await connectDB();

  const categories = await Category.find({}).select('slug legacyId name').lean();
  const validKeys = new Set<string>();
  for (const cat of categories as any[]) {
    if (cat.slug) validKeys.add(String(cat.slug).trim().toLowerCase());
    if (cat.legacyId) validKeys.add(String(cat.legacyId).trim().toLowerCase());
  }

  const allProducts = await Product.find({}).select('_id sku legacyId slug name category categoryLabel').lean();
  const orphanProducts = (allProducts as any[]).filter((p) => {
    const catKey = typeof p.category === 'string' ? p.category.trim().toLowerCase() : '';
    return !catKey || !validKeys.has(catKey);
  });

  console.log(`Active categories: ${categories.length}`);
  console.log(`Total products before cleanup: ${allProducts.length}`);
  console.log(`Orphaned products (no matching category): ${orphanProducts.length}`);

  if (orphanProducts.length > 0) {
    const orphanObjectIds = orphanProducts.map((p) => p._id);
    const orphanRefs: string[] = [];
    for (const p of orphanProducts) {
      console.log(` - Removing [${p.sku}] "${p.name}" (category: "${p.category || ''}")`);
      orphanRefs.push(p._id.toString());
      if (p.legacyId) orphanRefs.push(p.legacyId);
      if (p.slug) orphanRefs.push(p.slug);
    }

    const deleteRes = await Product.deleteMany({ _id: { $in: orphanObjectIds } });
    console.log(`Deleted products count: ${deleteRes.deletedCount}`);

    if (orphanRefs.length > 0) {
      const colRes = await Collection.updateMany(
        {},
        { $pull: { featuredProductIds: { $in: orphanRefs } } }
      );
      console.log(`Updated collections (removed dangling featuredProductIds): ${colRes.modifiedCount}`);
    }
  }

  const remaining = await Product.countDocuments({});
  console.log(`Remaining products in MongoDB: ${remaining}`);
  process.exit(0);
}

cleanupOrphanProducts().catch((err) => {
  console.error('Failed to clean up orphaned products:', err);
  process.exit(1);
});
