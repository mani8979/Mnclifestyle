import mongoose from 'mongoose';
import { Product } from '@/models/Product';
import { InventoryMovement } from '@/models/InventoryMovement';
import type { AdminJWTPayload } from '@/lib/auth';
import type {
  AdjustmentType,
  StockAdjustmentInput,
  StockReleaseInput,
  StockReservationInput,
  InventorySettingsInput,
} from '@/lib/validations/inventory';

export interface InventoryMutationResult {
  product: {
    id: string;
    sku: string;
    name: string;
    stockQuantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    inStock: boolean;
  } | null;
  movement: any;
  slug?: string;
  category?: string;
}

export class InventoryOperationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'InventoryOperationError';
    this.status = status;
  }
}

export function findProductByIdentifierQuery(id: string) {
  const trimmed = decodeURIComponent(id || '').trim();
  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    return { _id: new mongoose.Types.ObjectId(trimmed), isArchived: { $ne: true } };
  }
  return {
    $or: [
      { sku: trimmed.toUpperCase() },
      { slug: trimmed.toLowerCase() },
      { legacyId: trimmed },
    ],
    isArchived: { $ne: true },
  };
}

function buildAdminAttribution(admin: AdminJWTPayload) {
  const cleanId = typeof admin.id === 'string' ? admin.id.trim() : '';
  if (!cleanId || !mongoose.Types.ObjectId.isValid(cleanId)) {
    throw new InventoryOperationError('Unauthorized: Valid admin identity required', 401);
  }
  return {
    adminId: cleanId,
    adminName: admin.name || admin.email || 'Administrator',
  };
}

function formatProductSnapshot(product: any) {
  return {
    id: product.legacyId || product._id.toString(),
    sku: product.sku,
    name: product.name,
    stockQuantity: product.stockQuantity,
    availableQuantity: product.availableQuantity,
    reservedQuantity: product.reservedQuantity,
    inStock: product.inStock,
  };
}

function computeInventorySetPipeline(newStockExpr: any, newReservedExpr: any) {
  const safeReservedExpr = { $ifNull: [newReservedExpr, 0] };
  const safeAvailableExpr = {
    $cond: [
      { $eq: ['$trackInventory', false] },
      newStockExpr,
      { $max: [0, { $subtract: [newStockExpr, safeReservedExpr] }] },
    ],
  };
  return [
    {
      $set: {
        stockQuantity: newStockExpr,
        reservedQuantity: safeReservedExpr,
        availableQuantity: safeAvailableExpr,
        inStock: {
          $cond: [
            { $eq: ['$trackInventory', false] },
            true,
            {
              $or: [
                { $gt: [safeAvailableExpr, 0] },
                { $eq: ['$allowBackorders', true] },
              ],
            },
          ],
        },
        inventoryUpdatedAt: '$$NOW',
      },
    },
  ];
}

function isReductionType(type: AdjustmentType) {
  return type === 'Stock Sold' || type === 'Manual Reduction' || type === 'Damaged Goods';
}

function isAdditionType(type: AdjustmentType) {
  return type === 'Stock Received' || type === 'Manual Addition' || type === 'Returned Goods';
}

/**
 * Atomically adjusts physical stockQuantity + derived fields alongside an immutable InventoryMovement
 * inside a single ACID MongoDB transaction using only existing schema fields.
 */
export async function adjustInventoryStock(
  identifier: string,
  input: StockAdjustmentInput,
  admin: AdminJWTPayload,
  options?: { simulateMovementFailure?: boolean }
): Promise<InventoryMutationResult> {
  const { adjustmentType, quantity, reason, notes } = input;
  const attribution = buildAdminAttribution(admin);

  if (adjustmentType !== 'Stock Correction' && quantity <= 0) {
    throw new InventoryOperationError(
      `Quantity for "${adjustmentType}" must be at least 1 unit.`,
      400
    );
  }

  if (!isReductionType(adjustmentType) && !isAdditionType(adjustmentType) && adjustmentType !== 'Stock Correction') {
    throw new InventoryOperationError(
      `Unsupported adjustment type for this route: ${adjustmentType}`,
      400
    );
  }

  const session = await mongoose.startSession();
  try {
    const resultHolder: { value: InventoryMutationResult | null } = { value: null };

    await session.withTransaction(async () => {
      const target = await Product.findOne(findProductByIdentifierQuery(identifier))
        .select('_id sku name stockQuantity reservedQuantity availableQuantity trackInventory allowBackorders slug category')
        .session(session);

      if (!target) {
        throw new InventoryOperationError('Product not found.', 404);
      }

      let filter: any = { _id: target._id, isArchived: { $ne: true } };
      let pipeline: any[];

      if (isReductionType(adjustmentType)) {
        filter = {
          ...filter,
          $expr: {
            $gte: [
              { $subtract: ['$stockQuantity', { $ifNull: ['$reservedQuantity', 0] }] },
              quantity,
            ],
          },
        };
        pipeline = computeInventorySetPipeline(
          { $subtract: ['$stockQuantity', quantity] },
          '$reservedQuantity'
        );
      } else if (isAdditionType(adjustmentType)) {
        pipeline = computeInventorySetPipeline(
          { $add: ['$stockQuantity', quantity] },
          '$reservedQuantity'
        );
      } else {
        filter = {
          ...filter,
          $expr: { $gte: [quantity, { $ifNull: ['$reservedQuantity', 0] }] },
        };
        pipeline = computeInventorySetPipeline(quantity, '$reservedQuantity');
      }

      const updated = await Product.findOneAndUpdate(filter, pipeline, {
        session,
        returnDocument: 'after',
        updatePipeline: true,
      });

      if (!updated) {
        const latest = await Product.findById(target._id)
          .select('stockQuantity reservedQuantity')
          .session(session)
          .lean();
        const latestStock = latest?.stockQuantity ?? target.stockQuantity;
        const latestReserved = latest?.reservedQuantity ?? target.reservedQuantity ?? 0;
        if (adjustmentType === 'Stock Correction') {
          throw new InventoryOperationError(
            `Stock cannot be reduced below reserved quantity (${latestReserved} units currently reserved). New physical stock would be ${quantity}.`,
            400
          );
        }
        throw new InventoryOperationError(
          `Cannot adjust stock below zero or below reserved quantity (${latestReserved} reserved). Current physical stock is ${latestStock}, requested reduction: ${quantity}.`,
          400
        );
      }

      const newPhysical = updated.stockQuantity;
      const reserved = updated.reservedQuantity || 0;
      let previousQuantity: number;
      let quantityChanged: number;

      if (isReductionType(adjustmentType)) {
        previousQuantity = newPhysical + quantity;
        quantityChanged = -quantity;
      } else if (isAdditionType(adjustmentType)) {
        previousQuantity = newPhysical - quantity;
        quantityChanged = quantity;
      } else {
        previousQuantity = target.stockQuantity;
        quantityChanged = newPhysical - previousQuantity;
      }

      if (options?.simulateMovementFailure) {
        throw new InventoryOperationError('Simulated ledger write failure to verify rollback', 500);
      }

      const [movement] = await InventoryMovement.create(
        [
          {
            productId: updated._id,
            sku: updated.sku,
            productName: updated.name,
            previousQuantity,
            quantityChanged,
            newQuantity: newPhysical,
            previousReserved: reserved,
            newReserved: reserved,
            adjustmentType,
            reason,
            notes: notes || '',
            ...attribution,
            timestamp: new Date(),
          },
        ],
        { session }
      );

      resultHolder.value = {
        product: formatProductSnapshot(updated),
        movement,
        slug: updated.slug,
        category: updated.category,
      };
    });

    if (!resultHolder.value) {
      throw new InventoryOperationError('Inventory adjustment transaction did not complete.', 500);
    }

    return resultHolder.value;
  } finally {
    await session.endSession();
  }
}

/**
 * Atomically reserves stock units + logs Reservation movement inside a MongoDB transaction.
 */
export async function reserveInventoryStock(
  identifier: string,
  input: StockReservationInput,
  admin: AdminJWTPayload
): Promise<InventoryMutationResult> {
  const { quantity, reason, notes } = input;
  const attribution = buildAdminAttribution(admin);

  const session = await mongoose.startSession();
  try {
    const resultHolder: { value: InventoryMutationResult | null } = { value: null };

    await session.withTransaction(async () => {
      const target = await Product.findOne(findProductByIdentifierQuery(identifier))
        .select('_id sku name stockQuantity reservedQuantity availableQuantity trackInventory slug category')
        .session(session);

      if (!target) {
        throw new InventoryOperationError('Product not found.', 404);
      }

      const filter: any = {
        _id: target._id,
        isArchived: { $ne: true },
        $or: [
          { trackInventory: false },
          {
            $expr: {
              $gte: [
                { $subtract: ['$stockQuantity', { $ifNull: ['$reservedQuantity', 0] }] },
                quantity,
              ],
            },
          },
        ],
      };

      const pipeline = computeInventorySetPipeline(
        '$stockQuantity',
        { $add: [{ $ifNull: ['$reservedQuantity', 0] }, quantity] }
      );

      const updated = await Product.findOneAndUpdate(filter, pipeline, {
        session,
        returnDocument: 'after',
        updatePipeline: true,
      });

      if (!updated) {
        const latest = await Product.findById(target._id)
          .select('availableQuantity stockQuantity reservedQuantity')
          .session(session)
          .lean();
        const avail = latest?.availableQuantity ?? Math.max(0, (latest?.stockQuantity || 0) - (latest?.reservedQuantity || 0));
        throw new InventoryOperationError(
          `Cannot reserve ${quantity} units. Only ${avail} units currently available.`,
          400
        );
      }

      const newReserved = updated.reservedQuantity || 0;
      const previousReserved = Math.max(0, newReserved - quantity);

      const [movement] = await InventoryMovement.create(
        [
          {
            productId: updated._id,
            sku: updated.sku,
            productName: updated.name,
            previousQuantity: updated.stockQuantity,
            quantityChanged: 0,
            newQuantity: updated.stockQuantity,
            previousReserved,
            newReserved,
            adjustmentType: 'Reservation',
            reason,
            notes: notes || `Reserved ${quantity} units`,
            ...attribution,
            timestamp: new Date(),
          },
        ],
        { session }
      );

      resultHolder.value = {
        product: formatProductSnapshot(updated),
        movement,
        slug: updated.slug,
        category: updated.category,
      };
    });

    if (!resultHolder.value) {
      throw new InventoryOperationError('Inventory reservation transaction did not complete.', 500);
    }
    return resultHolder.value;
  } finally {
    await session.endSession();
  }
}

/**
 * Atomically releases reserved units (either restoring available stock or finalizing Stock Sold)
 * alongside an immutable InventoryMovement inside a single MongoDB transaction.
 */
export async function releaseInventoryStock(
  identifier: string,
  input: StockReleaseInput,
  admin: AdminJWTPayload
): Promise<InventoryMutationResult> {
  const { quantity, isSold, reason, notes } = input;
  const attribution = buildAdminAttribution(admin);

  const session = await mongoose.startSession();
  try {
    const resultHolder: { value: InventoryMutationResult | null } = { value: null };

    await session.withTransaction(async () => {
      const target = await Product.findOne(findProductByIdentifierQuery(identifier))
        .select('_id sku name stockQuantity reservedQuantity trackInventory slug category')
        .session(session);

      if (!target) {
        throw new InventoryOperationError('Product not found.', 404);
      }

      const filter: any = {
        _id: target._id,
        isArchived: { $ne: true },
        reservedQuantity: { $gte: quantity },
      };

      const nextReservedExpr = { $subtract: ['$reservedQuantity', quantity] };
      const nextStockExpr = isSold
        ? { $max: [0, { $subtract: ['$stockQuantity', quantity] }] }
        : '$stockQuantity';

      const pipeline = computeInventorySetPipeline(nextStockExpr, nextReservedExpr);

      const updated = await Product.findOneAndUpdate(filter, pipeline, {
        session,
        returnDocument: 'after',
        updatePipeline: true,
      });

      if (!updated) {
        const latest = await Product.findById(target._id)
          .select('reservedQuantity')
          .session(session)
          .lean();
        throw new InventoryOperationError(
          `Cannot release ${quantity} units. Only ${latest?.reservedQuantity ?? 0} units currently reserved.`,
          400
        );
      }

      const newReserved = updated.reservedQuantity || 0;
      const previousReserved = newReserved + quantity;
      const newPhysical = updated.stockQuantity;
      const prevPhysical = target.stockQuantity;
      const quantityChanged = isSold ? newPhysical - prevPhysical : 0;
      const adjustmentType: 'Stock Sold' | 'Reservation Release' = isSold
        ? 'Stock Sold'
        : 'Reservation Release';

      const [movement] = await InventoryMovement.create(
        [
          {
            productId: updated._id,
            sku: updated.sku,
            productName: updated.name,
            previousQuantity: prevPhysical,
            quantityChanged,
            newQuantity: newPhysical,
            previousReserved,
            newReserved,
            adjustmentType,
            reason:
              reason ||
              (isSold
                ? 'Fulfillment from reservation'
                : 'Reservation cancellation/release'),
            notes: notes || '',
            ...attribution,
            timestamp: new Date(),
          },
        ],
        { session }
      );

      resultHolder.value = {
        product: formatProductSnapshot(updated),
        movement,
        slug: updated.slug,
        category: updated.category,
      };
    });

    if (!resultHolder.value) {
      throw new InventoryOperationError('Inventory release transaction did not complete.', 500);
    }
    return resultHolder.value;
  } finally {
    await session.endSession();
  }
}

export async function updateInventorySettings(
  identifier: string,
  updates: InventorySettingsInput
) {
  const product = await Product.findOne(findProductByIdentifierQuery(identifier));
  if (!product) {
    throw new InventoryOperationError('Product not found', 404);
  }

  if (updates.lowStockThreshold !== undefined) product.lowStockThreshold = updates.lowStockThreshold;
  if (updates.trackInventory !== undefined) product.trackInventory = updates.trackInventory;
  if (updates.allowBackorders !== undefined) product.allowBackorders = updates.allowBackorders;
  if (updates.costPrice !== undefined) product.costPrice = updates.costPrice;

  await product.save();
  return product;
}
