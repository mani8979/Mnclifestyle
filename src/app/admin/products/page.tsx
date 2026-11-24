import React from 'react';
import { requireAdminSession } from '@/lib/auth';
import ProductListClient from '@/components/admin/ProductListClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Products Catalog | MNC LifeStyle Admin',
};

export default async function AdminProductsPage() {
  // Independent server-side authentication verification
  await requireAdminSession();

  return <ProductListClient />;
}
