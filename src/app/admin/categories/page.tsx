import React from 'react';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import CategoryManagerClient from '@/components/admin/CategoryManagerClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Category & Subcategory Management | MNC LifeStyle Admin',
};

export default async function AdminCategoriesPage() {
  await requireAdminSession();
  await connectDB();

  const categoriesDocs = await Category.find({})
    .sort({ orderIndex: 1, createdAt: 1 })
    .lean();

  const categories = categoriesDocs.map((c: any) => ({
    ...c,
    id: c._id.toString(),
    _id: c._id.toString(),
    subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
  }));

  return <CategoryManagerClient initialCategories={JSON.parse(JSON.stringify(categories))} />;
}
