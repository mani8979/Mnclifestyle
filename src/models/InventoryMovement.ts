import mongoose, { Schema, Document, Model } from 'mongoose';

export type AdjustmentType =
  | 'Stock Received'
  | 'Stock Sold'
  | 'Manual Addition'
  | 'Manual Reduction'
  | 'Damaged Goods'
  | 'Returned Goods'
  | 'Stock Correction'
  | 'Reservation'
  | 'Reservation Release';

export interface IInventoryMovement extends Document {
  productId: mongoose.Types.ObjectId;
  sku: string;
  productName: string;
  previousQuantity: number;
  quantityChanged: number;
  newQuantity: number;
  previousReserved: number;
  newReserved: number;
  adjustmentType: AdjustmentType;
  reason: string;
  notes?: string;
  adminId?: string;
  adminName: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    quantityChanged: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    previousReserved: {
      type: Number,
      default: 0,
      min: 0,
    },
    newReserved: {
      type: Number,
      default: 0,
      min: 0,
    },
    adjustmentType: {
      type: String,
      required: true,
      enum: [
        'Stock Received',
        'Stock Sold',
        'Manual Addition',
        'Manual Reduction',
        'Damaged Goods',
        'Returned Goods',
        'Stock Correction',
        'Reservation',
        'Reservation Release',
      ],
      index: true,
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    adminId: {
      type: String,
      default: '',
    },
    adminName: {
      type: String,
      default: 'Administrator',
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        delete ret.__v;
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

// Compound indexes for performant history queries
InventoryMovementSchema.index({ sku: 1, timestamp: -1 });
InventoryMovementSchema.index({ productId: 1, timestamp: -1 });
InventoryMovementSchema.index({ adjustmentType: 1, timestamp: -1 });

export const InventoryMovement: Model<IInventoryMovement> =
  mongoose.models.InventoryMovement ||
  mongoose.model<IInventoryMovement>('InventoryMovement', InventoryMovementSchema);

export default InventoryMovement;
