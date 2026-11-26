'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Info,
  Link2,
  Loader2,
  Palette,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { formatINR } from '@/utils/currency';
import { getSafeImageSrc } from '@/utils/image';

export interface MappedVariantItem {
  _id: string;
  id?: string;
  slug: string;
  sku: string;
  name: string;
  colorName: string;
  colorHex: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  isActive?: boolean;
  category?: string;
  subCategory?: string;
  colorGroupId?: string;
  linkedVariantCount?: number;
}

interface ProductColorVariantMapperProps {
  currentProductId?: string;
  category: string;
  categoryLabel: string;
  subCategory: string;
  colorName: string;
  colorHex: string;
  onColorNameChange: (val: string) => void;
  onColorHexChange: (val: string) => void;
  selectedVariants: MappedVariantItem[];
  onSelectedVariantsChange: (items: MappedVariantItem[]) => void;
  previewProduct: {
    name: string;
    price: number;
    originalPrice: number;
    image: string;
  };
}

const QUICK_COLOR_PRESETS = [
  { name: 'Oatmeal Bouclé', hex: '#EDE8E1' },
  { name: 'Warm Charcoal', hex: '#343332' },
  { name: 'Teak Walnut', hex: '#5C3A21' },
  { name: 'Natural Honey', hex: '#C68E53' },
  { name: 'Toy Red', hex: '#DC2626' },
  { name: 'Jet Black', hex: '#171717' },
  { name: 'Royal Navy', hex: '#1E3A8A' },
  { name: 'Sage Olive', hex: '#6B7A68' },
  { name: 'Terra Cotta', hex: '#9E6756' },
  { name: 'Mustard Gold', hex: '#D97706' },
];

function toMappedVariant(p: any): MappedVariantItem {
  const firstColor = Array.isArray(p.colors) && p.colors[0] ? p.colors[0] : null;
  const img =
    p.image ||
    (Array.isArray(p.images) && p.images[0]) ||
    '';

  return {
    _id: (p._id || p.id || '').toString(),
    id: (p.id || p._id || '').toString(),
    slug: p.slug || '',
    sku: p.sku || '',
    name: p.name || '',
    colorName:
      (typeof p.colorName === 'string' && p.colorName.trim()) ||
      (typeof firstColor?.name === 'string' && firstColor.name.trim()) ||
      p.name ||
      'Standard',
    colorHex:
      (typeof p.colorHex === 'string' && p.colorHex.trim()) ||
      (typeof firstColor?.hex === 'string' && firstColor.hex.trim()) ||
      '#211710',
    price: Number(p.price) || 0,
    originalPrice: Number(p.originalPrice) || 0,
    image: img,
    images: Array.isArray(p.images) ? p.images : img ? [img] : [],
    isActive: p.isActive !== false,
    category: p.category || '',
    subCategory: p.subCategory || '',
    colorGroupId: p.colorGroupId || '',
    linkedVariantCount: Number(p.linkedVariantCount) || 0,
  };
}

export default function ProductColorVariantMapper({
  currentProductId,
  category,
  categoryLabel,
  subCategory,
  colorName,
  colorHex,
  onColorNameChange,
  onColorHexChange,
  selectedVariants,
  onSelectedVariantsChange,
  previewProduct,
}: ProductColorVariantMapperProps) {
  const [candidates, setCandidates] = useState<MappedVariantItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeResetNotice, setScopeResetNotice] = useState(false);

  const effectiveSubCategory = (subCategory || '').trim();
  const scopeKey = `${category}::${effectiveSubCategory.toLowerCase()}`;
  const [prevScope, setPrevScope] = useState(scopeKey);

  // When category or subcategory changes in Section 1, drop links from old scope so cross-category links never persist
  if (prevScope !== scopeKey) {
    setPrevScope(scopeKey);
    if (selectedVariants.length > 0) {
      const stillValid = selectedVariants.filter(
        (v) =>
          (!v.category || v.category === category) &&
          (!v.subCategory ||
            !effectiveSubCategory ||
            v.subCategory.trim().toLowerCase() === effectiveSubCategory.toLowerCase())
      );
      if (stillValid.length !== selectedVariants.length) {
        onSelectedVariantsChange(stillValid);
        setScopeResetNotice(true);
      }
    }
  }

  // Fetch products matching exact same Category & Subcategory
  useEffect(() => {
    if (!category) {
      return;
    }

    let cancelled = false;
    async function loadSameScopeProducts() {
      setIsLoading(true);
      setLoadError('');
      try {
        const params = new URLSearchParams({
          category,
          limit: '100',
          sort: 'name-asc',
        });
        if (effectiveSubCategory) {
          params.set('subCategory', effectiveSubCategory);
        }
        if (currentProductId) {
          params.set('excludeId', currentProductId);
        }

        const res = await fetch(`/api/admin/products?${params.toString()}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load products for color mapping');
        }

        if (!cancelled) {
          const normalized = (data.products || []).map(toMappedVariant);
          setCandidates(normalized);
        }
      } catch (err: any) {
        if (!cancelled) {
          setLoadError(err.message || 'Unable to load products in this category/subcategory');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSameScopeProducts();
    return () => {
      cancelled = true;
    };
  }, [category, effectiveSubCategory, currentProductId]);

  const selectedIds = useMemo(
    () => new Set(selectedVariants.map((v) => v._id)),
    [selectedVariants]
  );

  // Merge candidates and currently selected variants so existing links remain visible cleanly
  const allOptions = useMemo(() => {
    const byId = new Map<string, MappedVariantItem>();
    for (const c of candidates) {
      byId.set(c._id, c);
    }
    for (const sel of selectedVariants) {
      if (sel._id && !byId.has(sel._id)) {
        byId.set(sel._id, sel);
      }
    }
    return Array.from(byId.values());
  }, [candidates, selectedVariants]);

  const filteredOptions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allOptions;
    return allOptions.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.colorName.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q)
    );
  }, [allOptions, searchTerm]);

  const toggleVariantSelection = (item: MappedVariantItem) => {
    setScopeResetNotice(false);
    if (selectedIds.has(item._id)) {
      onSelectedVariantsChange(selectedVariants.filter((v) => v._id !== item._id));
      return;
    }

    // Also include any same-scope group members when selecting an already grouped product so groups stay cohesive
    const nextList = [...selectedVariants, item];
    if (item.colorGroupId) {
      const siblingGroupMembers = allOptions.filter(
        (opt) =>
          opt.colorGroupId === item.colorGroupId &&
          opt._id !== item._id &&
          !nextList.some((existing) => existing._id === opt._id)
      );
      nextList.push(...siblingGroupMembers);
    }
    onSelectedVariantsChange(nextList);
  };

  const previewCurrentLabel = colorName.trim() || previewProduct.name || 'This Product';
  const previewCards = [
    {
      key: 'current',
      colorName: previewCurrentLabel,
      colorHex: colorHex || '#211710',
      price: previewProduct.price,
      originalPrice: previewProduct.originalPrice,
      image: previewProduct.image,
      isCurrent: true,
    },
    ...selectedVariants.map((v) => ({
      key: v._id,
      colorName: v.colorName || v.name,
      colorHex: v.colorHex || '#211710',
      price: v.price,
      originalPrice: v.originalPrice || 0,
      image: v.image || '',
      isCurrent: false,
    })),
  ];

  return (
    <div className="space-y-5">
      {/* 1. Primary Product Color Identity */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <span>This Product&apos;s Color Label</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Displayed above the colour thumbnail cards (e.g. <strong>Colour: TOY RED</strong>) and used for storefront Category &amp; Shop color filters.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6">
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-600 mb-1">
              Color Name
            </label>
            <input
              type="text"
              value={colorName}
              onChange={(e) => onColorNameChange(e.target.value)}
              placeholder="e.g. TOY RED, Jet Black, Oatmeal Bouclé"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-600 mb-1">
              Color Swatch Hex
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={/^#[0-9A-Fa-f]{6}$/.test(colorHex) ? colorHex : '#211710'}
                onChange={(e) => onColorHexChange(e.target.value.toUpperCase())}
                aria-label="Pick product color swatch hex"
                className="w-9 h-9 rounded-lg border border-slate-200 bg-white cursor-pointer p-0.5 shrink-0"
              />
              <input
                type="text"
                value={colorHex}
                onChange={(e) => onColorHexChange(e.target.value)}
                placeholder="#DC2626"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Quick Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-400 font-medium mr-1">Quick Presets:</span>
          {QUICK_COLOR_PRESETS.map((preset) => {
            const active = colorName.trim().toLowerCase() === preset.name.toLowerCase();
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  onColorNameChange(preset.name);
                  onColorHexChange(preset.hex);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition-colors cursor-pointer ${
                  active
                    ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                  style={{ backgroundColor: preset.hex }}
                />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Link Same Category & Subcategory Color Products */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Map Color Variant Products (Same Category &amp; Subcategory)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select other products in this exact Category &amp; Subcategory so customers can switch between their images and prices on the product page.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-700 shrink-0">
            <span>{categoryLabel || category}</span>
            <span className="text-blue-400">→</span>
            <span>{effectiveSubCategory || 'General'}</span>
          </span>
        </div>

        {scopeResetNotice && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Category or Subcategory changed, so color links from the previous scope were cleared.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setScopeResetNotice(false)}
              className="text-amber-700 hover:text-amber-950 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Selected Chips Summary */}
        {selectedVariants.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">
                Mapped Color Siblings ({selectedVariants.length})
              </span>
              <button
                type="button"
                onClick={() => onSelectedVariantsChange([])}
                className="text-[11px] text-red-600 hover:underline cursor-pointer font-medium"
              >
                Unlink All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedVariants.map((v) => (
                <span
                  key={v._id}
                  className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: v.colorHex || '#211710' }}
                  />
                  <span className="max-w-[180px] truncate">
                    {v.colorName} — {formatINR(v.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleVariantSelection(v)}
                    className="p-0.5 rounded-md hover:bg-blue-200/70 text-blue-700 cursor-pointer"
                    aria-label={`Unlink ${v.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Candidate Picker Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search products in "${categoryLabel || category} → ${effectiveSubCategory || 'General'}"...`}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Candidate List */}
        {isLoading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading products in {categoryLabel || category} → {effectiveSubCategory || 'General'}...</span>
          </div>
        ) : loadError ? (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {loadError}
          </div>
        ) : filteredOptions.length === 0 ? (
          <div className="py-6 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-center space-y-1">
            <p className="text-xs font-medium text-slate-700">
              No other products found in {categoryLabel || category} → {effectiveSubCategory || 'General'}.
            </p>
            <p className="text-[11px] text-slate-500">
              Create another color product with this same Category &amp; Subcategory, then map them together here (or use &quot;+ Add Another Color Variant&quot; after saving).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredOptions.map((item) => {
              const isSelected = selectedIds.has(item._id);
              const thumb = getSafeImageSrc(item.image);
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => toggleVariantSelection(item)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={thumb}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: item.colorHex || '#211710' }}
                      />
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {item.colorName}
                      </span>
                      {!item.isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-semibold uppercase">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                      <span className="font-bold text-slate-900 tabular-nums">
                        {formatINR(item.price)}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price ? (
                        <span className="text-slate-400 line-through tabular-nums">
                          {formatINR(item.originalPrice)}
                        </span>
                      ) : null}
                      {item.linkedVariantCount && item.linkedVariantCount > 1 ? (
                        <span className="text-[10px] text-blue-600 font-medium">
                          • Group ({item.linkedVariantCount})
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Storefront Variant Strip Live Preview */}
        {previewCards.length > 1 && (
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Storefront Preview —{' '}
                <span className="text-slate-500">Colour:</span>{' '}
                <strong className="text-slate-900">{previewCurrentLabel}</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {previewCards.map((card) => (
                <div
                  key={card.key}
                  className={`w-[96px] rounded-xl overflow-hidden bg-white ${
                    card.isCurrent
                      ? 'border-2 border-[#007185] ring-2 ring-[#007185]/20 shadow-xs'
                      : 'border border-slate-300'
                  }`}
                >
                  <div className="aspect-square bg-slate-100 border-b border-slate-200 overflow-hidden relative">
                    <img
                      src={getSafeImageSrc(card.image)}
                      alt={card.colorName}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: card.colorHex }}
                    />
                  </div>
                  <div className="p-1.5 space-y-0.5 text-left">
                    <div className="text-[10px] font-medium text-slate-700 truncate">
                      {card.colorName}
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 tabular-nums leading-tight">
                      {card.price > 0 ? formatINR(card.price) : '₹—'}
                    </div>
                    {card.originalPrice > card.price && (
                      <div className="text-[10px] text-slate-400 line-through tabular-nums leading-tight">
                        {formatINR(card.originalPrice)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
