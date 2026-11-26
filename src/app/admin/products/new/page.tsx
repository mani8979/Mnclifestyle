import React from 'react';
import mongoose from 'mongoose';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { getCategories } from '@/services/categoryService';
import { getLinkedAdminVariants } from '@/lib/color-variants';
import ProductForm from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Add New Furniture Piece | MNC LifeStyle Admin',
};

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ variantOf?: string }>;
}) {
  await requireAdminSession();
  const [{ variantOf }, categories] = await Promise.all([
    searchParams,
    getCategories(),
  ]);

  let variantTemplate: any = null;
  let prelinkedVariants: any[] = [];

  if (variantOf && variantOf.trim()) {
    await connectDB();
    const id = variantOf.trim();
    const lookupQuery = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { $or: [{ legacyId: id }, { slug: id }, { sku: id.toUpperCase() }] };

    const sourceDoc: any = await Product.findOne({
      ...lookupQuery,
      isArchived: { $ne: true },
    }).lean();

    if (sourceDoc) {
      const existingSiblings = await getLinkedAdminVariants(sourceDoc);
      prelinkedVariants = existingSiblings;
      variantTemplate = JSON.parse(
        JSON.stringify({
          name: sourceDoc.name,
          category: sourceDoc.category,
          categoryLabel: sourceDoc.categoryLabel,
          subCategory: sourceDoc.subCategory,
          price: sourceDoc.price,
          originalPrice: sourceDoc.originalPrice,
          shortDescription: sourceDoc.shortDescription,
          fullDescription: sourceDoc.fullDescription,
          dimensions: sourceDoc.dimensions,
          materials: sourceDoc.materials,
          warranty: sourceDoc.warranty,
          leadTime: sourceDoc.leadTime,
          customSections: sourceDoc.customSections,
          images: Array.isArray(sourceDoc.images) ? sourceDoc.images : [],
          imageDetails: Array.isArray(sourceDoc.imageDetails) ? sourceDoc.imageDetails : [],
        })
      );
    }
  }

  return (
    <ProductForm
      isEdit={false}
      initialCategories={categories}
      initialProduct={variantTemplate}
      initialLinkedVariants={prelinkedVariants}
      isColorVariantClone={Boolean(variantTemplate)}
    />
  );
}
