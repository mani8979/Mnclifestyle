import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../lib/mongodb';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Collection } from '../models/Collection';
import { getProducts, getProductByIdOrSlug } from '../services/productService';
import { getCategories, getCategoryBySlug } from '../services/categoryService';
import { getCollections, getCollectionBySlug } from '../services/collectionService';

async function runReview() {
  console.log('=====================================================');
  console.log('MNC LifeStyle — Phase 3 & 4 Verification Script');
  console.log('=====================================================\n');

  // 1. Direct MongoDB Connection & Counts
  console.log('--- 1. MongoDB Atlas Direct Connection ---');
  const db = await connectDB();
  console.log(`Connected to host: ${db.connection.host}, database: ${db.connection.name}`);
  
  const productCount = await Product.countDocuments();
  const activeProductCount = await Product.countDocuments({ isActive: true });
  const categoryCount = await Category.countDocuments();
  const collectionCount = await Collection.countDocuments();
  console.log(`Products in DB: ${productCount} (Active: ${activeProductCount})`);
  console.log(`Categories in DB: ${categoryCount}`);
  console.log(`Collections in DB: ${collectionCount}`);

  // 2. Service Layer — Products
  console.log('\n--- 2. Service Layer: Products ---');
  const allProducts = await getProducts();
  console.log(`getProducts() returned: ${allProducts.length} items`);
  console.log(`Sample Product: id="${allProducts[0].id}", slug="${allProducts[0].slug}", name="${allProducts[0].name}", price=₹${allProducts[0].price}`);

  // 3. Service Layer — Category Filter
  console.log('\n--- 3. Service Layer: Category Filter ---');
  const sofaProducts = await getProducts({ category: 'sectional-sofas' });
  console.log(`getProducts({ category: 'sectional-sofas' }) returned: ${sofaProducts.length} items`);
  const bedsProducts = await getProducts({ category: 'beds' });
  console.log(`getProducts({ category: 'beds' }) returned: ${bedsProducts.length} items`);

  // 4. Slug & Legacy ID Resolution
  console.log('\n--- 4. Slug & Legacy ID Resolution ---');
  const sampleWithLegacy = await Product.findOne({
    isActive: true,
    isArchived: { $ne: true },
    legacyId: { $exists: true, $ne: '' },
  })
    .select('slug legacyId name')
    .lean();
  if (!sampleWithLegacy?.slug || !sampleWithLegacy?.legacyId) {
    throw new Error('No active product with legacyId found in database.');
  }
  const bySlug = await getProductByIdOrSlug(sampleWithLegacy.slug);
  const byLegacyId = await getProductByIdOrSlug(sampleWithLegacy.legacyId);
  const resolutionMatch = Boolean(bySlug?.id && byLegacyId?.id && bySlug.id === byLegacyId.id);
  console.log(`By slug: found="${bySlug?.name}" (ID: ${bySlug?.id}, legacyId: ${bySlug?.legacyId})`);
  console.log(`By legacyId: found="${byLegacyId?.name}" (ID: ${byLegacyId?.id}, legacyId: ${byLegacyId?.legacyId})`);
  console.log(`Resolution matches: ${resolutionMatch}`);

  // 5. Service Layer — Categories
  console.log('\n--- 5. Service Layer: Categories ---');
  const categories = await getCategories();
  console.log(`getCategories() returned: ${categories.length} categories`);
  const sofaCategory = await getCategoryBySlug('sectional-sofas');
  console.log(`getCategoryBySlug('sectional-sofas'): found="${sofaCategory?.name}", slug="${sofaCategory?.slug}"`);

  // 6. Service Layer — Collections
  console.log('\n--- 6. Service Layer: Collections ---');
  const collections = await getCollections();
  console.log(`getCollections() returned: ${collections.length} collections`);
  for (const c of collections) {
    console.log(`Collection: "${c.title}" (slug: ${c.slug}), associated products: ${c.products?.length || 0}`);
  }

  // 7. Sanitization Check (Check for __v and sensitive internal fields)
  console.log('\n--- 7. Internal Fields / Sanitization Check ---');
  const sample = allProducts[0] as any;
  console.log(`__v is present: ${sample.__v !== undefined}`);
  console.log(`_id is string: ${typeof sample._id === 'string' || sample._id === undefined}`);
  console.log(`Passes sanitization: ${sample.__v === undefined}`);

  // 8. Image URL Health Check (Spot check)
  console.log('\n--- 8. Image URLs Check ---');
  const imageSamples = allProducts.slice(0, 5).map(p => ({
    name: p.name,
    imagesCount: p.images.length,
    firstImage: p.images[0]
  }));
  for (const item of imageSamples) {
    console.log(`[${item.name}] has ${item.imagesCount} images. Primary: ${item.firstImage?.slice(0, 60)}...`);
  }

  if (allProducts.length === 0 || sofaProducts.length === 0 || !resolutionMatch || !sofaCategory) {
    console.error('Review verification failed required non-empty assertions.');
    process.exit(1);
  }

  console.log('\n=====================================================');
  console.log('Script execution finished successfully.');
  console.log('=====================================================');
  process.exit(0);
}

runReview().catch((err) => {
  console.error('Review script error:', err);
  process.exit(1);
});
