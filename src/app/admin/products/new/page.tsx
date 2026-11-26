import React from 'react';
import { requireAdminSession } from '@/lib/auth';
import { getCategories } from '@/services/categoryService';
import ProductForm from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Add New Furniture Piece | MNC LifeStyle Admin',
};

export default async function NewProductPage() {
  await requireAdminSession();
  const categories = await getCategories();

  return <ProductForm isEdit={false} initialCategories={categories} />;
}
