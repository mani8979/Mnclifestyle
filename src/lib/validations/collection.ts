import { z } from 'zod';
import { SafeImageRefSchema, normalizeSubcategoriesInput } from '@/lib/validations/category';

const StringListFieldSchema = z.union([
  z.array(z.string().trim().min(1)).max(100),
  z.string().trim(),
]);

const CollectionSEOSchema = z.object({
  title: z.string().trim().max(160).optional(),
  description: z.string().trim().max(500).optional(),
  keywords: StringListFieldSchema.optional(),
});

export const normalizeCollectionStringList = normalizeSubcategoriesInput;

export const CollectionCreateSchema = z.object({
  title: z.string().trim().min(2, 'Collection title must be at least 2 characters').max(150),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  legacyId: z.string().trim().max(120).nullable().optional(),
  category: z.string().trim().min(1, 'Category reference is required').max(120),
  subtitle: z.string().trim().max(160).optional().default(''),
  tagline: z.string().trim().max(240).optional().default(''),
  description: z.string().trim().min(5, 'Collection description must be at least 5 characters').max(2000),
  image: SafeImageRefSchema.refine((v) => v.length > 0, {
    message: 'Collection cover image is required',
  }),
  imageKey: z.string().trim().max(300).optional().default(''),
  materials: StringListFieldSchema.optional(),
  piecesCount: z.string().trim().max(80).optional().default(''),
  featuredProductIds: z.array(z.string().trim().min(1)).max(60).optional().default([]),
  orderIndex: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional().default(true),
  seoMeta: CollectionSEOSchema.optional(),
});

export const CollectionUpdateSchema = z.object({
  title: z.string().trim().min(2, 'Collection title must be at least 2 characters').max(150).optional(),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  legacyId: z.string().trim().max(120).nullable().optional(),
  category: z.string().trim().min(1, 'Category reference is required').max(120).optional(),
  subtitle: z.string().trim().max(160).optional(),
  tagline: z.string().trim().max(240).optional(),
  description: z.string().trim().min(5, 'Collection description must be at least 5 characters').max(2000).optional(),
  image: SafeImageRefSchema.refine((v) => v.length > 0, {
    message: 'Collection cover image is required',
  }).optional(),
  imageKey: z.string().trim().max(300).optional(),
  materials: StringListFieldSchema.optional(),
  piecesCount: z.string().trim().max(80).optional(),
  featuredProductIds: z.array(z.string().trim().min(1)).max(60).optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  seoMeta: CollectionSEOSchema.optional(),
});

export const CollectionReorderSchema = z.object({
  orders: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        orderIndex: z.coerce.number().int().min(0).optional(),
      })
    )
    .min(1, 'Invalid orders payload'),
});
