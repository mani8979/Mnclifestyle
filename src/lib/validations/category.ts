import { z } from 'zod';

/**
 * Returns true only when `val` is a complete, browser-fetchable image URL or static asset path
 * (used to prevent premature `<img src>` network errors while typing partial URLs).
 */
export function isValidHttpImageUrl(val: string): boolean {
  const trimmed = val.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return /^\/[a-zA-Z0-9._/-]+\.(?:png|jpe?g|webp|svg|gif)(?:\?.*)?$/i.test(trimmed);
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const host = parsed.hostname;
    if (!host) return false;
    if (host !== 'localhost' && !host.includes('.')) return false;
    if (/^\d+(?:\.\d+)*$/.test(host)) {
      const octets = host.split('.');
      if (octets.length !== 4 || octets.some((o) => Number(o) > 255)) return false;
    }
    return parsed.pathname.length > 1 || Boolean(parsed.search);
  } catch {
    return false;
  }
}

export const SafeImageRefSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true;
      if (val.startsWith('/') && !val.startsWith('//')) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
      } catch {
        return false;
      }
    },
    { message: 'Image must be a relative path or an http/https URL' }
  );

const SubcategoriesFieldSchema = z.union([
  z.array(z.string().trim().min(1)).max(50),
  z.string().trim(),
]);

export const CategoryCreateSchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  title: z.string().trim().max(150).optional(),
  description: z.string().trim().max(1000).optional(),
  image: SafeImageRefSchema.optional(),
  imageKey: z.string().trim().max(300).optional(),
  subcategories: SubcategoriesFieldSchema.optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const CategoryUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(100).optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  title: z.string().trim().max(150).optional(),
  description: z.string().trim().max(1000).optional(),
  image: SafeImageRefSchema.optional(),
  imageKey: z.string().trim().max(300).optional(),
  subcategories: SubcategoriesFieldSchema.optional(),
  forceRemoveSubcategories: z.boolean().optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const CategoryReorderSchema = z.object({
  orders: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        orderIndex: z.coerce.number().int().min(0).optional(),
      })
    )
    .min(1, 'Invalid orders payload'),
});

export const SubcategoryRemoveSchema = z.object({
  subCategory: z.string().trim().min(1, 'Subcategory name is required').max(120),
  action: z.enum(['transfer', 'delete-all']).optional(),
  targetCategoryId: z.string().trim().optional(),
  targetSubCategory: z.string().trim().max(120).optional(),
});

export const CategoryDeleteBodySchema = z.object({
  action: z.enum(['transfer', 'delete-all']).optional(),
  targetCategoryId: z.string().trim().optional(),
  targetSubCategory: z.string().trim().max(120).optional(),
});

export function normalizeSubcategoriesInput(input?: string[] | string): string[] {
  const rawList = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? input.split(',')
      : [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of rawList) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(trimmed);
    }
  }
  return result;
}
