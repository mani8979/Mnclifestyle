import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICollectionSEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ICollection extends Document {
  slug: string;
  legacyId?: string;
  title: string;
  category: string;
  subtitle?: string;
  tagline?: string;
  description: string;
  image: string;
  imageKey?: string;
  materials: string[];
  piecesCount?: string;
  featuredProductIds: string[];
  orderIndex: number;
  isActive: boolean;
  seoMeta?: ICollectionSEO;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSEOSchema = new Schema<ICollectionSEO>(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String }],
  },
  { _id: false }
);

const CollectionSchema = new Schema<ICollection>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    legacyId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },
    title: {
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
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    imageKey: {
      type: String,
      default: '',
    },
    materials: [{ type: String, trim: true }],
    piecesCount: {
      type: String,
      default: '',
    },
    featuredProductIds: [{ type: String, trim: true }],
    orderIndex: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    seoMeta: {
      type: CollectionSEOSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Collection: Model<ICollection> =
  mongoose.models.Collection || mongoose.model<ICollection>('Collection', CollectionSchema);

export default Collection;
