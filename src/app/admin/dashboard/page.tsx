import React from 'react';
import Link from 'next/link';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { Collection } from '@/models/Collection';
import { Admin } from '@/models/Admin';
import {
  Package,
  FolderTree,
  Layers,
  Boxes,
  Users,
  ArrowUpRight,
  ShieldCheck,
  Database,
  Clock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  await connectDB();

  const [productsCount, categoriesCount, collectionsCount, lowStockAlertsCount, adminsCount] =
    await Promise.all([
      Product.countDocuments({ isActive: true, isArchived: { $ne: true } }),
      Category.countDocuments({ isActive: true }),
      Collection.countDocuments({ isActive: true }),
      Product.countDocuments({
        isArchived: { $ne: true },
        trackInventory: true,
        $or: [
          { availableQuantity: { $lte: 0 }, allowBackorders: { $ne: true } },
          {
            availableQuantity: { $gt: 0 },
            $expr: { $lte: ['$availableQuantity', { $ifNull: ['$lowStockThreshold', 5] }] },
          },
        ],
      }),
      Admin.countDocuments({ isActive: true }),
    ]);

  const cards = [
    {
      label: 'Published Products',
      count: productsCount,
      href: '/admin/products',
      icon: Package,
      change: 'Active in Storefront Catalog',
      accent: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      label: 'Categories & Subcategories',
      count: categoriesCount,
      href: '/admin/categories',
      icon: FolderTree,
      change: 'Dynamic Departments & Filters',
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      label: 'Curated Collections',
      count: collectionsCount,
      href: '/admin/collections',
      icon: Layers,
      change: 'Live Room Suites (/collections)',
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Stock Alerts',
      count: lowStockAlertsCount,
      href: '/admin/inventory',
      icon: Boxes,
      change: 'Low or Out of Stock SKUs',
      accent: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      label: 'Admin Accounts',
      count: adminsCount,
      href: '#',
      icon: Users,
      change: 'Security & Access Control Enforced',
      accent: 'text-slate-700 bg-slate-100 border-slate-200',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 mb-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Administrative Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {session.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-sans max-w-2xl">
            MNC LifeStyle atelier administration. Manage products, categories, specifications, and catalog data.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>Atlas Connected</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Session: 8h</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block mb-1">
                    {card.label}
                  </span>
                  <span className="text-3xl sm:text-4xl font-bold text-slate-900">
                    {card.count}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border ${card.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] font-medium">{card.change}</span>
                {card.href !== '#' && (
                  <Link
                    href={card.href}
                    className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Manage</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & System Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Catalog Management Modules
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Direct shortcuts to inspect and administer catalog records.
          </p>

          <div className="space-y-3">
            <Link
              href="/admin/products"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Products Catalog
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Manage handcrafted pieces, specifications, custom sections, and pricing
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Categories & Subcategories
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Add new categories, organize dynamic subcategories, and manage slugs
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </Link>

            <Link
              href="/admin/collections"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Curated Collections
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Manage collection themes, linked categories, and featured product sets
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </Link>

            <Link
              href="/admin/inventory"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Inventory & Movement Ledger
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Adjust stock levels, manage showroom holds, view movement logs, and export CSVs
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Security & System Status */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Security & Session
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Active authentication protections and session parameters.
            </p>

            <ul className="space-y-3.5 text-xs">
              <li className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Session Signature:</span>
                <span className="font-mono text-slate-800 font-semibold">jose HS256 JWT</span>
              </li>
              <li className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Cookie Transport:</span>
                <span className="font-mono text-emerald-600 font-semibold">HTTP-Only, SameSite=Lax</span>
              </li>
              <li className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Password Encryption:</span>
                <span className="font-mono text-slate-800 font-semibold">bcrypt (12 rounds)</span>
              </li>
              <li className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Brute-force Shield:</span>
                <span className="font-mono text-emerald-600 font-semibold">Active (5 attempts / 15m)</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Origin Verification:</span>
                <span className="font-mono text-emerald-600 font-semibold">Enforced</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            Logged in as <strong className="text-slate-900">{session.email}</strong>. Session automatically terminates after 8 hours of inactivity.
          </div>
        </div>
      </div>
    </div>
  );
}
