'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { slugify } from '@/lib/validations/product';
import {
  Package,
  Plus,
  Search,
  Edit3,
  ExternalLink,
  Trash2,
  RotateCcw,
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
  colorName?: string;
  colorHex?: string;
  colorGroupId?: string;
  linkedVariantCount?: number;
  colors?: Array<{ name: string; hex: string }>;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  inStock: boolean;
  isActive: boolean;
  isArchived?: boolean;
  badge?: string | null;
  images: string[];
  updatedAt: string;
}

interface ProductListClientProps {
  initialCategories?: any[];
}

export default function ProductListClient({ initialCategories = [] }: ProductListClientProps) {
  const [categories, setCategories] = useState<any[]>(initialCategories);

  // Sync state if initialCategories updates
  useEffect(() => {
    if (Array.isArray(initialCategories) && initialCategories.length > 0) {
      setCategories(initialCategories);
    }
  }, [initialCategories]);

  // Always refresh categories from database so changes from /admin/categories appear immediately
  useEffect(() => {
    async function loadFreshCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to load dynamic categories in ProductListClient', err);
      }
    }
    loadFreshCategories();
  }, []);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSort, setSelectedSort] = useState('updated-desc');
  const abortRef = useRef<AbortController | null>(null);
  const reqSeqRef = useRef(0);

  // Checkbox selection & bulk action states (Archived products only)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkConfirmPhraseInput, setBulkConfirmPhraseInput] = useState('');
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    if (!search) {
      setDebouncedSearch('');
      return;
    }
    const timer = window.setTimeout(() => setDebouncedSearch(search), 220);
    return () => window.clearTimeout(timer);
  }, [search]);

  // Active Category Object
  const activeCategoryObj = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return categories.find(
      (c: any) =>
        (c.slug || c.id) === selectedCategory ||
        c.name?.toLowerCase() === selectedCategory?.toLowerCase()
    );
  }, [selectedCategory, categories]);

  // Available Subcategories based on selected Category
  const availableSubcategories: string[] = useMemo(() => {
    if (selectedCategory !== 'all') {
      return Array.isArray(activeCategoryObj?.subcategories)
        ? activeCategoryObj.subcategories
        : [];
    }
    const allSubs = new Set<string>();
    for (const c of categories) {
      if (Array.isArray(c.subcategories)) {
        for (const sub of c.subcategories) {
          if (typeof sub === 'string' && sub.trim()) {
            allSubs.add(sub.trim());
          }
        }
      }
    }
    return Array.from(allSubs).sort();
  }, [selectedCategory, activeCategoryObj, categories]);

  // Reset SubCategory selection when Category changes if current SubCategory is no longer available
  const handleCategoryChange = (newCat: string) => {
    setSelectedCategory(newCat);
    if (newCat !== 'all') {
      const targetCat = categories.find(
        (c: any) =>
          (c.slug || c.id) === newCat ||
          c.name?.toLowerCase() === newCat?.toLowerCase()
      );
      const subs = Array.isArray(targetCat?.subcategories) ? targetCat.subcategories : [];
      if (!subs.some((s) => s.toLowerCase() === selectedSubCategory.toLowerCase())) {
        setSelectedSubCategory('all');
      }
    }
    setPage(1);
    setSelectedProductIds([]); // Clear selection when filter changes
  };

  const handleSubCategoryChange = (newSub: string) => {
    setSelectedSubCategory(newSub);
    setPage(1);
    setSelectedProductIds([]); // Clear selection when filter changes
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setPage(1);
    setSelectedProductIds([]); // Clear selection when switching away or changing status
  };

  // Archival & Restore modal state
  const [deleteModalProduct, setDeleteModalProduct] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restoreModalProduct, setRestoreModalProduct] = useState<ProductItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [permanentDeleteProduct, setPermanentDeleteProduct] = useState<ProductItem | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState('');
  const [isPermanentDeleting, setIsPermanentDeleting] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchProducts = useCallback(async () => {
    const seq = ++reqSeqRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        category: selectedCategory,
        subCategory: selectedSubCategory === 'all' ? '' : selectedSubCategory,
        status: selectedStatus,
        sort: selectedSort,
        page: page.toString(),
        limit: '10',
      });

      const res = await fetch(`/api/admin/products?${params.toString()}`, {
        signal: controller.signal,
      });
      const data = await res.json();

      if (controller.signal.aborted || seq !== reqSeqRef.current) return;

      if (res.ok && data.success) {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        setNotification({ type: 'error', message: data.message || 'Failed to load products' });
      }
    } catch (e: any) {
      if (e?.name === 'AbortError' || controller.signal.aborted) return;
      setNotification({ type: 'error', message: 'Network error loading products' });
    } finally {
      if (seq === reqSeqRef.current) {
        setIsLoading(false);
      }
    }
  }, [debouncedSearch, selectedCategory, selectedSubCategory, selectedStatus, selectedSort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteModalProduct) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${deleteModalProduct._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: data.collectionNotice
            ? `${data.message} ${data.collectionNotice}`
            : data.message || 'Product archived successfully',
        });
        setDeleteModalProduct(null);
        fetchProducts();
      } else {
        setNotification({ type: 'error', message: data.message || 'Failed to archive product' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Failed to archive product' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!restoreModalProduct) return;
    setIsRestoring(true);

    try {
      const res = await fetch(`/api/admin/products/${restoreModalProduct._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: false, isActive: true }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: `Product "${restoreModalProduct.name}" restored and published to storefront.`,
        });
        setRestoreModalProduct(null);
        fetchProducts();
      } else {
        setNotification({ type: 'error', message: data.message || 'Failed to restore product' });
        setRestoreModalProduct(null);
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error restoring product' });
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeleteProduct) return;
    if (confirmNameInput.trim() !== permanentDeleteProduct.name.trim()) return;
    setIsPermanentDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${permanentDeleteProduct._id}?permanent=true`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationName: confirmNameInput.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: 'Product permanently deleted.',
        });
        // Remove from selection if present
        setSelectedProductIds((prev) => prev.filter((id) => id !== permanentDeleteProduct._id));
        setPermanentDeleteProduct(null);
        setConfirmNameInput('');
        fetchProducts();
      } else {
        const errorMsg =
          res.status === 409
            ? data.message || 'Only archived products can be permanently deleted.'
            : data.message || 'Unable to delete this product. Please try again.';
        setNotification({ type: 'error', message: errorMsg });
      }
    } catch {
      setNotification({ type: 'error', message: 'Unable to delete this product. Please try again.' });
    } finally {
      setIsPermanentDeleting(false);
    }
  };

  const handleBulkPermanentDeleteConfirm = async () => {
    if (selectedProductIds.length === 0) return;
    const count = selectedProductIds.length;
    const requiredPhrase = `DELETE ${count} PRODUCT${count > 1 ? 'S' : ''}`;
    if (bulkConfirmPhraseInput.trim().toUpperCase() !== requiredPhrase) return;

    setIsBulkDeleting(true);
    try {
      const res = await fetch('/api/admin/products/bulk-permanent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedProductIds,
          confirmationPhrase: bulkConfirmPhraseInput.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: data.message || `Successfully permanently deleted ${selectedProductIds.length} products.`,
        });
        setSelectedProductIds([]);
        setShowBulkDeleteModal(false);
        setBulkConfirmPhraseInput('');
        fetchProducts();
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Failed to bulk delete selected products.',
        });
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Network error processing bulk deletion.',
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Eligible archived products on the current page
  const pageArchivedProducts = useMemo(() => {
    return products.filter((p) => p.isArchived);
  }, [products]);

  const isAllCurrentPageSelected = useMemo(() => {
    return (
      pageArchivedProducts.length > 0 &&
      pageArchivedProducts.every((p) => selectedProductIds.includes(p._id))
    );
  }, [pageArchivedProducts, selectedProductIds]);

  const isSomeCurrentPageSelected = useMemo(() => {
    return (
      pageArchivedProducts.some((p) => selectedProductIds.includes(p._id)) &&
      !isAllCurrentPageSelected
    );
  }, [pageArchivedProducts, selectedProductIds, isAllCurrentPageSelected]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in duration-200 ${notification.type === 'success'
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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-blue-600 font-medium">Products Catalog</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
            <span>Furniture Products ({total})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your furniture catalog, update pricing, specifications, descriptions, and publication status.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-xs transition-all shadow-xs shrink-0 cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3">
          {/* Search Box (4 cols on lg, full width on mobile/tablet) */}
          <div className="sm:col-span-2 lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by product name or category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setSelectedProductIds([]);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Category Filter (3 cols on lg) */}
          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              aria-label="Filter products by category"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-colors"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c: any) => {
                const val = c.slug || c.id;
                return (
                  <option key={val} value={val}>
                    {c.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Subcategory Filter (3 cols on lg) */}
          <div className="lg:col-span-3">
            <select
              value={selectedSubCategory}
              onChange={(e) => handleSubCategoryChange(e.target.value)}
              aria-label="Filter products by subcategory"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-colors"
            >
              <option value="all">
                {selectedCategory === 'all'
                  ? `All Subcategories (${availableSubcategories.length})`
                  : `All Subcategories (${availableSubcategories.length})`}
              </option>
              {availableSubcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Publication Status Filter (2 cols on lg) */}
          <div className="sm:col-span-2 lg:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              aria-label="Filter products by publication status"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-colors"
            >
              <option value="all">All Active & Drafts</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Sort & Quick Reset Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="shrink-0 font-medium">Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              aria-label="Sort products order"
              className="bg-transparent border-0 text-slate-800 font-semibold focus:ring-0 cursor-pointer text-xs"
            >
              <option value="updated-desc">Recently Updated</option>
              <option value="updated-asc">Oldest Updated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          {(search || selectedCategory !== 'all' || selectedSubCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedSubCategory('all');
                setSelectedStatus('all');
                setPage(1);
                setSelectedProductIds([]);
              }}
              className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Toolbar (Displayed only when products are selected under Archived status) */}
      {selectedStatus === 'archived' && selectedProductIds.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-3 sm:px-5 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg border border-slate-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-blue-600 text-white font-bold text-[11px]">
              {selectedProductIds.length}
            </span>
            <span className="font-semibold text-slate-100">
              {selectedProductIds.length} {selectedProductIds.length === 1 ? 'product' : 'products'} selected
            </span>
            <span className="text-slate-400 text-[11px]">
              (Archived)
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setSelectedProductIds([])}
              className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer text-center"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={() => {
                setShowBulkDeleteModal(true);
                setBulkConfirmPhraseInput('');
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer text-center"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Delete Selected ({selectedProductIds.length})</span>
            </button>
          </div>
        </div>
      )}

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
          <>
            {/* Mobile Select All Toolbar (Visible only on mobile < md when status is archived) */}
            {selectedStatus === 'archived' && (
              <div className="md:hidden p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    aria-label="Select all displayed archived products on this page"
                    checked={isAllCurrentPageSelected}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = isSomeCurrentPageSelected;
                      }
                    }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newIds = new Set([
                          ...selectedProductIds,
                          ...pageArchivedProducts.map((p) => p._id),
                        ]);
                        setSelectedProductIds(Array.from(newIds));
                      } else {
                        const pageIdSet = new Set(pageArchivedProducts.map((p) => p._id));
                        setSelectedProductIds(
                          selectedProductIds.filter((id) => !pageIdSet.has(id))
                        );
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-700 text-xs">
                    Select All ({pageArchivedProducts.length}) on this page
                  </span>
                </label>
                {selectedProductIds.length > 0 && (
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {selectedProductIds.length} selected
                  </span>
                )}
              </div>
            )}

            {/* Mobile Product Card Layout (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100">
              {products.map((p) => {
                const primaryImg = p.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80';
                const isDiscounted = Boolean(p.originalPrice && p.originalPrice > p.price);
                const isSelected = selectedProductIds.includes(p._id);

                return (
                  <div
                    key={p._id}
                    className={`p-3.5 sm:p-4 transition-colors ${isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'
                      }`}
                  >
                    {/* Top Row: Checkbox (archived) + Thumbnail + Product Info */}
                    <div className="flex items-start gap-3">
                      {/* Checkbox (archived only) */}
                      {selectedStatus === 'archived' && (
                        <div className="pt-0.5 shrink-0">
                          {p.isArchived ? (
                            <input
                              type="checkbox"
                              aria-label={`Select product ${p.name}`}
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProductIds((prev) =>
                                    Array.from(new Set([...prev, p._id]))
                                  );
                                } else {
                                  setSelectedProductIds((prev) =>
                                    prev.filter((id) => id !== p._id)
                                  );
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          ) : null}
                        </div>
                      )}

                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                        <img
                          src={primaryImg}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug break-words">
                            {p.name}
                          </h4>
                          {p.badge && (
                            <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold uppercase tracking-wider border border-blue-200">
                              {p.badge}
                            </span>
                          )}
                        </div>

                        {/* SKU */}
                        <div className="text-[11px] text-slate-500 mt-1">
                          SKU: <span className="font-mono text-slate-700 font-medium">{p.sku || p.legacyId || 'N/A'}</span>
                        </div>

                        {/* Category & Subcategory */}
                        <div className="text-[11px] text-slate-600 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="capitalize font-medium text-slate-800">
                            {p.categoryLabel || p.category}
                          </span>
                          {p.subCategory && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="capitalize text-slate-600">{p.subCategory}</span>
                            </>
                          )}
                        </div>

                        {/* Colors */}
                        {Boolean((p.colorName || p.colors?.[0]?.name) || (p.linkedVariantCount && p.linkedVariantCount > 1)) && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {Boolean(p.colorName || p.colors?.[0]?.name) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                                <span
                                  className="w-2 h-2 rounded-full border border-black/20"
                                  style={{ backgroundColor: p.colorHex || p.colors?.[0]?.hex || '#211710' }}
                                />
                                <span>{p.colorName || p.colors?.[0]?.name}</span>
                              </span>
                            )}
                            {Boolean(p.linkedVariantCount && p.linkedVariantCount > 1) && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                                {p.linkedVariantCount} colors
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Price, MRP, Status, Availability */}
                    <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {formatINR(p.price)}
                          </span>
                          {isDiscounted && (
                            <span className="text-[11px] text-slate-400 line-through">
                              {formatINR(p.originalPrice!)}
                            </span>
                          )}
                        </div>
                        {p.stockQuantity !== undefined && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {p.inStock && p.stockQuantity > 0 ? (
                              <span className="text-emerald-700 font-medium">{p.stockQuantity} in stock</span>
                            ) : (
                              <span className="text-rose-600 font-medium">Out of stock</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {p.isArchived ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                            Archived
                          </span>
                        ) : p.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {/* View on Storefront (if not archived) */}
                        {!p.isArchived && (
                          <Link
                            href={`/product/${p.slug || slugify(p.name)}`}
                            target="_blank"
                            title="View on public storefront"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 text-xs font-medium transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                        )}

                        {/* Edit */}
                        <Link
                          href={`/admin/products/${p._id}/edit`}
                          title="Edit product"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {p.isArchived ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setRestoreModalProduct(p)}
                              title="Restore product"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPermanentDeleteProduct(p);
                                setConfirmNameInput('');
                              }}
                              title="Delete Permanently"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>Delete Permanently</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteModalProduct(p)}
                            title="Archive product"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Archive</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop / Tablet Table Layout (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    {selectedStatus === 'archived' && (
                      <th className="py-3.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          aria-label="Select all displayed archived products on this page"
                          checked={isAllCurrentPageSelected}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = isSomeCurrentPageSelected;
                            }
                          }}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newIds = new Set([
                                ...selectedProductIds,
                                ...pageArchivedProducts.map((p) => p._id),
                              ]);
                              setSelectedProductIds(Array.from(newIds));
                            } else {
                              const pageIdSet = new Set(pageArchivedProducts.map((p) => p._id));
                              setSelectedProductIds(
                                selectedProductIds.filter((id) => !pageIdSet.has(id))
                              );
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                    )}
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
                    const isDiscounted = Boolean(p.originalPrice && p.originalPrice > p.price);
                    const isSelected = selectedProductIds.includes(p._id);

                    return (
                      <tr
                        key={p._id}
                        className={`hover:bg-slate-50/70 transition-colors group ${isSelected ? 'bg-blue-50/40' : ''
                          }`}
                      >
                        {/* Checkbox Column (Archived Only) */}
                        {selectedStatus === 'archived' && (
                          <td className="py-3.5 px-3 text-center">
                            {p.isArchived ? (
                              <input
                                type="checkbox"
                                aria-label={`Select product ${p.name}`}
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProductIds((prev) =>
                                      Array.from(new Set([...prev, p._id]))
                                    );
                                  } else {
                                    setSelectedProductIds((prev) =>
                                      prev.filter((id) => id !== p._id)
                                    );
                                  }
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            ) : null}
                          </td>
                        )}

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
                              <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                                <span>{p.subCategory || p.category}</span>
                                {(p.colorName || p.colors?.[0]?.name) && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                                    <span
                                      className="w-2 h-2 rounded-full border border-black/20"
                                      style={{ backgroundColor: p.colorHex || p.colors?.[0]?.hex || '#211710' }}
                                    />
                                    <span>{p.colorName || p.colors?.[0]?.name}</span>
                                  </span>
                                )}
                                {p.linkedVariantCount && p.linkedVariantCount > 1 ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                                    {p.linkedVariantCount} colors mapped
                                  </span>
                                ) : null}
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
                          {p.isArchived ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                              Archived
                            </span>
                          ) : p.isActive ? (
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
                            {/* View on Storefront (active/non-archived) */}
                            {!p.isArchived && (
                              <Link
                                href={`/product/${p.slug || slugify(p.name)}`}
                                target="_blank"
                                title="View on public storefront"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}

                            {/* Edit */}
                            <Link
                              href={`/admin/products/${p._id}/edit`}
                              title="Edit product"
                              className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>

                            {p.isArchived ? (
                              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                <button
                                  type="button"
                                  onClick={() => setRestoreModalProduct(p)}
                                  title="Restore product"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Restore</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPermanentDeleteProduct(p);
                                    setConfirmNameInput('');
                                  }}
                                  title="Delete Permanently"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                  <span>Delete Permanently</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteModalProduct(p)}
                                title="Archive / Delete product"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
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
                onClick={() => {
                  setPage(page - 1);
                }}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 font-semibold text-slate-800">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => {
                  setPage(page + 1);
                }}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete / Archive Confirmation Modal */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 sm:p-7 shadow-2xl relative text-left">
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

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteModalProduct(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60 text-center"
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

      {/* Restore Confirmation Modal */}
      {restoreModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 sm:p-7 shadow-2xl relative text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Restore Product?
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to restore <strong className="text-slate-900">&quot;{restoreModalProduct.name}&quot;</strong> back to the active catalog?
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 mb-6">
              This will publish the product again, re-sync its category item count and storefront routes, and restore public visibility across Search, Shop, and Category pages.
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                disabled={isRestoring}
                onClick={() => setRestoreModalProduct(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleRestoreConfirm}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60 text-center"
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <span>Confirm Restore</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Permanent Delete Confirmation Modal */}
      {permanentDeleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-4 sm:p-7 shadow-2xl relative text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                type="button"
                disabled={isPermanentDeleting}
                onClick={() => {
                  setPermanentDeleteProduct(null);
                  setConfirmNameInput('');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Permanently Delete Product?
            </h3>

            {/* Clear Warning */}
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium mb-4 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>This action permanently deletes this archived product. It cannot be restored.</span>
            </div>

            {/* Product Details Display */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 flex items-center gap-2.5 sm:gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 relative">
                <img
                  src={permanentDeleteProduct.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80'}
                  alt={permanentDeleteProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="font-bold text-slate-900 truncate">
                  {permanentDeleteProduct.name}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5 truncate">
                  SKU: <span className="font-mono font-medium text-slate-700">{permanentDeleteProduct.sku || permanentDeleteProduct.legacyId || 'N/A'}</span>
                </div>
                <div className="text-slate-500 text-[11px] truncate">
                  Category: <span className="capitalize font-medium text-slate-700">{permanentDeleteProduct.categoryLabel || permanentDeleteProduct.category}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-slate-200 text-slate-700">
                  Archived
                </span>
                <div className="font-bold text-slate-900 text-xs mt-1">
                  {formatINR(permanentDeleteProduct.price)}
                </div>
              </div>
            </div>

            {/* Confirmation Field */}
            <div className="space-y-2 mb-6">
              <label className="block text-xs font-semibold text-slate-700">
                To confirm, type <strong className="text-slate-900 font-mono select-all bg-slate-100 px-1 py-0.5 rounded border border-slate-200">&quot;{permanentDeleteProduct.name}&quot;</strong> below:
              </label>
              <input
                type="text"
                placeholder="Type product name exactly..."
                value={confirmNameInput}
                onChange={(e) => setConfirmNameInput(e.target.value)}
                disabled={isPermanentDeleting}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                disabled={isPermanentDeleting}
                onClick={() => {
                  setPermanentDeleteProduct(null);
                  setConfirmNameInput('');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmNameInput.trim() !== permanentDeleteProduct.name.trim() || isPermanentDeleting}
                onClick={handlePermanentDeleteConfirm}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center"
              >
                {isPermanentDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Permanently Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && selectedProductIds.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-4 sm:p-7 shadow-2xl relative text-left flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={() => {
                  setShowBulkDeleteModal(false);
                  setBulkConfirmPhraseInput('');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 shrink-0">
              Permanently Delete {selectedProductIds.length} Products?
            </h3>

            {/* Clear Warning */}
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium mb-4 flex items-start gap-2.5 shrink-0">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                This action permanently deletes {selectedProductIds.length} archived product(s). This action cannot be undone.
              </span>
            </div>

            {/* Scrollable Selected Products List */}
            <div className="space-y-1 mb-2 shrink-0">
              <span className="text-xs font-semibold text-slate-700">
                Products to be deleted ({selectedProductIds.length}):
              </span>
            </div>

            <div className="overflow-y-auto max-h-48 divide-y divide-slate-100 bg-slate-50 rounded-xl border border-slate-200 p-2 mb-4 shrink">
              {(() => {
                const selectedProducts = products.filter((p) => selectedProductIds.includes(p._id));
                const missingCount = selectedProductIds.length - selectedProducts.length;

                return (
                  <>
                    {selectedProducts.map((p) => (
                      <div key={p._id} className="py-2 px-2 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80'}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 truncate">
                            <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">
                              SKU: {p.sku || p.legacyId || 'N/A'} • {p.subCategory || p.categoryLabel || p.category}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-medium text-slate-800">
                          {formatINR(p.price)}
                        </div>
                      </div>
                    ))}
                    {missingCount > 0 && (
                      <div className="py-2 px-3 text-[11px] text-slate-500 italic">
                        + {missingCount} more selected product(s) from other pages/filters
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Confirmation Phrase Input */}
            {(() => {
              const count = selectedProductIds.length;
              const requiredPhrase = `DELETE ${count} PRODUCT${count > 1 ? 'S' : ''}`;

              return (
                <div className="space-y-2 mb-6 shrink-0">
                  <label className="block text-xs font-semibold text-slate-700">
                    To confirm, type <strong className="text-slate-900 font-mono select-all bg-slate-100 px-1 py-0.5 rounded border border-slate-200">&quot;{requiredPhrase}&quot;</strong> below:
                  </label>
                  <input
                    type="text"
                    placeholder={`Type "${requiredPhrase}" exactly...`}
                    value={bulkConfirmPhraseInput}
                    onChange={(e) => setBulkConfirmPhraseInput(e.target.value)}
                    disabled={isBulkDeleting}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 focus:bg-white transition-colors"
                  />
                </div>
              );
            })()}

            {/* Action Buttons */}
            {(() => {
              const count = selectedProductIds.length;
              const requiredPhrase = `DELETE ${count} PRODUCT${count > 1 ? 'S' : ''}`;
              const isMatch = bulkConfirmPhraseInput.trim().toUpperCase() === requiredPhrase;

              return (
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 shrink-0">
                  <button
                    type="button"
                    disabled={isBulkDeleting}
                    onClick={() => {
                      setShowBulkDeleteModal(false);
                      setBulkConfirmPhraseInput('');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!isMatch || isBulkDeleting}
                    onClick={handleBulkPermanentDeleteConfirm}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center"
                  >
                    {isBulkDeleting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Permanently Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Permanently Delete Selected ({count})</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
