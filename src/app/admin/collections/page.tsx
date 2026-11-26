import React from 'react';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Collection } from '@/models/Collection';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import CollectionManagerClient from '@/components/admin/CollectionManagerClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Collections Management | MNC LifeStyle Admin',
};

export default async function AdminCollectionsPage() {
  await requireAdminSession();
  await connectDB();

  const [collectionDocs, categoryDocs, productDocs] = await Promise.all([
    Collection.find({}).sort({ orderIndex: 1, createdAt: 1 }).lean(),
    Category.find({ isActive: true }).sort({ orderIndex: 1, createdAt: 1 }).select('_id slug name').lean(),
    Product.find({ isArchived: { $ne: true } })
      .sort({ name: 1 })
      .select('_id slug legacyId sku name category categoryLabel price images isActive')
      .lean(),
  ]);

  const initialCollections = collectionDocs.map((c: any) => ({
    ...c,
    id: c._id.toString(),
    _id: c._id.toString(),
  }));

  const categories = categoryDocs.map((c: any) => ({
    id: c._id.toString(),
    slug: c.slug,
    name: c.name,
  }));

  const products = productDocs.map((p: any) => ({
    id: p._id.toString(),
    slug: p.slug,
    legacyId: p.legacyId || '',
    sku: p.sku,
    name: p.name,
    category: p.category,
    categoryLabel: p.categoryLabel || p.category,
    price: p.price || 0,
    images: Array.isArray(p.images) ? p.images : [],
    isActive: Boolean(p.isActive),
  }));

  return (
    <CollectionManagerClient
      initialCollections={JSON.parse(JSON.stringify(initialCollections))}
      categories={JSON.parse(JSON.stringify(categories))}
      products={JSON.parse(JSON.stringify(products))}
    />
  );
}
