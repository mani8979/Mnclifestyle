import React from 'react';
import { requireAdminSession } from '@/lib/auth';
import InventoryHistoryClient from '@/components/admin/InventoryHistoryClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Inventory Movement History | MNC LifeStyle Admin',
};

export default async function AdminInventoryHistoryPage() {
  await requireAdminSession();
  return <InventoryHistoryClient />;
}
