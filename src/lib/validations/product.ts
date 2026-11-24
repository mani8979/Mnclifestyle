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
});

export const ImageDetailSchema = z.object({
  url: z.string().url('Each image must be a valid URL'),
  key: z.string().optional().default(''),
  altText: z.string().optional().default(''),
  isPrimary: z.boolean().optional().default(false),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const DimensionsSchema = z.object({
  width: z.string().optional().default(''),
  depth: z.string().optional().default(''),
  height: z.string().optional().default(''),
  seatHeight: z.string().optional().default(''),
  bedBaseHeight: z.string().optional().default(''),
  weight: z.string().optional().default(''),
});

export const SEOSchema = z.object({
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  keywords: z.array(z.string()).optional().default([]),
  ogImage: z.string().optional().default(''),
});

export const CustomSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Section title is required'),
  content: z.string().optional().default(''),
  icon: z.string().optional().default('check'),
});

export const ProductInputSchema = z.object({
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
  subCategory: z.string().optional().default('General'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  originalPrice: z.coerce.number().min(0).optional().default(0),
  badge: z.string().nullable().optional().default(null),
  isBestseller: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  stockQuantity: z.coerce.number().min(0, 'Stock cannot be negative').default(10),
  reservedQuantity: z.coerce.number().min(0, 'Reserved stock cannot be negative').optional().default(0),
  lowStockThreshold: z.coerce.number().min(0).optional().default(5),
  trackInventory: z.boolean().optional().default(true),
  allowBackorders: z.boolean().optional().default(false),
  costPrice: z.coerce.number().min(0).optional().default(0),
  inStock: z.boolean().optional().default(true),
  shortDescription: z
    .string()
    .optional()
    .default('Handcrafted premium furniture designed for contemporary living.'),
  fullDescription: z
    .string()
    .optional()
    .default('Handcrafted with premium materials, precision joinery, and tailored luxury aesthetics.'),
  dimensions: DimensionsSchema.optional().default(() => ({
    width: '',
    depth: '',
    height: '',
    seatHeight: '',
    bedBaseHeight: '',
    weight: '',
  })),
  materials: z.array(z.string()).optional().default(['Kiln-Dried Hardwood']),
  colors: z.array(ColorVariantSchema).optional().default([]),
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .optional()
    .default(['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80']),
  imageDetails: z.array(ImageDetailSchema).optional().default([]),
  leadTime: z.string().optional().default('Complimentary White-Glove In-Home Delivery across AP (3–7 Days)'),
  warranty: z.string().optional().default('10-Year Structural Frame & Termite Warranty'),
  customSections: z.array(CustomSectionSchema).optional().default([]),
  seoMeta: SEOSchema.optional().default(() => ({
    title: '',
    description: '',
    keywords: [],
    ogImage: '',
  })),
});

export const ProductUpdateSchema = ProductInputSchema.partial();

export type ProductInput = z.infer<typeof ProductInputSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
