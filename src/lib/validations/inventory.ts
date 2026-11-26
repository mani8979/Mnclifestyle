import { z } from 'zod';

export const ADJUSTMENT_TYPES = [
  'Stock Received',
  'Stock Sold',
  'Manual Addition',
  'Manual Reduction',
  'Damaged Goods',
  'Returned Goods',
  'Stock Correction',
  'Reservation',
  'Reservation Release',
] as const;

export type AdjustmentType = (typeof ADJUSTMENT_TYPES)[number];

export const StockAdjustmentSchema = z.object({
  adjustmentType: z.enum([
    'Stock Received',
    'Stock Sold',
    'Manual Addition',
    'Manual Reduction',
    'Damaged Goods',
    'Returned Goods',
    'Stock Correction',
    'Reservation',
    'Reservation Release',
  ]),
  quantity: z.coerce.number().int('Quantity must be a whole number').min(0, 'Adjustment quantity cannot be negative'),
  reason: z.string().trim().min(2, 'Adjustment reason must be at least 2 characters').max(200),
  notes: z.string().trim().max(500).optional().default(''),
});

export const StockReservationSchema = z.object({
  quantity: z.coerce.number().int('Quantity must be a whole number').min(1, 'Reservation quantity must be at least 1 unit'),
  reason: z.string().trim().min(2, 'Reservation reason must be specified').max(200),
  notes: z.string().trim().max(500).optional().default(''),
});

export const StockReleaseSchema = z.object({
  quantity: z.coerce.number().int('Quantity must be a whole number').min(1, 'Release quantity must be at least 1 unit'),
  isSold: z.boolean().optional().default(false),
  reason: z.string().trim().max(200).optional().default(''),
  notes: z.string().trim().max(500).optional().default(''),
});

export const InventorySettingsSchema = z.object({
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  trackInventory: z.boolean().optional(),
  allowBackorders: z.boolean().optional(),
  costPrice: z.coerce.number().min(0).optional(),
});

export type StockAdjustmentInput = z.infer<typeof StockAdjustmentSchema>;
export type StockReservationInput = z.infer<typeof StockReservationSchema>;
export type StockReleaseInput = z.infer<typeof StockReleaseSchema>;
export type InventorySettingsInput = z.infer<typeof InventorySettingsSchema>;
