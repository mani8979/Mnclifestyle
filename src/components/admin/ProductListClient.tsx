'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { slugify } from '@/lib/validations/product';
import {
  Package,
  Plus,
  Search,
  ArrowUpDown,
  Edit3,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { formatINR } from '@/utils/currency';

interface ProductItem {
  _id: string;
  id?: string;
  legacyId?: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel?: string;
  subCategory?: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  inStock: boolean;
  isActive: boolean;
  badge?: string | null;
  images: string[];
  updatedAt: string;
}

const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'sofas', name: 'Sofas' },
  { id: 'beds', name: 'Beds' },
  { id: 'dining-sets', name: 'Dining Sets' },
  { id: 'study-tables', name: 'Study Tables' },
  { id: 'centre-tables', name: 'Centre Tables' },
  { id: 'recliners', name: 'Recliners' },
  { id: 'wardrobes', name: 'Wardrobes' },
  { id: 'cabinets-sideboards', name: 'Cabinets & Sideboards' },
  { id: 'office-furniture', name: 'Office Furniture' },
  { id: 'shoe-racks', name: 'Shoe Racks' },
  { id: 'bar-furniture', name: 'Bar Furniture' },
];

export default function ProductListClient() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSort, setSelectedSort] = useState('updated-desc');

  // Deletion modal state
  const [deleteModalProduct, setDeleteModalProduct] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        category: selectedCategory,
        status: selectedStatus,
        sort: selectedSort,
        page: page.toString(),
        limit: '10',
      });

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        setNotification({ type: 'error', message: data.message || 'Failed to load products' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: 'Network error loading products' });
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, selectedStatus, selectedSort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteConfirm = async () => {
    if (!deleteModalProduct) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${deleteModalProduct._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setNotification({ type: 'success', message: data.message || 'Product unlisted successfully' });
        setDeleteModalProduct(null);
        fetchProducts();
      } else {
        setNotification({ type: 'error', message: data.message || 'Failed to archive product' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: 'Failed to archive product' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-md hover:bg-black/5 text-current cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header with Title and Add Product Button */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-blue-600 font-medium">Products Catalog</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-blue-600" />
            <span>Furniture Products ({total})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your furniture catalog, update pricing, specifications, descriptions, and publication status.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-xs transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
          {/* Search Box */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by product name or category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Filter products by category"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Publication Status Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter products by publication status"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Sort & Quick Reset Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              aria-label="Sort products order"
              className="bg-transparent border-0 text-slate-800 font-semibold focus:ring-0 cursor-pointer"
            >
              <option value="updated-desc">Recently Updated</option>
              <option value="updated-asc">Oldest Updated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          {(search || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setPage(1);
              }}
              className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              Loading Products...
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center px-4">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              No products found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              No pieces match your search or filter parameters. Try adjusting the filters or add a new piece.
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Product</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => {
                  const primaryImg = p.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80';
                  const isDiscounted = p.originalPrice && p.originalPrice > p.price;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Thumbnail & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                            <img
                              src={primaryImg}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 leading-tight flex items-center gap-2">
                              <span>{p.name}</span>
                              {p.badge && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold uppercase tracking-wider border border-blue-200">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {p.subCategory || p.category}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="capitalize text-slate-800 font-medium">
                          {p.categoryLabel || p.category}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {formatINR(p.price)}
                        </div>
                        {isDiscounted && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {formatINR(p.originalPrice!)}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {p.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View on Storefront */}
                          <Link
                            href={`/product/${p.slug || slugify(p.name)}`}
                            target="_blank"
                            title="View on public storefront"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit */}
                          <Link
                            href={`/admin/products/${p._id}/edit`}
                            title="Edit product"
                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete/Archive */}
                          <button
                            onClick={() => setDeleteModalProduct(p)}
                            title="Archive / Delete product"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination Footer */}
        {total > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="text-slate-900 font-semibold">{(page - 1) * 10 + 1}</span> to{' '}
              <span className="text-slate-900 font-semibold">{Math.min(page * 10, total)}</span> of{' '}
              <span className="text-slate-900 font-semibold">{total}</span> pieces
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 font-semibold text-slate-800">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-left">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Archive Product?
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to archive <strong className="text-slate-900">&quot;{deleteModalProduct.name}&quot;</strong>?
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 mb-6">
              This performs a safe archival: the product will be unlisted immediately from the customer storefront and public APIs while preserving historical data.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteModalProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold tracking-wider transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Archiving...</span>
                  </>
                ) : (
                  <span>Confirm Archive</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
