import React from 'react';
import { getAdminSession } from '@/lib/auth';
import AdminShellClient from '@/components/admin/AdminShellClient';

export const metadata = {
  title: 'Admin Atelier Portal | MNC LifeStyle',
  description: 'Administrative management console for MNC LifeStyle luxury furniture atelier.',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  return (
    <AdminShellClient initialSession={session}>
      {children}
    </AdminShellClient>
  );
}
