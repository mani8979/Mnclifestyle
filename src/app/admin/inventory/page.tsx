import React from 'react';
import { requireAdminSession } from '@/lib/auth';
import { getCategories } from '@/services/categoryService';
import InventoryDashboardClient from '@/components/admin/InventoryDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Inventory Management | MNC LifeStyle Admin',
};

export default async function AdminInventoryPage() {
  await requireAdminSession();
  const categories = await getCategories();

  return (
    <InventoryDashboardClient
      categories={categories.map((c: any) => ({ slug: c.slug || c.id, name: c.name }))}
    />
  );
}
