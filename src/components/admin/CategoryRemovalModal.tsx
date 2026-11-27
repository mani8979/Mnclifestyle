'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Loader2,
  Package,
  Trash2,
  X,
} from 'lucide-react';
import { formatINR } from '@/utils/currency';

export interface ModalCategoryItem {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  subcategories: string[];
  orderIndex: number;
}

interface AffectedProductPreview {
  _id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  isActive: boolean;
  image?: string;
}

interface CategoryRemovalModalProps {
  isOpen: boolean;
  mode: 'category' | 'subcategory';
  sourceCategory: ModalCategoryItem | null;
  subCategory?: string | null;
  allCategories: ModalCategoryItem[];
  onClose: () => void;
  onCompleted: (result: {
    mode: 'category' | 'subcategory';
    sourceCategory: ModalCategoryItem;
    subCategory?: string | null;
    message: string;
    updatedCategory?: ModalCategoryItem;
  }) => void;
}

const CUSTOM_SUBCAT_VALUE = '__custom__';
const KEEP_EXISTING_SUBCAT_VALUE = '__keep__';

export default function CategoryRemovalModal({
  isOpen,
  mode,
  sourceCategory,
  subCategory,
  allCategories,
  onClose,
  onCompleted,
}: CategoryRemovalModalProps) {
  const [isLoadingImpact, setIsLoadingImpact] = useState(false);
  const [impactError, setImpactError] = useState('');
  const [affectedProducts, setAffectedProducts] = useState<AffectedProductPreview[]>([]);

  const [action, setAction] = useState<'transfer' | 'delete-all'>('transfer');
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [targetSubCategory, setTargetSubCategory] = useState('');
  const [customSubCategory, setCustomSubCategory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const sourceId = sourceCategory?._id || sourceCategory?.id || sourceCategory?.slug || '';

  const availableTargetCategories = useMemo(() => {
    if (!sourceCategory) return [];
    if (mode === 'category') {
      return allCategories.filter(
        (c) => (c._id || c.id || c.slug) !== sourceId && c.slug !== sourceCategory.slug
      );
    }

    // For subcategory removal, allow transferring to sibling subcategories in same category
    // (only if there is at least one other subcategory) or to any other category
    return allCategories.filter((c) => {
      const isSame = (c._id || c.id || c.slug) === sourceId || c.slug === sourceCategory.slug;
      if (!isSame) return true;
      const siblingSubs = (c.subcategories || []).filter(
        (s) => s.toLowerCase() !== (subCategory || '').toLowerCase()
      );
      return siblingSubs.length > 0;
    });
  }, [allCategories, mode, sourceCategory, sourceId, subCategory]);

  const selectedTargetCategory = useMemo(() => {
    return (
      availableTargetCategories.find(
        (c) => (c._id || c.id || c.slug) === targetCategoryId || c.slug === targetCategoryId
      ) || null
    );
  }, [availableTargetCategories, targetCategoryId]);

  const targetSubcategoryOptions = useMemo(() => {
    if (!selectedTargetCategory) return [];
    const isSame =
      sourceCategory &&
      ((selectedTargetCategory._id || selectedTargetCategory.id || selectedTargetCategory.slug) ===
        sourceId ||
        selectedTargetCategory.slug === sourceCategory.slug);

    return (selectedTargetCategory.subcategories || []).filter((s) =>
      isSame ? s.toLowerCase() !== (subCategory || '').toLowerCase() : true
    );
  }, [selectedTargetCategory, sourceCategory, sourceId, subCategory]);

  // Initialize default transfer target whenever modal opens or categories change
  useEffect(() => {
    if (!isOpen || !sourceCategory) return;

    setSubmitError('');
    setImpactError('');
    setCustomSubCategory('');

    if (availableTargetCategories.length > 0) {
      // Prefer another category when deleting a category, or another subcategory/category
      const otherCat =
        availableTargetCategories.find((c) => c.slug !== sourceCategory.slug) ||
        availableTargetCategories[0];
      const defaultCatId =
        mode === 'subcategory'
          ? availableTargetCategories[0]._id ||
            availableTargetCategories[0].id ||
            availableTargetCategories[0].slug
          : otherCat._id || otherCat.id || otherCat.slug;
      setTargetCategoryId(defaultCatId);
      setAction('transfer');
    } else {
      setTargetCategoryId('');
      setAction('delete-all');
    }
  }, [isOpen, sourceCategory, mode, availableTargetCategories]);

  // Sync default subcategory option when selected target category changes
  useEffect(() => {
    if (!selectedTargetCategory) {
      setTargetSubCategory('');
      return;
    }

    if (mode === 'category') {
      setTargetSubCategory(
        targetSubcategoryOptions.length > 0 ? targetSubcategoryOptions[0] : KEEP_EXISTING_SUBCAT_VALUE
      );
    } else {
      setTargetSubCategory(
        targetSubcategoryOptions.length > 0 ? targetSubcategoryOptions[0] : CUSTOM_SUBCAT_VALUE
      );
    }
  }, [selectedTargetCategory, targetSubcategoryOptions, mode]);

  // Fetch affected products whenever modal opens
  useEffect(() => {
    if (!isOpen || !sourceCategory || !sourceId) return;

    let cancelled = false;
    async function loadImpact() {
      setIsLoadingImpact(true);
      setImpactError('');
      try {
        const query =
          mode === 'subcategory' && subCategory
            ? `?subCategory=${encodeURIComponent(subCategory)}`
            : '';
        const res = await fetch(
          `/api/admin/categories/${encodeURIComponent(sourceId)}/impact${query}`
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to check products in this category');
        }
        if (!cancelled) {
          setAffectedProducts(Array.isArray(data.products) ? data.products : []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setImpactError(err.message || 'Failed to inspect assigned products');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingImpact(false);
        }
      }
    }

    loadImpact();
    return () => {
      cancelled = true;
    };
  }, [isOpen, sourceCategory, sourceId, mode, subCategory]);

  if (!isOpen || !sourceCategory) return null;

  const targetTitle =
    mode === 'category'
      ? `Delete Category "${sourceCategory.name}"`
      : `Remove Subcategory "${subCategory}"`;

  const resolvedTransferSubcategory = (() => {
    if (targetSubCategory === KEEP_EXISTING_SUBCAT_VALUE) return '';
    if (targetSubCategory === CUSTOM_SUBCAT_VALUE) {
      return customSubCategory.trim() || selectedTargetCategory?.name || '';
    }
    return targetSubCategory;
  })();

  const handleConfirm = async () => {
    setSubmitError('');

    if (affectedProducts.length > 0 && action === 'transfer') {
      if (!targetCategoryId) {
        setSubmitError('Please select a destination category.');
        return;
      }
      if (targetSubCategory === CUSTOM_SUBCAT_VALUE && !customSubCategory.trim()) {
        setSubmitError('Please enter a destination subcategory name.');
        return;
      }
    }

    setIsProcessing(true);
    try {
      if (mode === 'category') {
        const res = await fetch(`/api/admin/categories/${encodeURIComponent(sourceId)}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            affectedProducts.length > 0
              ? {
                  action,
                  ...(action === 'transfer'
                    ? {
                        targetCategoryId,
                        ...(resolvedTransferSubcategory
                          ? { targetSubCategory: resolvedTransferSubcategory }
                          : {}),
                      }
                    : {}),
                }
              : {}
          ),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to delete category');
        }

        onCompleted({
          mode: 'category',
          sourceCategory,
          message: data.message || `Category "${sourceCategory.name}" deleted`,
        });
      } else {
        const res = await fetch(
          `/api/admin/categories/${encodeURIComponent(sourceId)}/subcategories/remove`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subCategory,
              ...(affectedProducts.length > 0
                ? {
                    action,
                    ...(action === 'transfer'
                      ? {
                          targetCategoryId,
                          targetSubCategory: resolvedTransferSubcategory,
                        }
                      : {}),
                  }
                : {}),
            }),
          }
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to remove subcategory');
        }

        onCompleted({
          mode: 'subcategory',
          sourceCategory,
          subCategory,
          message: data.message || `Removed "${subCategory}"`,
          updatedCategory: data.category,
        });
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-xl w-full p-4 sm:p-6 my-auto max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{targetTitle}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'subcategory'
                  ? `Inside category "${sourceCategory.name}"`
                  : 'Check assigned products before removing'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            aria-label="Close popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-5 space-y-4">
          {isLoadingImpact ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs font-medium">Checking products assigned to this {mode}...</span>
            </div>
          ) : impactError ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
              {impactError}
            </div>
          ) : affectedProducts.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <p className="font-semibold text-slate-900 mb-1">
                  No products are assigned to this {mode}
                </p>
                <p>
                  Are you sure you want to remove{' '}
                  <strong>
                    {mode === 'category' ? sourceCategory.name : subCategory}
                  </strong>
                  ?
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Affected Products Summary */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950">
                <div className="font-semibold flex items-center gap-1.5 mb-2">
                  <Package className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    {affectedProducts.length}{' '}
                    {affectedProducts.length === 1 ? 'product is' : 'products are'} currently under{' '}
                    &quot;{mode === 'category' ? sourceCategory.name : subCategory}&quot;
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {affectedProducts.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between gap-2 bg-white/90 border border-amber-200/70 rounded-lg px-2.5 py-1.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {p.sku}
                            {p.subCategory ? ` • ${p.subCategory}` : ''}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 shrink-0">
                        {formatINR(p.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Choice Cards */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-800">
                  Choose what to do with {affectedProducts.length === 1 ? 'this product' : 'these products'}:
                </p>

                {/* Option 1: Transfer */}
                <label
                  className={`block rounded-xl border p-4 transition-all cursor-pointer ${
                    action === 'transfer'
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  } ${availableTargetCategories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="categoryRemovalAction"
                      value="transfer"
                      checked={action === 'transfer'}
                      disabled={availableTargetCategories.length === 0}
                      onChange={() => setAction('transfer')}
                      className="mt-0.5 accent-blue-600"
                    />
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                          <span>Transfer products to another category</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Move all {affectedProducts.length}{' '}
                          {affectedProducts.length === 1 ? 'product' : 'products'} cleanly before removing{' '}
                          &quot;{mode === 'category' ? sourceCategory.name : subCategory}&quot;.
                        </p>
                      </div>

                      {availableTargetCategories.length === 0 ? (
                        <p className="text-[11px] text-amber-700 font-medium">
                          No other category is available to transfer to. Create another category first or delete all products.
                        </p>
                      ) : (
                        action === 'transfer' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Destination Category *
                              </label>
                              <select
                                value={targetCategoryId}
                                onChange={(e) => setTargetCategoryId(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                              >
                                {availableTargetCategories.map((c) => {
                                  const val = c._id || c.id || c.slug;
                                  const isSame = c.slug === sourceCategory.slug;
                                  return (
                                    <option key={val} value={val}>
                                      {c.name}
                                      {isSame ? ' (Same Category)' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Destination Subcategory
                              </label>
                              <select
                                value={targetSubCategory}
                                onChange={(e) => setTargetSubCategory(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                              >
                                {mode === 'category' && (
                                  <option value={KEEP_EXISTING_SUBCAT_VALUE}>
                                    Keep existing subcategory
                                  </option>
                                )}
                                {targetSubcategoryOptions.map((sub) => (
                                  <option key={sub} value={sub}>
                                    {sub}
                                  </option>
                                ))}
                                <option value={CUSTOM_SUBCAT_VALUE}>+ Enter custom subcategory</option>
                              </select>
                            </div>

                            {targetSubCategory === CUSTOM_SUBCAT_VALUE && (
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  value={customSubCategory}
                                  onChange={(e) => setCustomSubCategory(e.target.value)}
                                  placeholder="Type new subcategory name..."
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                />
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </label>

                {/* Option 2: Delete All */}
                <label
                  className={`block rounded-xl border p-4 transition-all cursor-pointer ${
                    action === 'delete-all'
                      ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="categoryRemovalAction"
                      value="delete-all"
                      checked={action === 'delete-all'}
                      onChange={() => setAction('delete-all')}
                      className="mt-0.5 accent-red-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>
                          Delete all {affectedProducts.length}{' '}
                          {affectedProducts.length === 1 ? 'product' : 'products'} permanently
                        </span>
                      </div>
                      <p className="text-[11px] text-red-600/90 mt-0.5">
                        Removes both the {mode} and every product assigned to it from your catalog and collections. This cannot be undone.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </>
          )}

          {submitError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
              {submitError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoadingImpact || Boolean(impactError) || isProcessing}
            onClick={handleConfirm}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-center ${
              affectedProducts.length > 0 && action === 'delete-all'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : affectedProducts.length === 0 ? (
              <span>Confirm Remove</span>
            ) : action === 'transfer' ? (
              <span>
                Transfer {affectedProducts.length}{' '}
                {affectedProducts.length === 1 ? 'Product' : 'Products'} &amp; Remove
              </span>
            ) : (
              <span>
                Delete All ({affectedProducts.length}) &amp; Remove
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
