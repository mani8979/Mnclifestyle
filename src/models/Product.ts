import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IColorVariant {
  name: string;
  hex: string;
  inStock: boolean;
}

export interface IDimensions {
  width?: string;
  depth?: string;
  height?: string;
  seatHeight?: string;
  bedBaseHeight?: string;
  weight?: string;
}

export interface IProductImageDetail {
  url: string;
  key?: string;
  altText?: string;
  isPrimary?: boolean;
  width?: number;
  height?: number;
}

export interface IProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface ICustomSection {
  id?: string;
  title: string;
  content: string;
  icon?: string;
}

export interface IProduct extends Document {
  legacyId: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  subCategory: string;
  price: number;
  originalPrice?: number;
  badge?: string | null;
  isBestseller: boolean;
  isFeatured: boolean;
  isActive: boolean;
  isArchived?: boolean;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  costPrice?: number;
  inventoryUpdatedAt: Date;
  inStock: boolean;
  shortDescription: string;
  fullDescription: string;
  dimensions: IDimensions;
  materials: string[];
  colors: IColorVariant[];
  images: string[];
  imageDetails?: IProductImageDetail[];
  leadTime?: string;
  warranty?: string;
  rating: number;
  reviewsCount: number;
  customSections?: ICustomSection[];
  seoMeta?: IProductSEO;
  createdAt: Date;
  updatedAt: Date;
}

const ColorVariantSchema = new Schema<IColorVariant>(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
    inStock: { type: Boolean, default: true },
  },
  { _id: false }
);

const DimensionsSchema = new Schema<IDimensions>(
  {
    width: { type: String, default: '' },
    depth: { type: String, default: '' },
    height: { type: String, default: '' },
    seatHeight: { type: String, default: '' },
    bedBaseHeight: { type: String, default: '' },
    weight: { type: String, default: '' },
  },
  { _id: false }
);

const ImageDetailSchema = new Schema<IProductImageDetail>(
  {
    url: { type: String, required: true },
    key: { type: String, default: '' },
    altText: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false }
);

const SEOSchema = new Schema<IProductSEO>(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String }],
    ogImage: { type: String, default: '' },
  },
  { _id: false }
);

const CustomSectionSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: '' },
    icon: { type: String, default: 'check' },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    legacyId: {
      type: String,
      unique: true,
      index: true,
      trim: true,
      default: function (this: any) {
        return this.sku ? this.sku.toLowerCase() : `mnc-${Date.now()}`;
      },
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    categoryLabel: {
      type: String,
      required: true,
      trim: true,
    },
    subCategory: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    originalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    badge: {
      type: String,
      default: null,
      trim: true,
    },
    isBestseller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    stockQuantity: {
      type: Number,
      default: 10,
      min: 0,
      index: true,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      default: 10,
      min: 0,
      index: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
    trackInventory: {
      type: Boolean,
      default: true,
      index: true,
    },
    allowBackorders: {
      type: Boolean,
      default: false,
    },
    costPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    inventoryUpdatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },
    fullDescription: {
      type: String,
      required: true,
      trim: true,
    },
    dimensions: {
      type: DimensionsSchema,
      default: () => ({}),
    },
    materials: [{ type: String, trim: true }],
    colors: [ColorVariantSchema],
    images: [{ type: String, required: true }],
    imageDetails: [ImageDetailSchema],
    leadTime: {
      type: String,
      default: 'Complimentary White-Glove In-Home Delivery across AP (3–7 Days)',
    },
    warranty: {
      type: String,
      default: '10-Year Structural Frame & Termite Warranty',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    customSections: [CustomSectionSchema],
    seoMeta: {
      type: SEOSchema,
      default: () => ({}),
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
    toObject: {
      virtuals: true,
      transform(_doc, ret: any) {
        delete ret.__v;
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

// Compound text index for search
ProductSchema.index({
  name: 'text',
  shortDescription: 'text',
  fullDescription: 'text',
  materials: 'text',
  subCategory: 'text',
});

// Category and price indexing
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ category: 1, isBestseller: 1 });
ProductSchema.index({ category: 1, isFeatured: 1 });

// Pre-save hook to ensure availableQuantity and inStock calculations remain consistent
ProductSchema.pre('save', function () {
  if (this.trackInventory === false) {
    this.inStock = true;
    this.availableQuantity = typeof this.stockQuantity === 'number' ? this.stockQuantity : 0;
  } else {
    const physical = typeof this.stockQuantity === 'number' ? this.stockQuantity : 0;
    const reserved = typeof this.reservedQuantity === 'number' ? this.reservedQuantity : 0;
    this.availableQuantity = Math.max(0, physical - reserved);
    this.inStock = this.availableQuantity > 0 || Boolean(this.allowBackorders);
  }
  this.inventoryUpdatedAt = new Date();
});

if (mongoose.models.Product) {
  delete (mongoose.models as any).Product;
}

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
