'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  AlertCircle,
  Loader2,
  ExternalLink,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from 'lucide-react';
import { formatINR } from '@/utils/currency';
import InventorySubNav from './InventorySubNav';
import InventoryAdjustModal, { InventoryProductItem } from './InventoryAdjustModal';

interface InventoryStats {
  totalProducts: number;
  totalStockUnits: number;
  availableStockUnits: number;
  reservedStockUnits: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  madeToOrderCount: number;
  totalCostValuation: number;
  totalRetailValuation: number;
  estimatedGrossProfitPotential: number;
}

interface RowItem extends InventoryProductItem {
  id: string;
  slug: string;
  category: string;
  categoryLabel?: string;
  images?: string[];
  calculatedStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'made_to_order';
}

interface InventoryDashboardClientProps {
  categories: Array<{ slug: string; name: string }>;
}

export default function InventoryDashboardClient({ categories }: InventoryDashboardClientProps) {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [items, setItems] = useState<RowItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('stock-desc');

  const [selectedProduct, setSelectedProduct] = useState<RowItem | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reqSeqRef = useRef(0);

  useEffect(() => {
    if (!search) {
      setDebouncedSearch('');
      return;
    }
    const timer = window.setTimeout(() => setDebouncedSearch(search), 220);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadData = useCallback(async () => {
    const seq = ++reqSeqRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        category,
        status,
        sort,
        page: page.toString(),
        limit: '15',
      });
      const [listRes, statsRes] = await Promise.all([
        fetch(`/api/admin/inventory?${params.toString()}`, { signal: controller.signal }),
        fetch('/api/admin/inventory/stats', { signal: controller.signal }),
      ]);
      const [listJson, statsJson] = await Promise.all([listRes.json(), statsRes.json()]);

      if (controller.signal.aborted || seq !== reqSeqRef.current) return;

      if (!listRes.ok || !listJson.success) {
        throw new Error(listJson.message || 'Failed to load inventory list');
      }
      setItems(listJson.products || []);
      setTotal(listJson.pagination?.total || 0);
      setTotalPages(listJson.pagination?.totalPages || 1);

      if (statsRes.ok && statsJson.success) {
        setStats(statsJson.stats);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || controller.signal.aborted) return;
      setErrorMsg(err.message || 'Error loading inventory');
    } finally {
      if (seq === reqSeqRef.current) {
        setIsLoading(false);
      }
    }
  }, [debouncedSearch, category, status, sort, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const statusBadge = (st: RowItem['calculatedStatus']) => {
    if (st === 'out_of_stock') {
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
          Out of Stock
        </span>
      );
    }
    if (st === 'low_stock') {
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Low Stock
        </span>
      );
    }
    if (st === 'made_to_order') {
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          Made to Order
        </span>
      );
    }
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        In Stock
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <InventorySubNav
        title="Inventory Management & Stock Overview"
        description="Monitor live physical, reserved, and available stock counts, manage holds, and keep storefront availability synchronized."
      />

      {/* KPI Strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Active SKUs</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{stats.totalProducts}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Physical Units</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{stats.totalStockUnits}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Available Units</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">{stats.availableStockUnits}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Reserved Holds</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">{stats.reservedStockUnits}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setStatus(status === 'low_stock' ? 'all' : 'low_stock');
              setPage(1);
            }}
            className="text-left bg-white border border-amber-200 hover:bg-amber-50/50 rounded-2xl p-4 shadow-xs cursor-pointer transition-colors"
          >
            <span className="text-[11px] text-amber-700 font-semibold block">Low Stock</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">{stats.lowStockProducts}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus(status === 'out_of_stock' ? 'all' : 'out_of_stock');
              setPage(1);
            }}
            className="text-left bg-white border border-red-200 hover:bg-red-50/50 rounded-2xl p-4 shadow-xs cursor-pointer transition-colors"
          >
            <span className="text-[11px] text-red-700 font-semibold block">Out of Stock</span>
            <span className="text-2xl font-bold text-red-600 mt-1 block">{stats.outOfStockProducts}</span>
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by product name or SKU..."
              aria-label="Search inventory items"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="lg:col-span-3">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Filter inventory by category"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter inventory status"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Stock States</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="made_to_order">Made to Order</option>
            </select>
          </div>

          <div className="lg:col-span-2 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort inventory"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="stock-desc">Stock: High to Low</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="available-asc">Available: Low to High</option>
              <option value="available-desc">Available: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="newest">Recently Adjusted</option>
            </select>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
            <span className="text-xs text-slate-500 font-medium">Loading inventory ledger...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No matching inventory records</h3>
            <p className="text-xs text-slate-500">Adjust filters or search criteria to locate SKUs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Product & SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Physical</th>
                  <th className="py-3.5 px-4">Reserved</th>
                  <th className="py-3.5 px-4">Available</th>
                  <th className="py-3.5 px-4">Threshold</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map((item) => {
                  const physical = item.stockQuantity ?? 0;
                  const reserved = item.reservedQuantity ?? 0;
                  const available = item.availableQuantity ?? Math.max(0, physical - reserved);

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {item.sku} · {formatINR(item.price)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 capitalize">{item.categoryLabel || item.category}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{physical}</td>
                      <td className="py-3.5 px-4 font-mono text-amber-700">{reserved}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{available}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{item.lowStockThreshold ?? 5}</td>
                      <td className="py-3.5 px-4">{statusBadge(item.calculatedStatus)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {item.slug && (
                            <Link
                              href={`/product/${item.slug}`}
                              target="_blank"
                              title="Check storefront availability"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(item)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold cursor-pointer shadow-2xs"
                          >
                            Manage Stock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {total > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total} items
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedProduct && (
        <InventoryAdjustModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}
