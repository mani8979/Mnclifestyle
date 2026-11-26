import React from 'react';
import { requireAdminSession } from '@/lib/auth';
import InventoryReportsClient from '@/components/admin/InventoryReportsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Inventory Valuation & Reports | MNC LifeStyle Admin',
};

export default async function AdminInventoryReportsPage() {
  await requireAdminSession();
  return <InventoryReportsClient />;
}
