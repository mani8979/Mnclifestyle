'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminJWTPayload } from '@/lib/auth';

interface AdminShellClientProps {
  initialSession: AdminJWTPayload | null;
  children: React.ReactNode;
}

export default function AdminShellClient({ initialSession, children }: AdminShellClientProps) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If on login route, render standalone without admin sidebar or top header
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="h-screen bg-slate-100 text-slate-900 flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader
          admin={initialSession}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
