import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { connectDB } from '../lib/mongodb';
import { Category } from '../models/Category';
import { Product, IProductImageDetail } from '../models/Product';
import { ProductInputSchema, slugify } from '../lib/validations/product';
import {
  ALLOWED_FORMATS,
  CLOUDINARY_PRODUCTS_FOLDER,
  MAX_FILE_SIZE_BYTES,
  MAX_GALLERY_IMAGES,
  getCloudinaryClient,
  generateProductImagePublicId,
} from '../lib/storage/cloudinary';
import { resolveExistingCategory, ExistingCategoryDoc } from './damro-category-mapping';

export interface RawImportColor {
  name: string;
  hex: string;
  inStock?: boolean;
  image?: string;
  price?: number;
  originalPrice?: number;
}

export interface RawImportProduct {
  sourceCategory: string;
  sourceSubCategory?: string;
  name: string;
  slug?: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  shortDescription?: string;
  fullDescription?: string;
  dimensions?: {
    width?: string;
    depth?: string;
    height?: string;
    seatHeight?: string;
    bedBaseHeight?: string;
    weight?: string;
  };
  materials?: string[];
  colors?: RawImportColor[];
  colorName?: string;
  colorHex?: string;
  images: string[];
  badge?: string | null;
  leadTime?: string;
  warranty?: string;
  stockQuantity?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
}

export interface CatalogImportFile {
  schemaVersion?: number;
  products: RawImportProduct[];
  exampleRecord?: RawImportProduct;
}

export interface ImportReport {
  isDryRun: boolean;
  inputPath: string;
  totalFound: number;
  imported: number;
  validatedDryRun: number;
  skippedDuplicates: number;
  skippedUnmatchedCategory: number;
  skippedMissingInfo: number;
  missingMrpCount: number;
  failed: number;
  uploadedImagesCount: number;
  originalImagesUploadedCount: number;
  defaultImagesUsedCount: number;
  categoriesProcessed: string[];
  unmatchedDetails: Array<{ name: string; sourceCategory: string; reason: string }>;
  missingInfoDetails: Array<{ name: string; reason: string }>;
  failedDetails: Array<{ name: string; reason: string }>;
}

const DEFAULT_WEBSITE_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80';

const MIME_EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function isCloudinaryFolderUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') && url.includes(CLOUDINARY_PRODUCTS_FOLDER);
}

function getExtensionFromLocation(location: string): string {
  const clean = location.split('?')[0].split('#')[0];
  const ext = path.extname(clean).replace('.', '').toLowerCase();
  return ext === 'jpg' ? 'jpeg' : ext;
}

async function resolveAndValidateImageSource(
  source: string,
  baseDir: string,
  verifyRemote: boolean
): Promise<{ valid: boolean; isRemote: boolean; resolvedSource: string; reason?: string }> {
  const trimmed = typeof source === 'string' ? source.trim() : '';
  if (!trimmed) {
    return { valid: false, isRemote: false, resolvedSource: '', reason: 'Empty image path/URL' };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    if (!verifyRemote) {
      const ext = getExtensionFromLocation(trimmed);
      if (ext && !ALLOWED_FORMATS.includes(ext as (typeof ALLOWED_FORMATS)[number])) {
        return {
          valid: false,
          isRemote: true,
          resolvedSource: trimmed,
          reason: `Unsupported remote image format ".${ext}"`,
        };
      }
      return { valid: true, isRemote: true, resolvedSource: trimmed };
    }

    try {
      const headRes = await fetch(trimmed, { method: 'HEAD' });
      const res = headRes.ok ? headRes : await fetch(trimmed, { method: 'GET' });
      if (!res.ok) {
        return {
          valid: false,
          isRemote: true,
          resolvedSource: trimmed,
          reason: `Image URL returned HTTP ${res.status} (${trimmed})`,
        };
      }
      const contentType = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (!MIME_EXT_MAP[contentType]) {
        return {
          valid: false,
          isRemote: true,
          resolvedSource: trimmed,
          reason: `Image URL did not return a supported image MIME type (got "${contentType || 'unknown'}")`,
        };
      }
      const contentLength = Number(res.headers.get('content-length') || 0);
      if (contentLength > MAX_FILE_SIZE_BYTES) {
        return {
          valid: false,
          isRemote: true,
          resolvedSource: trimmed,
          reason: `Image exceeds 8 MB limit (${(contentLength / (1024 * 1024)).toFixed(2)} MB)`,
        };
      }
      return { valid: true, isRemote: true, resolvedSource: trimmed };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      return {
        valid: false,
        isRemote: true,
        resolvedSource: trimmed,
        reason: `Failed to access remote image: ${msg}`,
      };
    }
  }

  const absPath = path.isAbsolute(trimmed) ? trimmed : path.resolve(baseDir, trimmed);
  try {
    const stat = await fs.stat(absPath);
    if (!stat.isFile()) {
      return { valid: false, isRemote: false, resolvedSource: absPath, reason: 'Path is not a file' };
    }
    if (stat.size > MAX_FILE_SIZE_BYTES || stat.size === 0) {
      return {
        valid: false,
        isRemote: false,
        resolvedSource: absPath,
        reason: `Invalid image size (${stat.size} bytes; max ${MAX_FILE_SIZE_BYTES} bytes)`,
      };
    }
    const ext = getExtensionFromLocation(absPath);
    if (!ALLOWED_FORMATS.includes(ext as (typeof ALLOWED_FORMATS)[number])) {
      return {
        valid: false,
        isRemote: false,
        resolvedSource: absPath,
        reason: `Unsupported file extension ".${ext}". Allowed: ${ALLOWED_FORMATS.join(', ')}`,
      };
    }
    return { valid: true, isRemote: false, resolvedSource: absPath };
  } catch {
    return {
      valid: false,
      isRemote: false,
      resolvedSource: absPath,
      reason: `Local image file not found: ${absPath}`,
    };
  }
}

async function uploadImageToCloudinary(
  source: string,
  productSlug: string,
  altText: string,
  isPrimary: boolean
): Promise<{ url: string; key: string; altText: string; isPrimary: boolean; width?: number; height?: number }> {
  if (isCloudinaryFolderUrl(source)) {
    return { url: source, key: '', altText, isPrimary };
  }

  const client = getCloudinaryClient();
  const publicId = generateProductImagePublicId(productSlug);
  const res = await client.uploader.upload(source, {
    folder: CLOUDINARY_PRODUCTS_FOLDER,
    public_id: path.basename(publicId),
    resource_type: 'image',
    overwrite: false,
  });

  return {
    url: res.secure_url,
    key: res.public_id,
    altText,
    isPrimary,
    width: res.width,
    height: res.height,
  };
}

export async function runCatalogImport(options: {
  inputPath: string;
  isDryRun: boolean;
  validateExampleOnly?: boolean;
  onlyCategory?: string;
  allowFallbackImage?: boolean;
}): Promise<ImportReport> {
  const {
    inputPath,
    isDryRun,
    validateExampleOnly = false,
    onlyCategory,
    allowFallbackImage = false,
  } = options;
  const resolvedInput = path.resolve(process.cwd(), inputPath);
  const inputBaseDir = path.dirname(resolvedInput);

  const rawText = await fs.readFile(resolvedInput, 'utf8');
  const parsedFile = JSON.parse(rawText) as CatalogImportFile;

  const records: RawImportProduct[] =
    validateExampleOnly && parsedFile.exampleRecord
      ? [parsedFile.exampleRecord]
      : Array.isArray(parsedFile.products)
      ? parsedFile.products
      : [];

  const report: ImportReport = {
    isDryRun,
    inputPath: resolvedInput,
    totalFound: records.length,
    imported: 0,
    validatedDryRun: 0,
    skippedDuplicates: 0,
    skippedUnmatchedCategory: 0,
    skippedMissingInfo: 0,
    missingMrpCount: 0,
    failed: 0,
    uploadedImagesCount: 0,
    originalImagesUploadedCount: 0,
    defaultImagesUsedCount: 0,
    categoriesProcessed: [],
    unmatchedDetails: [],
    missingInfoDetails: [],
    failedDetails: [],
  };

  await connectDB();

  const dbCategories = (await Category.find({ isActive: true })
    .select('slug legacyId name subcategories isActive')
    .lean()) as ExistingCategoryDoc[];

  if (dbCategories.length === 0) {
    throw new Error('No active categories exist in MongoDB. Cannot map or import products.');
  }

  const existingProducts = await Product.find({}).select('name slug sku legacyId').lean();
  const seenSlugs = new Set<string>(existingProducts.map((p: any) => String(p.slug || '').toLowerCase()));
  const seenSkus = new Set<string>(existingProducts.map((p: any) => String(p.sku || '').toUpperCase()));
  const seenNames = new Set<string>(
    existingProducts.map((p: any) => String(p.name || '').trim().toLowerCase())
  );
  const processedCategorySet = new Set<string>();

  for (const item of records) {
    const label = item?.name?.trim() || '<unnamed product>';
    try {
      // 1. Category mapping strictly within existing MongoDB categories
      const categoryResolution = resolveExistingCategory(
        item.sourceCategory,
        item.sourceSubCategory,
        dbCategories
      );
      if (!categoryResolution.matched || !categoryResolution.targetCategorySlug) {
        report.skippedUnmatchedCategory++;
        report.unmatchedDetails.push({
          name: label,
          sourceCategory: item.sourceCategory || '',
          reason: categoryResolution.reason || 'Unmatched category',
        });
        continue;
      }

      if (onlyCategory && categoryResolution.targetCategorySlug !== onlyCategory.trim().toLowerCase()) {
        report.skippedUnmatchedCategory++;
        report.unmatchedDetails.push({
          name: label,
          sourceCategory: item.sourceCategory || '',
          reason: `Excluded by --only-category=${onlyCategory} filter`,
        });
        continue;
      }

      processedCategorySet.add(categoryResolution.targetCategorySlug);

      // 2. Minimum name check + duplicate protection (never overwrite existing products)
      if (!item.name || item.name.trim().length < 2) {
        report.skippedMissingInfo++;
        report.missingInfoDetails.push({ name: label, reason: 'Missing valid product name' });
        continue;
      }

      const targetSlug = item.slug?.trim().toLowerCase() || slugify(item.name);
      const targetSku = (
        item.sku?.trim() ||
        `FUR-${targetSlug.slice(0, 10).toUpperCase()}-${String(seenSkus.size + 1).padStart(4, '0')}`
      ).toUpperCase();
      const normalizedName = item.name.trim().toLowerCase();

      if (seenSlugs.has(targetSlug) || seenSkus.has(targetSku) || seenNames.has(normalizedName)) {
        report.skippedDuplicates++;
        continue;
      }

      // 3. Required price & images validation before upload/insert
      if (typeof item.price !== 'number' || Number.isNaN(item.price) || item.price <= 0) {
        report.skippedMissingInfo++;
        report.missingInfoDetails.push({ name: label, reason: 'Missing valid positive selling price' });
        continue;
      }
      if (!Array.isArray(item.images) || item.images.length === 0) {
        report.skippedMissingInfo++;
        report.missingInfoDetails.push({ name: label, reason: 'At least one verified product image is required' });
        continue;
      }

      // 4. Image validation (cap to existing MAX_GALLERY_IMAGES = 10; optional Priority 2 fallback if remote fails)
      const candidateImages = item.images.slice(0, MAX_GALLERY_IMAGES);
      const checkedImages: string[] = [];
      let imageError = '';
      let usedDefaultPlaceholder = false;

      for (const imgSrc of candidateImages) {
        const checked = await resolveAndValidateImageSource(imgSrc, inputBaseDir, !isDryRun);
        if (!checked.valid) {
          if (allowFallbackImage) {
            checkedImages.push(DEFAULT_WEBSITE_PLACEHOLDER_IMAGE);
            usedDefaultPlaceholder = true;
            continue;
          }
          imageError = checked.reason || 'Invalid product image';
          break;
        }
        checkedImages.push(checked.resolvedSource);
      }

      if (imageError || checkedImages.length === 0) {
        report.skippedMissingInfo++;
        report.missingInfoDetails.push({
          name: label,
          reason: imageError || 'No valid product images available',
        });
        continue;
      }

      // 5. Build payload strictly matching existing ProductInputSchema (NO new fields)
      const shortDesc = item.shortDescription?.trim() || item.name.trim();
      const fullDesc = item.fullDescription?.trim() || shortDesc;

      const candidatePayload = {
        name: item.name.trim(),
        slug: targetSlug,
        sku: targetSku,
        category: categoryResolution.targetCategorySlug,
        categoryLabel: categoryResolution.targetCategoryLabel,
        subCategory: categoryResolution.targetSubCategory || 'General',
        price: item.price,
        originalPrice: item.originalPrice ?? 0,
        badge: item.badge ?? null,
        isBestseller: Boolean(item.isBestseller),
        isFeatured: Boolean(item.isFeatured),
        isActive: item.isActive ?? true,
        stockQuantity: item.stockQuantity ?? 10,
        shortDescription: shortDesc,
        fullDescription: fullDesc,
        dimensions: item.dimensions || {},
        materials: Array.isArray(item.materials) ? item.materials : [],
        colors: Array.isArray(item.colors)
          ? item.colors.map((c) => ({
              name: c.name,
              hex: c.hex || '#211710',
              inStock: c.inStock ?? true,
              ...(c.image ? { image: c.image } : {}),
              ...(typeof c.price === 'number' ? { price: c.price } : {}),
              ...(typeof c.originalPrice === 'number' ? { originalPrice: c.originalPrice } : {}),
            }))
          : [],
        colorName: item.colorName?.trim() || '',
        colorHex: item.colorHex?.trim() || '',
        images: checkedImages.map((src, idx) =>
          /^https?:\/\//i.test(src)
            ? src
            : `https://placeholder.local/validated-local-${idx + 1}.jpg`
        ),
        leadTime: item.leadTime ?? '',
        warranty: item.warranty ?? '',
      };

      const parsed = ProductInputSchema.safeParse(candidatePayload);
      if (!parsed.success) {
        const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        report.skippedMissingInfo++;
        report.missingInfoDetails.push({ name: label, reason: `Validation error: ${msg}` });
        continue;
      }

      const hasValidMrp = Boolean(item.originalPrice && item.originalPrice > 0);
      if (!hasValidMrp) {
        report.missingMrpCount++;
      }

      if (isDryRun) {
        seenSlugs.add(targetSlug);
        seenSkus.add(targetSku);
        seenNames.add(normalizedName);
        if (usedDefaultPlaceholder) {
          report.defaultImagesUsedCount++;
        }
        report.validatedDryRun++;
        continue;
      }

      // 6. Upload images to existing Cloudinary folder (`mnc-lifestyle/products`) and insert via existing Product model
      const uploadedDetails: IProductImageDetail[] = [];
      for (let idx = 0; idx < checkedImages.length; idx++) {
        const imgSource = checkedImages[idx];
        if (imgSource === DEFAULT_WEBSITE_PLACEHOLDER_IMAGE) {
          uploadedDetails.push({
            url: imgSource,
            key: '',
            altText: `${item.name.trim()} - View ${idx + 1}`,
            isPrimary: idx === 0,
          });
          report.defaultImagesUsedCount++;
          continue;
        }
        try {
          const detail = await uploadImageToCloudinary(
            imgSource,
            targetSlug,
            `${item.name.trim()} - View ${idx + 1}`,
            idx === 0
          );
          if (!isCloudinaryFolderUrl(imgSource)) {
            report.uploadedImagesCount++;
            report.originalImagesUploadedCount++;
          }
          uploadedDetails.push(detail);
        } catch (uploadErr) {
          if (allowFallbackImage) {
            console.warn(
              `[Fallback Image Used] "${label}" (${imgSource}): ${
                uploadErr instanceof Error ? uploadErr.message : String(uploadErr)
              }`
            );
            uploadedDetails.push({
              url: DEFAULT_WEBSITE_PLACEHOLDER_IMAGE,
              key: '',
              altText: `${item.name.trim()} - View ${idx + 1}`,
              isPrimary: idx === 0,
            });
            report.defaultImagesUsedCount++;
          } else {
            throw uploadErr;
          }
        }
      }

      const uploadedUrls = uploadedDetails.map((d) => d.url);
      const { linkedVariantIds: _unusedLinks, ...validatedFields } = parsed.data;

      await Product.create({
        ...validatedFields,
        images: uploadedUrls,
        imageDetails: uploadedDetails,
        legacyId: targetSku.toLowerCase(),
        isArchived: false,
        seoMeta: {
          title: `${item.name.trim()} — MNC LifeStyle`,
          description: shortDesc,
          keywords: [
            item.name.trim(),
            categoryResolution.targetCategoryLabel || categoryResolution.targetCategorySlug,
            categoryResolution.targetSubCategory || '',
          ].filter(Boolean),
          ogImage: uploadedUrls[0] || '',
        },
      });

      seenSlugs.add(targetSlug);
      seenSkus.add(targetSku);
      seenNames.add(normalizedName);
      report.imported++;
      if (report.imported % 15 === 0) {
        console.log(`[Import Progress] Imported ${report.imported} products...`);
      }
    } catch (error: unknown) {
      report.failed++;
      const reason = error instanceof Error ? error.message : String(error);
      report.failedDetails.push({ name: label, reason });
    }
  }

  // Refresh Category.itemCount conservatively from live active products without modifying category schema/structure
  if (!isDryRun && report.imported > 0) {
    for (const catSlug of processedCategorySet) {
      const activeCount = await Product.countDocuments({
        category: catSlug,
        isArchived: { $ne: true },
        isActive: true,
      });
      await Category.updateOne({ slug: catSlug }, { $set: { itemCount: activeCount } });
    }
  }

  report.categoriesProcessed = Array.from(processedCategorySet);
  return report;
}

const isMain = process.argv[1]?.includes('import-catalog');
if (isMain) {
  const inputArg = process.argv.find((arg) => arg.startsWith('--input='));
  const onlyCatArg = process.argv.find((arg) => arg.startsWith('--only-category='));
  const allowFallbackImage = process.argv.includes('--allow-fallback-image');
  const inputPath = inputArg
    ? inputArg.slice('--input='.length)
    : 'src/scripts/catalog-import.template.json';
  const isDryRun = !process.argv.includes('--execute') || process.argv.includes('--dry-run');
  const validateExampleOnly = process.argv.includes('--validate-example');

  runCatalogImport({
    inputPath,
    isDryRun,
    validateExampleOnly,
    onlyCategory: onlyCatArg ? onlyCatArg.slice('--only-category='.length) : undefined,
    allowFallbackImage,
  })
    .then((report) => {
      console.log('\n=====================================================');
      console.log(`CATALOG IMPORT REPORT [${report.isDryRun ? 'DRY-RUN' : 'EXECUTED'}]`);
      console.log('=====================================================');
      console.log(JSON.stringify(report, null, 2));
      process.exit(report.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Catalog import failed:', err);
      process.exit(1);
    });
}
