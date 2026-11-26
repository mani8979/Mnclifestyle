'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Boxes, History, FileSpreadsheet, Download } from 'lucide-react';

interface InventorySubNavProps {
  title: string;
  description: string;
}

const TABS = [
  { href: '/admin/inventory', label: 'Stock Overview', icon: Boxes },
  { href: '/admin/inventory/history', label: 'Movement History', icon: History },
  { href: '/admin/inventory/reports', label: 'Valuation & Reports', icon: FileSpreadsheet },
];

export default function InventorySubNav({ title, description }: InventorySubNavProps) {
  const pathname = usePathname();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-blue-600 font-medium">Inventory</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-blue-600" />
            <span>{title}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="/api/admin/inventory/reports/export?type=stock"
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Stock CSV</span>
          </a>
          <a
            href="/api/admin/inventory/reports/export?type=movements"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Movements CSV</span>
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                active
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
