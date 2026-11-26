import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { connectDB } from '../lib/mongodb';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Collection } from '../models/Collection';
import { InventoryMovement } from '../models/InventoryMovement';

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
  const activeProductCount = await Product.countDocuments({ isActive: true, isArchived: { $ne: true } });
  const categoryCount = await Category.countDocuments();
  const collectionCount = await Collection.countDocuments();
  const movementCount = await InventoryMovement.countDocuments();

  console.log('--- 1. Document Counts ---');
  console.log(`Products in DB       : ${productCount} (Active non-archived: ${activeProductCount})`);
  console.log(`Categories in DB     : ${categoryCount}`);
  console.log(`Collections in DB    : ${collectionCount}`);
  console.log(`Inventory Movements  : ${movementCount}`);

  if (productCount === 0) issues.push('Products collection is empty.');
  if (categoryCount === 0) issues.push('Categories collection is empty.');
  if (collectionCount === 0) issues.push('Collections collection is empty.');

  // 2. Categories Verification (slugs, duplicate names, accurate itemCount)
  console.log('\n--- 2. Category Integrity ---');
  const categories = await Category.find().lean();
  const categorySlugs = new Set<string>();
  const categoryLegacyIds = new Set<string>();
  const categoryNamesLower = new Set<string>();
  const activeCountsByCat = new Map<string, number>();

  const aggCounts = await Product.aggregate([
    { $match: { isArchived: { $ne: true }, isActive: true } },
    { $group: { _id: { $toLower: '$category' }, count: { $sum: 1 } } },
  ]);
  for (const row of aggCounts) {
    if (typeof row._id === 'string') activeCountsByCat.set(row._id, row.count || 0);
  }

  for (const cat of categories as any[]) {
    if (categorySlugs.has(cat.slug)) {
      issues.push(`Duplicate category slug: ${cat.slug}`);
    }
    categorySlugs.add(cat.slug);
    if (cat.legacyId) categoryLegacyIds.add(cat.legacyId);

    const nameKey = String(cat.name || '').trim().toLowerCase();
    if (categoryNamesLower.has(nameKey)) {
      issues.push(`Duplicate category name: "${cat.name}" (${cat.slug})`);
    }
    categoryNamesLower.add(nameKey);

    if (!cat.name || !cat.title || !cat.description || !cat.image) {
      issues.push(`Category ${cat.slug} is missing required text or image fields`);
    }

    const keys = Array.from(
      new Set([cat.slug, cat.legacyId, cat.name].filter(Boolean).map((v) => String(v).trim().toLowerCase()))
    );
    const actualCount = keys.reduce((s, k) => s + (activeCountsByCat.get(k) || 0), 0);
    if (cat.itemCount !== actualCount) {
      issues.push(`Stale itemCount on category ${cat.slug}: stored=${cat.itemCount}, actual=${actualCount}`);
    }
  }
  console.log(`✓ Checked ${categories.length} categories across [${Array.from(categorySlugs).join(', ')}]`);

  // 3. Products Verification
  console.log('\n--- 3. Product Integrity ---');
  const products = await Product.find().lean();
  const productLegacyIds = new Set<string>();
  const productSkus = new Set<string>();
  const productSlugs = new Set<string>();
  const activeRefKeys = new Set<string>();

  for (const prod of products as any[]) {
    if (prod.legacyId) {
      if (productLegacyIds.has(prod.legacyId)) {
        issues.push(`Duplicate product legacyId: ${prod.legacyId}`);
      }
      productLegacyIds.add(prod.legacyId);
    }

    if (productSkus.has(prod.sku)) {
      issues.push(`Duplicate product SKU: ${prod.sku}`);
    }
    productSkus.add(prod.sku);

    if (productSlugs.has(prod.slug)) {
      issues.push(`Duplicate product slug: ${prod.slug}`);
    }
    productSlugs.add(prod.slug);

    if (!prod.name || typeof prod.price !== 'number' || prod.price <= 0) {
      issues.push(`Product ${prod.sku} has invalid name or price`);
    }
    if (!prod.images || prod.images.length === 0) {
      issues.push(`Product ${prod.sku} has no images`);
    }

    const isValidCategory = categorySlugs.has(prod.category) || categoryLegacyIds.has(prod.category);
    if (!isValidCategory) {
      issues.push(`Product ${prod.sku} (${prod.name}) references unknown category: "${prod.category}"`);
    }

    if (prod.isActive && !prod.isArchived) {
      activeRefKeys.add(prod._id.toString());
      if (prod.legacyId) activeRefKeys.add(prod.legacyId);
      if (prod.slug) activeRefKeys.add(prod.slug);
      if (prod.sku) activeRefKeys.add(prod.sku);
    }

    if (prod.trackInventory !== false) {
      const expectedAvail = Math.max(0, (prod.stockQuantity || 0) - (prod.reservedQuantity || 0));
      if (prod.availableQuantity !== expectedAvail) {
        issues.push(`Product ${prod.sku} availableQuantity mismatch: stored=${prod.availableQuantity}, expected=${expectedAvail}`);
      }
    }
  }
  console.log(`✓ Checked ${products.length} products (${productSkus.size} unique SKUs, ${productSlugs.size} unique slugs)`);

  // 4. Collections Verification (must point to valid categories & active non-archived featured products)
  console.log('\n--- 4. Collection Integrity ---');
  const collections = await Collection.find().lean();
  for (const col of collections as any[]) {
    if (!categorySlugs.has(col.category) && !categoryLegacyIds.has(col.category)) {
      issues.push(`Collection ${col.slug} references unknown category: "${col.category}"`);
    }
    for (const pid of col.featuredProductIds || []) {
      if (!activeRefKeys.has(pid)) {
        issues.push(`Collection ${col.slug} references missing or archived/inactive featured product: "${pid}"`);
      }
    }
  }
  console.log(`✓ Checked ${collections.length} collections.`);

  // 5. Inventory Movement Historical Ledger Verification (non-destructive check using existing String adminId field)
  console.log('\n--- 5. Inventory Movement Ledger Integrity ---');
  const movements = await InventoryMovement.find().lean();
  const productIdStrings = new Set(products.map((p: any) => p._id.toString()));
  let historicalOrphanCount = 0;
  let legacyUnattributedCount = 0;
  for (const mov of movements as any[]) {
    if (!productIdStrings.has(mov.productId?.toString())) {
      historicalOrphanCount++;
    }
    if (!mov.adminId) {
      legacyUnattributedCount++;
    }
  }
  console.log(`✓ Checked ${movements.length} movements (historical deleted-SKU rows: ${historicalOrphanCount}, legacy unattributed rows: ${legacyUnattributedCount})`);

  console.log('\n=====================================================');
  console.log('AUDIT VERIFICATION SUMMARY');
  console.log('=====================================================');
  if (issues.length === 0) {
    console.log('🎉 ALL INTEGRITY CHECKS PASSED WITH ZERO ISSUES!');
  } else {
    console.error(`⚠ FOUND ${issues.length} ISSUES:`);
    issues.forEach((iss, idx) => console.error(`  ${idx + 1}. ${iss}`));
  }

  return issues.length === 0;
}

const isMain = process.argv[1]?.includes('verify-db');
if (isMain) {
  verifyDatabase()
    .then((success) => process.exit(success ? 0 : 1))
    .catch((err) => {
      console.error('Fatal verification error:', err);
      process.exit(1);
    });
}
