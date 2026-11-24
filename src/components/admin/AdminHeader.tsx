'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, ExternalLink, LogOut } from 'lucide-react';
import { AdminJWTPayload } from '@/lib/auth';

interface AdminHeaderProps {
  admin: AdminJWTPayload | null;
  onOpenMobileSidebar: () => void;
}

export default function AdminHeader({ admin, onOpenMobileSidebar }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      // Continue with redirect even if network drops
    }
    router.push('/admin/login');
    router.refresh();
  };

  const roleLabel = admin?.role === 'super_admin' ? 'Super Admin' : 'Admin';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Mobile Toggle & Brand indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation sidebar"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="font-serif text-blue-600 font-bold text-sm">MNC LifeStyle</span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Administration Portal</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* View Customer Storefront */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Admin Profile Info */}
        {admin && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold">
              {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {admin.name}
              </div>
              <div className="text-[10px] text-blue-600 font-medium tracking-wide uppercase">
                {roleLabel}
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          aria-label="Logout of administrative session"
          title="Logout"
          className="p-2 sm:px-3 sm:py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
