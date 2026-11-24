import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategorySEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ICategory extends Document {
  legacyId?: string | null;
  slug: string;
  name: string;
  title: string;
  tagline?: string;
  description: string;
  image: string;
  imageKey?: string;
  subtitle?: string;
  itemCount: number;
  subcategories: string[];
  orderIndex: number;
  isActive: boolean;
  seoMeta?: ICategorySEO;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySEOSchema = new Schema<ICategorySEO>(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String }],
  },
  { _id: false }
);

const CategorySchema = new Schema<ICategory>(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
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
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    itemCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    subcategories: [{ type: String, trim: true }],
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
      type: CategorySEOSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
