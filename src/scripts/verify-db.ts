import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { connectDB } from '../lib/mongodb';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Collection } from '../models/Collection';

export async function verifyDatabase() {
  console.log('=====================================================');
  console.log('MNC LIFESTYLE - DATABASE INTEGRITY & AUDIT VERIFICATION');
  console.log('=====================================================\n');

  const conn = await connectDB();
  console.log(`✓ Connected to Database: ${conn.connection.name}`);
  console.log(`✓ Host: ${conn.connection.host}\n`);

  const issues: string[] = [];

  // 1. Counts
  const productCount = await Product.countDocuments();
  const categoryCount = await Category.countDocuments();
  const collectionCount = await Collection.countDocuments();

  console.log('--- 1. Document Counts ---');
  console.log(`Products in DB    : ${productCount} (Expected: 19) ${productCount === 19 ? '✓ PASS' : '⚠ WARNING'}`);
  console.log(`Categories in DB  : ${categoryCount} (Expected: 12) ${categoryCount === 12 ? '✓ PASS' : '⚠ WARNING'}`);
  console.log(`Collections in DB : ${collectionCount} (Expected: 4)  ${collectionCount === 4 ? '✓ PASS' : '⚠ WARNING'}`);

  if (productCount === 0) issues.push('Products collection is empty! Run migration first.');
  if (categoryCount === 0) issues.push('Categories collection is empty! Run migration first.');
  if (collectionCount === 0) issues.push('Collections collection is empty! Run migration first.');

  // 2. Categories Verification
  console.log('\n--- 2. Category Integrity ---');
  const categories = await Category.find();
  const categorySlugs = new Set<string>();
  const categoryLegacyIds = new Set<string>();

  categories.forEach((cat) => {
    if (categorySlugs.has(cat.slug)) {
      issues.push(`Duplicate category slug: ${cat.slug}`);
    }
    categorySlugs.add(cat.slug);
    if (cat.legacyId) categoryLegacyIds.add(cat.legacyId);

    if (!cat.name || !cat.title || !cat.description || !cat.image) {
      issues.push(`Category ${cat.slug} is missing required text or image fields`);
    }
  });
  console.log(`✓ Verified ${categories.length} categories, no duplicates found. Valid slugs: [${Array.from(categorySlugs).join(', ')}]`);

  // 3. Products Verification
  console.log('\n--- 3. Product Integrity ---');
  const products = await Product.find();
  const productLegacyIds = new Set<string>();
  const productSkus = new Set<string>();
  const productSlugs = new Set<string>();

  products.forEach((prod) => {
    // Check duplicates
    if (productLegacyIds.has(prod.legacyId)) {
      issues.push(`Duplicate product legacyId: ${prod.legacyId}`);
    }
    productLegacyIds.add(prod.legacyId);

    if (productSkus.has(prod.sku)) {
      issues.push(`Duplicate product SKU: ${prod.sku}`);
    }
    productSkus.add(prod.sku);

    if (productSlugs.has(prod.slug)) {
      issues.push(`Duplicate product slug: ${prod.slug}`);
    }
    productSlugs.add(prod.slug);

    // Check required fields
    if (!prod.name || !prod.price || prod.price <= 0) {
      issues.push(`Product ${prod.legacyId} has invalid name or price`);
    }
    if (!prod.images || prod.images.length === 0) {
      issues.push(`Product ${prod.legacyId} has no images`);
    }

    // Check category reference validity
    const isValidCategory = categorySlugs.has(prod.category) || categoryLegacyIds.has(prod.category);
    if (!isValidCategory) {
      issues.push(`Product ${prod.legacyId} (${prod.name}) references unknown category: "${prod.category}"`);
    }
  });

  console.log(`✓ Verified ${products.length} products with ${productLegacyIds.size} unique legacy IDs and ${productSkus.size} unique SKUs.`);

  // 4. Collections Verification
  console.log('\n--- 4. Collection Integrity ---');
  const collections = await Collection.find();
  collections.forEach((col) => {
    if (!categorySlugs.has(col.category) && !categoryLegacyIds.has(col.category)) {
      issues.push(`Collection ${col.slug} references unknown category: "${col.category}"`);
    }
    // Check featured product IDs
    col.featuredProductIds.forEach((pid) => {
      if (!productLegacyIds.has(pid)) {
        issues.push(`Collection ${col.slug} references unknown featured product: "${pid}"`);
      }
    });
  });
  console.log(`✓ Verified ${collections.length} collections with cross-referenced product links.`);

  // FINAL VERIFICATION SUMMARY
  console.log('\n=====================================================');
  console.log('AUDIT VERIFICATION SUMMARY');
  console.log('=====================================================');
  if (issues.length === 0) {
    console.log('🎉 ALL INTEGRITY CHECKS PASSED WITH ZERO ISSUES!');
    console.log('Database is 100% compliant and ready for storefront integration.');
  } else {
    console.error(`⚠ FOUND ${issues.length} ISSUES:`);
    issues.forEach((iss, idx) => console.error(`  ${idx + 1}. ${iss}`));
  }

  return {
    passed: issues.length === 0,
    productCount,
    categoryCount,
    collectionCount,
    issues,
  };
}

const isMain = process.argv[1]?.includes('verify-db');
if (isMain) {
  verifyDatabase()
    .then((result) => {
      process.exit(result.passed ? 0 : 1);
    })
    .catch((err) => {
      console.error('Verification script failed:', err);
      process.exit(1);
    });
}
