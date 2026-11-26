import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Collection } from '@/models/Collection';
import { Product } from '@/models/Product';
import { InventoryMovement } from '@/models/InventoryMovement';
import { syncCategoryItemCounts } from '@/lib/category-cleanup';

/**
 * Phase 1 Staging/Production Data Integrity Migration
 * Fixes:
 *  1. Collection category slug drift (`modern-living` -> `sectional-sofas`, `minimalist-furniture` -> `study-and-computer-tables`)
 *  2. Collection featuredProductIds referencing archived legacy products -> verified active SKUs
 *  3. Empty duplicate category `wardrobes-2` removal (aborts if attached products exist)
 *  4. Recompute accurate active non-archived Category.itemCount values and sequential orderIndex
 *  5. Normalize archived MNC-SEC-001 / MNC-SEC-002 categoryLabel to "Sofas"
 *
 * Defaults to --dry-run unless --execute is passed.
 */
async function main() {
  const args = new Set(process.argv.slice(2));
  const execute = args.has('--execute');
  const allowProd = args.has('--allow-production');

  const conn = await connectDB();
  const dbName = conn.connection.name;

  if (execute && dbName === 'mnc_lifestyle' && !allowProd) {
    throw new Error(
      'SAFETY ABORT: Refusing to execute migration against production DB "mnc_lifestyle" without --allow-production.'
    );
  }

  console.log(`=== PHASE 1 MIGRATION (${execute ? 'EXECUTE' : 'DRY-RUN'}) | DB=${dbName} ===`);

  const before = {
    admins: await mongoose.connection.db!.collection('admins').countDocuments(),
    categories: await Category.countDocuments(),
    collections: await Collection.countDocuments(),
    products: await Product.countDocuments(),
    activeProducts: await Product.countDocuments({ isActive: true, isArchived: { $ne: true } }),
    movements: await InventoryMovement.countDocuments(),
  };
  console.log('BEFORE_COUNTS:', JSON.stringify(before));

  const targetCollectionFixes: Array<{
    slug: string;
    nextCategory: string;
    nextFeaturedIds: string[];
  }> = [
    {
      slug: 'modern-living',
      nextCategory: 'sectional-sofas',
      nextFeaturedIds: ['fur-kepler-sof-0111', 'fur-lucinda-so-0112', 'fur-belinda-so-0113'],
    },
    {
      slug: 'contemporary-bedroom',
      nextCategory: 'beds',
      nextFeaturedIds: ['fur-bonita-hyd-0087', 'fur-ricky-hydr-0088', 'fur-mercury-hy-0089'],
    },
    {
      slug: 'elegant-dining',
      nextCategory: 'dining-sets',
      nextFeaturedIds: ['fur-oscar-6-se-0099', 'fur-beryl-6-se-0100', 'fur-vision-4-s-0101'],
    },
    {
      slug: 'minimalist-furniture',
      nextCategory: 'study-and-computer-tables',
      nextFeaturedIds: [],
    },
  ];

  // Phase A: Validate ALL required collections, target categories, and replacement products upfront BEFORE writing anything.
  const validatedFixes: Array<{
    slug: string;
    currentCategory: string;
    currentFeaturedIds: string[];
    nextCategory: string;
    nextFeaturedIds: string[];
  }> = [];

  for (const fix of targetCollectionFixes) {
    const colDoc = await Collection.findOne({ slug: fix.slug }).lean();
    if (!colDoc) {
      throw new Error(
        `ABORT: Required collection "${fix.slug}" is missing or was renamed in database "${dbName}". Stopping migration before making any changes.`
      );
    }

    const targetCat = await Category.findOne({ slug: fix.nextCategory }).lean();
    if (!targetCat) {
      throw new Error(
        `ABORT: Target category "${fix.nextCategory}" missing for collection "${fix.slug}". Stopping migration before making any changes.`
      );
    }

    if (fix.nextFeaturedIds.length > 0) {
      const validFeatured = await Product.countDocuments({
        legacyId: { $in: fix.nextFeaturedIds },
        isActive: true,
        isArchived: { $ne: true },
      });
      if (validFeatured !== fix.nextFeaturedIds.length) {
        throw new Error(
          `ABORT: Expected ${fix.nextFeaturedIds.length} active featured products for "${fix.slug}", found ${validFeatured}. Stopping migration before making any changes.`
        );
      }
    }

    validatedFixes.push({
      slug: fix.slug,
      currentCategory: (colDoc as any).category,
      currentFeaturedIds: Array.isArray((colDoc as any).featuredProductIds)
        ? (colDoc as any).featuredProductIds
        : [],
      nextCategory: fix.nextCategory,
      nextFeaturedIds: fix.nextFeaturedIds,
    });
  }

  // Validate duplicate wardrobes-2 category safety BEFORE writing anything
  const dupWardrobe = await Category.findOne({ slug: 'wardrobes-2' }).lean();
  if (dupWardrobe) {
    const attached = await Product.countDocuments({
      category: { $in: ['wardrobes-2'] },
    });
    if (attached > 0) {
      throw new Error(`ABORT: wardrobes-2 unexpectedly has ${attached} product(s); refusing blind delete`);
    }
  }

  // Compute read-only preview of itemCount drifts and categoryLabel drifts
  const secMismatchCount = await Product.countDocuments({
    category: 'sectional-sofas',
    categoryLabel: { $ne: 'Sofas' },
  });

  const [allCategories, activeCountRows] = await Promise.all([
    Category.find({}).sort({ orderIndex: 1, createdAt: 1 }).select('_id slug legacyId name itemCount orderIndex').lean(),
    Product.aggregate([
      { $match: { isArchived: { $ne: true }, isActive: true } },
      { $group: { _id: { $toLower: '$category' }, count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map<string, number>();
  for (const row of activeCountRows) {
    if (typeof row._id === 'string') {
      countMap.set(row._id, row.count || 0);
    }
  }

  const itemCountDrifts: Array<{ slug: string; from: number; to: number }> = [];
  for (const cat of allCategories as any[]) {
    if (cat.slug === 'wardrobes-2') continue;
    const keys = Array.from(
      new Set(
        [cat.slug, cat.legacyId, cat.name]
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
          .map((v) => v.trim().toLowerCase())
      )
    );
    const actualCount = keys.reduce((sum, key) => sum + (countMap.get(key) || 0), 0);
    if ((cat.itemCount ?? 0) !== actualCount) {
      itemCountDrifts.push({ slug: cat.slug, from: cat.itemCount ?? 0, to: actualCount });
    }
  }

  // Print full proposed plan before any write
  for (const fix of validatedFixes) {
    console.log(
      `Collection "${fix.slug}": category "${fix.currentCategory}" -> "${fix.nextCategory}", featuredProductIds ${JSON.stringify(
        fix.currentFeaturedIds
      )} -> ${JSON.stringify(fix.nextFeaturedIds)}`
    );
  }
  console.log(dupWardrobe ? 'Category "wardrobes-2": duplicate empty category -> DELETE' : 'Category "wardrobes-2": already removed');
  console.log(`Products with sectional-sofas categoryLabel != "Sofas": ${secMismatchCount}`);
  console.log(`Category itemCount drifts to sync: ${JSON.stringify(itemCountDrifts)}`);

  // Phase B: Execute updates only when --execute was explicitly passed
  if (execute) {
    for (const fix of validatedFixes) {
      await Collection.updateOne(
        { slug: fix.slug },
        {
          $set: {
            category: fix.nextCategory,
            featuredProductIds: fix.nextFeaturedIds,
          },
        }
      );
    }

    if (dupWardrobe) {
      await Category.deleteOne({ _id: (dupWardrobe as any)._id });
    }

    if (secMismatchCount > 0) {
      await Product.updateMany(
        { category: 'sectional-sofas', categoryLabel: { $ne: 'Sofas' } },
        { $set: { categoryLabel: 'Sofas' } }
      );
    }

    const remainingCategories = await Category.find({}).sort({ orderIndex: 1, createdAt: 1 });
    for (let i = 0; i < remainingCategories.length; i++) {
      if (remainingCategories[i].orderIndex !== i + 1) {
        remainingCategories[i].orderIndex = i + 1;
        await remainingCategories[i].save();
      }
    }
    await syncCategoryItemCounts();
  }

  const after = {
    admins: await mongoose.connection.db!.collection('admins').countDocuments(),
    categories: await Category.countDocuments(),
    collections: await Collection.countDocuments(),
    products: await Product.countDocuments(),
    activeProducts: await Product.countDocuments({ isActive: true, isArchived: { $ne: true } }),
    movements: await InventoryMovement.countDocuments(),
  };
  console.log('AFTER_COUNTS:', JSON.stringify(after));

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('PHASE1_MIGRATION_ERROR:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
