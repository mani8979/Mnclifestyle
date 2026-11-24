import React from 'react';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { getCategories } from '@/services/categoryService';
import ProductForm from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Product | MNC LifeStyle Admin',
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  await connectDB();

  const { id } = await params;

  let query: any;
  if (mongoose.Types.ObjectId.isValid(id)) {
    query = { _id: id };
  } else {
    query = { $or: [{ legacyId: id }, { slug: id }, { sku: id.toUpperCase() }] };
  }

  const [productDoc, categories] = await Promise.all([
    Product.findOne(query).lean(),
    getCategories(),
  ]);

  if (!productDoc) {
    notFound();
  }

  // Convert MongoDB document to plain JSON-serializable object
  const product = JSON.parse(JSON.stringify(productDoc));

  return <ProductForm initialProduct={product} isEdit={true} initialCategories={categories} />;
}
