import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { connectDB } from '../lib/mongodb';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Collection } from '../models/Collection';

// Import existing data
import { products as staticProducts } from '../data/products';
import { categories as staticCategories } from '../data/categories';
import { collections as staticCollections } from '../data/collections';

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface MigrationStats {
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  details: string[];
}

export async function runMigration(isDryRun: boolean = false) {
  console.log('=====================================================');
  console.log(`MNC LIFESTYLE - DATA MIGRATION [${isDryRun ? 'DRY-RUN MODE' : 'LIVE EXECUTE MODE'}]`);
  console.log('=====================================================');

  const conn = await connectDB();
  if (!isDryRun && !process.argv.includes('--force-legacy')) {
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      throw new Error(
        `SAFETY ABORT: Database "${conn.connection.name}" already has ${existingCount} product(s). Legacy seed migration requires explicit --force-legacy (and is superseded by src/scripts/phase1-migrate.ts).`
      );
    }
  }
  console.log(`Connected to database: ${conn.connection.name}`);
  console.log(`Source static data: ${staticProducts.length} Products, ${staticCategories.length} Categories, ${staticCollections.length} Collections\n`);

  const categoryStats: MigrationStats = { inserted: 0, updated: 0, skipped: 0, failed: 0, details: [] };
  const productStats: MigrationStats = { inserted: 0, updated: 0, skipped: 0, failed: 0, details: [] };
  const collectionStats: MigrationStats = { inserted: 0, updated: 0, skipped: 0, failed: 0, details: [] };

  // 1. MIGRATE CATEGORIES
  console.log('--- 1. Migrating Categories ---');
  for (let i = 0; i < staticCategories.length; i++) {
    const cat = staticCategories[i];
    try {
      const existing = await Category.findOne({
        $or: [{ slug: cat.id }, { legacyId: cat.legacyId || cat.id }],
      });

      const categoryData = {
        slug: cat.id,
        legacyId: cat.legacyId || null,
        name: cat.name,
        title: cat.title,
        tagline: cat.tagline || '',
        description: cat.description,
        image: cat.image,
        imageKey: '',
        subtitle: cat.subtitle || '',
        itemCount: cat.itemCount || 0,
        subcategories: cat.subcategories || [],
        orderIndex: i + 1,
        isActive: true,
        seoMeta: {
          title: `${cat.name} — Luxury Handcrafted Furniture | MNC LifeStyle`,
          description: cat.description,
          keywords: [cat.name, ...(cat.subcategories || []), 'luxury furniture', 'Visakhapatnam'],
        },
      };

      if (!existing) {
        if (!isDryRun) {
          await Category.create(categoryData);
        }
        categoryStats.inserted++;
        categoryStats.details.push(`[INSERT] Category: ${cat.name} (${cat.id})`);
      } else {
        if (!isDryRun) {
          await Category.findByIdAndUpdate(existing._id, { $set: categoryData });
        }
        categoryStats.updated++;
        categoryStats.details.push(`[UPDATE] Category: ${cat.name} (${cat.id})`);
      }
    } catch (err: any) {
      categoryStats.failed++;
      categoryStats.details.push(`[FAILED] Category: ${cat.name} - ${err.message}`);
    }
  }

  // 2. MIGRATE PRODUCTS
  console.log('\n--- 2. Migrating Products ---');
  for (let i = 0; i < staticProducts.length; i++) {
    const prod = staticProducts[i];
    try {
      const existing = await Product.findOne({
        $or: [{ legacyId: prod.id }, { sku: prod.sku }],
      });

      const generatedSlug = slugify(prod.name);

      const productData = {
        legacyId: prod.id,
        sku: prod.sku || `MNC-${prod.category.toUpperCase().slice(0, 3)}-${String(i + 1).padStart(3, '0')}`,
        slug: generatedSlug,
        name: prod.name,
        category: prod.category,
        categoryLabel: prod.categoryLabel || prod.category,
        subCategory: prod.subCategory || 'General',
        price: prod.price,
        originalPrice: prod.originalPrice || 0,
        badge: prod.badge || null,
        isBestseller: Boolean(prod.isBestseller),
        isFeatured: Boolean(prod.isFeatured),
        isActive: true,
        stockQuantity: 10,
        inStock: true,
        shortDescription: prod.shortDescription,
        fullDescription: prod.fullDescription,
        dimensions: {
          width: prod.dimensions?.width || '',
          depth: prod.dimensions?.depth || '',
          height: prod.dimensions?.height || '',
          seatHeight: prod.dimensions?.seatHeight || '',
          bedBaseHeight: prod.dimensions?.bedBaseHeight || '',
          weight: prod.dimensions?.weight || '',
        },
        materials: prod.materials || [],
        colors: (prod.colors || []).map((c) => ({
          name: c.name,
          hex: c.hex,
          inStock: c.inStock !== false,
        })),
        images: prod.images || [],
        imageDetails: (prod.images || []).map((imgUrl, idx) => ({
          url: imgUrl,
          key: '',
          altText: `${prod.name} - View ${idx + 1}`,
          isPrimary: idx === 0,
        })),
        leadTime: prod.leadTime || 'Complimentary White-Glove In-Home Delivery across AP (3–7 Days)',
        warranty: prod.warranty || '10-Year Structural Frame & Termite Warranty',
        rating: prod.rating || 4.8,
        reviewsCount: prod.reviewsCount || 0,
        seoMeta: {
          title: `${prod.name} — Handcrafted Solid Wood | MNC LifeStyle Visakhapatnam`,
          description: prod.shortDescription,
          keywords: [prod.name, prod.categoryLabel, prod.subCategory, ...(prod.materials || [])],
          ogImage: prod.images?.[0] || '',
        },
      };

      if (!existing) {
        if (!isDryRun) {
          await Product.create(productData);
        }
        productStats.inserted++;
        productStats.details.push(`[INSERT] Product: ${prod.name} (${prod.id} -> /product/${generatedSlug})`);
      } else {
        if (!isDryRun) {
          await Product.findByIdAndUpdate(existing._id, { $set: productData });
        }
        productStats.updated++;
        productStats.details.push(`[UPDATE] Product: ${prod.name} (${prod.id})`);
      }
    } catch (err: any) {
      productStats.failed++;
      productStats.details.push(`[FAILED] Product: ${prod.name} - ${err.message}`);
    }
  }

  // 3. MIGRATE COLLECTIONS
  console.log('\n--- 3. Migrating Collections ---');
  for (let i = 0; i < staticCollections.length; i++) {
    const col = staticCollections[i];
    try {
      const existing = await Collection.findOne({
        $or: [{ slug: col.id }, { legacyId: col.id }],
      });

      const collectionData = {
        slug: col.id,
        legacyId: col.id,
        title: col.title,
        category: col.category,
        subtitle: col.subtitle || '',
        tagline: col.tagline || '',
        description: col.description,
        image: col.image,
        imageKey: '',
        materials: col.materials || [],
        piecesCount: col.piecesCount || '',
        featuredProductIds: col.featuredProductIds || [],
        orderIndex: i + 1,
        isActive: true,
        seoMeta: {
          title: `${col.title} — Curated Suites | MNC LifeStyle`,
          description: col.description,
          keywords: [col.title, ...(col.materials || []), 'luxury collection', 'Visakhapatnam'],
        },
      };

      if (!existing) {
        if (!isDryRun) {
          await Collection.create(collectionData);
        }
        collectionStats.inserted++;
        collectionStats.details.push(`[INSERT] Collection: ${col.title} (${col.id})`);
      } else {
        if (!isDryRun) {
          await Collection.findByIdAndUpdate(existing._id, { $set: collectionData });
        }
        collectionStats.updated++;
        collectionStats.details.push(`[UPDATE] Collection: ${col.title} (${col.id})`);
      }
    } catch (err: any) {
      collectionStats.failed++;
      collectionStats.details.push(`[FAILED] Collection: ${col.title} - ${err.message}`);
    }
  }

  // SUMMARY REPORT
  console.log('\n=====================================================');
  console.log(`MIGRATION SUMMARY [${isDryRun ? 'DRY-RUN' : 'EXECUTED'}]`);
  console.log('=====================================================');
  console.log(`Categories  : ${categoryStats.inserted} to insert, ${categoryStats.updated} to update, ${categoryStats.failed} failed (Total: ${staticCategories.length})`);
  console.log(`Products    : ${productStats.inserted} to insert, ${productStats.updated} to update, ${productStats.failed} failed (Total: ${staticProducts.length})`);
  console.log(`Collections : ${collectionStats.inserted} to insert, ${collectionStats.updated} to update, ${collectionStats.failed} failed (Total: ${staticCollections.length})`);
  
  if (categoryStats.failed > 0 || productStats.failed > 0 || collectionStats.failed > 0) {
    console.error('\nErrors encountered:');
    [...categoryStats.details, ...productStats.details, ...collectionStats.details]
      .filter((d) => d.startsWith('[FAILED]'))
      .forEach((d) => console.error(d));
  } else {
    console.log('\nAll entities validated successfully without errors.');
  }

  return {
    isDryRun,
    categories: categoryStats,
    products: productStats,
    collections: collectionStats,
  };
}

const isMain = process.argv[1]?.includes('migrate-data');
if (isMain) {
  const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--execute');
  runMigration(isDryRun)
    .then(() => {
      console.log('\nScript finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration script failed:', err);
      process.exit(1);
    });
}
