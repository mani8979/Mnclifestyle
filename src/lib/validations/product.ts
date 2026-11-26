import { z } from 'zod';

export const categoryLabelsMap: Record<string, string> = {
  sofas: 'Sofas',
  beds: 'Beds',
  'dining-sets': 'Dining Sets',
  'study-tables': 'Study Tables',
  'centre-tables': 'Centre Tables',
  recliners: 'Recliners',
  wardrobes: 'Wardrobes',
  'cabinets-sideboards': 'Cabinets & Sideboards',
  'office-furniture': 'Office Furniture',
  'shoe-racks': 'Shoe Racks',
  'bar-furniture': 'Bar Furniture',
};

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCategoryLabel(slug: string): string {
  return categoryLabelsMap[slug] || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
}

export const ColorVariantSchema = z.object({
  name: z.string().min(1, 'Color name is required'),
  hex: z.string().min(1, 'Hex color code is required'),
  inStock: z.boolean().default(true),
  image: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  originalPrice: z.coerce.number().min(0).optional(),
});

export const ImageDetailSchema = z.object({
  url: z.string().url('Each image must be a valid URL'),
  key: z.string().optional().default(''),
  altText: z.string().optional().default(''),
  isPrimary: z.boolean().optional().default(false),
  width: z.number().optional(),
  height: z.number().optional(),
});

const DimensionsBaseSchema = z.object({
  width: z.string().optional(),
  depth: z.string().optional(),
  height: z.string().optional(),
  seatHeight: z.string().optional(),
  bedBaseHeight: z.string().optional(),
  weight: z.string().optional(),
});

export const DimensionsSchema = DimensionsBaseSchema.extend({
  width: DimensionsBaseSchema.shape.width.default(''),
  depth: DimensionsBaseSchema.shape.depth.default(''),
  height: DimensionsBaseSchema.shape.height.default(''),
  seatHeight: DimensionsBaseSchema.shape.seatHeight.default(''),
  bedBaseHeight: DimensionsBaseSchema.shape.bedBaseHeight.default(''),
  weight: DimensionsBaseSchema.shape.weight.default(''),
});

const SEOBaseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().optional(),
});

export const SEOSchema = SEOBaseSchema.extend({
  title: SEOBaseSchema.shape.title.default(''),
  description: SEOBaseSchema.shape.description.default(''),
  keywords: SEOBaseSchema.shape.keywords.default([]),
  ogImage: SEOBaseSchema.shape.ogImage.default(''),
});

export const CustomSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Section title is required'),
  content: z.string().optional().default(''),
  icon: z.string().optional().default('check'),
});

// Shared un-defaulted base schema so partial updates omit unprovided fields cleanly.
const ProductCoreSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(150),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  sku: z
    .string()
    .min(2, 'SKU must be at least 2 characters')
    .max(50)
    .transform((val) => val.trim().toUpperCase())
    .optional(),
  category: z.string().min(1, 'Category is required'),
  categoryLabel: z.string().optional(),
  subCategory: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  originalPrice: z.coerce.number().min(0).optional(),
  badge: z.string().nullable().optional(),
  isBestseller: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  stockQuantity: z.coerce.number().min(0, 'Stock cannot be negative').optional(),
  reservedQuantity: z.coerce.number().min(0, 'Reserved stock cannot be negative').optional(),
  lowStockThreshold: z.coerce.number().min(0).optional(),
  trackInventory: z.boolean().optional(),
  allowBackorders: z.boolean().optional(),
  costPrice: z.coerce.number().min(0).optional(),
  inStock: z.boolean().optional(),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  dimensions: DimensionsBaseSchema.optional(),
  materials: z.array(z.string()).optional(),
  colors: z.array(ColorVariantSchema).optional(),
  colorName: z.string().max(80).optional(),
  colorHex: z.string().max(20).optional(),
  linkedVariantIds: z.array(z.string()).optional(),
  images: z.array(z.string().url('Each image must be a valid URL')).optional(),
  imageDetails: z.array(ImageDetailSchema).optional(),
  leadTime: z.string().optional(),
  warranty: z.string().optional(),
  customSections: z.array(CustomSectionSchema).optional(),
  seoMeta: SEOBaseSchema.optional(),
});

const productCoreShape = ProductCoreSchema.shape;

export const ProductInputSchema = ProductCoreSchema.extend({
  subCategory: productCoreShape.subCategory.default('General'),
  originalPrice: productCoreShape.originalPrice.default(0),
  badge: productCoreShape.badge.default(null),
  isBestseller: productCoreShape.isBestseller.default(false),
  isFeatured: productCoreShape.isFeatured.default(false),
  isActive: productCoreShape.isActive.default(true),
  stockQuantity: z.coerce.number().min(0, 'Stock cannot be negative').default(10),
  reservedQuantity: productCoreShape.reservedQuantity.default(0),
  lowStockThreshold: productCoreShape.lowStockThreshold.default(5),
  trackInventory: productCoreShape.trackInventory.default(true),
  allowBackorders: productCoreShape.allowBackorders.default(false),
  costPrice: productCoreShape.costPrice.default(0),
  inStock: productCoreShape.inStock.default(true),
  shortDescription: productCoreShape.shortDescription.default(
    'Handcrafted premium furniture designed for contemporary living.'
  ),
  fullDescription: productCoreShape.fullDescription.default(
    'Handcrafted with premium materials, precision joinery, and tailored luxury aesthetics.'
  ),
  dimensions: DimensionsSchema.optional().default(() => ({
    width: '',
    depth: '',
    height: '',
    seatHeight: '',
    bedBaseHeight: '',
    weight: '',
  })),
  materials: productCoreShape.materials.default(['Kiln-Dried Hardwood']),
  colors: productCoreShape.colors.default([]),
  colorName: productCoreShape.colorName.default(''),
  colorHex: productCoreShape.colorHex.default(''),
  images: productCoreShape.images.default([]),
  imageDetails: productCoreShape.imageDetails.default([]),
  leadTime: productCoreShape.leadTime.default(
    'Complimentary White-Glove In-Home Delivery across AP (3–7 Days)'
  ),
  warranty: productCoreShape.warranty.default('10-Year Structural Frame & Termite Warranty'),
  customSections: productCoreShape.customSections.default([]),
  seoMeta: SEOSchema.optional().default(() => ({
    title: '',
    description: '',
    keywords: [],
    ogImage: '',
  })),
});

export const ProductUpdateSchema = ProductCoreSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof ProductInputSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
