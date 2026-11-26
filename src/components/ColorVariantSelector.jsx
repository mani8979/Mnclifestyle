'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/lib/router-bridge';
import { formatINR } from '../utils/currency';
import { getSafeImageSrc, shouldUnoptimizeImage } from '../utils/image';
import { getProductPrimaryColor } from '../utils/colors';

export default function ColorVariantSelector({
  variants = [],
  currentProduct,
  selectedColorName,
  onVariantSelect,
  compact = false,
  isLoadingVariant = false,
  mode = 'auto', // 'auto' | 'link' | 'swatch'
}) {
  const [hoveredVariant, setHoveredVariant] = useState(null);

  const uniqueVariants = [];
  const seenKeys = new Set();
  for (const variant of variants) {
    if (!variant) continue;
    const rawKey = variant.isProductVariant
      ? (variant._id || variant.id || variant.slug || variant.colorName || variant.name || '')
          .toString()
          .trim()
          .toLowerCase()
      : (variant.colorName || variant.name || variant._id || '').toString().trim().toLowerCase();
    if (!rawKey || seenKeys.has(rawKey)) continue;
    seenKeys.add(rawKey);
    uniqueVariants.push(variant);
  }

  if (uniqueVariants.length === 0) {
    return null;
  }

  const primary = getProductPrimaryColor(currentProduct);
  const currentId = (currentProduct?._id || currentProduct?.id || '').toString();
  const currentSlug = currentProduct?.slug || '';

  const isSelectedVariant = (v) => {
    if (mode === 'swatch' || (mode === 'auto' && selectedColorName && onVariantSelect && !v.isProductVariant)) {
      return (
        typeof selectedColorName === 'string' &&
        (v.colorName || v.name || '').trim().toLowerCase() === selectedColorName.trim().toLowerCase()
      );
    }
    const vid = (v._id || v.id || '').toString();
    return Boolean(
      (currentId && vid && vid === currentId) ||
        (currentSlug && v.slug && v.slug === currentSlug)
    );
  };

  const activeVariant = uniqueVariants.find(isSelectedVariant);
  const displayColorName =
    hoveredVariant?.colorName ||
    activeVariant?.colorName ||
    selectedColorName ||
    primary?.name ||
    currentProduct?.name ||
    'Standard';

  const cardWidthClass = compact ? 'w-[86px] sm:w-[94px]' : 'w-[96px] sm:w-[106px]';

  const renderCardInner = (variant) => {
    const rawImg =
      (typeof variant.image === 'string' && variant.image.trim()) ||
      (Array.isArray(variant.images) && typeof variant.images[0] === 'string' && variant.images[0].trim()) ||
      '';
    const imgSrc = rawImg ? getSafeImageSrc(rawImg) : '';
    const hasDiscount =
      variant.originalPrice && Number(variant.originalPrice) > Number(variant.price);

    return (
      <>
        {/* Variant Thumbnail (photo if uniquely assigned, otherwise authentic finish colour tile) */}
        <div
          className="relative aspect-square w-full bg-[#F8F0E8]/40 border-b border-[#E5E7EB] overflow-hidden"
          style={
            !imgSrc
              ? {
                  backgroundColor: variant.colorHex || '#E5E7EB',
                  backgroundImage:
                    'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.34), rgba(0,0,0,0.12) 85%)',
                }
              : undefined
          }
        >
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={`${variant.colorName || variant.name} colour`}
              fill
              sizes="110px"
              unoptimized={shouldUnoptimizeImage(imgSrc)}
              className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                variant.inStock === false ? 'opacity-55' : ''
              }`}
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${
                variant.inStock === false ? 'opacity-55' : ''
              }`}
            >
              <span className="px-2 py-0.5 rounded-full bg-white/90 text-[#211710] text-[9px] font-semibold uppercase tracking-wider shadow-2xs border border-black/10">
                Finish
              </span>
            </div>
          )}
          {imgSrc && variant.colorHex && (
            <span
              className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: variant.colorHex }}
              title={variant.colorName}
            />
          )}
          {variant.inStock === false && (
            <span className="absolute inset-x-0 bottom-0 bg-black/75 text-white text-[9px] font-semibold text-center py-0.5 uppercase tracking-wider">
              Out of Stock
            </span>
          )}
        </div>

        {/* Colour Name + Price + MRP */}
        <div className="px-2 py-1.5 bg-white text-left space-y-0.5">
          <div className="text-[11px] font-medium text-[#38302A] truncate leading-tight">
            {variant.colorName || variant.name}
          </div>
          <div className="text-xs font-bold text-[#211710] font-sans tabular-nums leading-tight">
            {formatINR(variant.price)}
          </div>
          {hasDiscount && (
            <div className="text-[10px] text-[#766B61] line-through font-sans tabular-nums leading-tight">
              {formatINR(variant.originalPrice)}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="mb-3.5" data-testid="color-variant-selector">
      {/* Header Label: Colour: TOY RED */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-xs sm:text-[13px] leading-snug min-w-0">
          <span className="text-[#565959] font-normal">Colour: </span>
          <span className="font-bold text-[#211710] tracking-wide uppercase">
            {displayColorName}
          </span>
        </div>
        {uniqueVariants.length > 1 && (
          <span className="text-[11px] text-[#766B61] font-medium shrink-0">
            {uniqueVariants.length} options
          </span>
        )}
      </div>

      {/* Amazon-style Visual Variant Cards */}
      <div className="flex overflow-x-auto sm:flex-wrap gap-2 sm:gap-2.5 pb-1 no-scrollbar">
        {uniqueVariants.map((variant, idx) => {
          const selected = isSelectedVariant(variant);
          const cardClasses = `group shrink-0 ${cardWidthClass} rounded-xl bg-white overflow-hidden transition-all block cursor-pointer ${
            selected
              ? 'border-2 border-[#007185] ring-2 ring-[#007185]/20 shadow-xs'
              : 'border border-[#D5D9D9] hover:border-[#007185]/80 hover:shadow-xs'
          } ${isLoadingVariant ? 'opacity-70 pointer-events-none' : ''}`;

          if (onVariantSelect) {
            return (
              <button
                key={variant._id || variant.slug || `${variant.colorName}-${idx}`}
                type="button"
                onClick={() => onVariantSelect(variant, idx)}
                onMouseEnter={() => setHoveredVariant(variant)}
                onMouseLeave={() => setHoveredVariant(null)}
                aria-pressed={selected}
                aria-label={`Select colour ${variant.colorName || variant.name}`}
                className={cardClasses}
              >
                {renderCardInner(variant)}
              </button>
            );
          }

          return (
            <Link
              key={variant._id || variant.slug || `${variant.colorName}-${idx}`}
              to={`/product/${variant.slug}`}
              onMouseEnter={() => setHoveredVariant(variant)}
              onMouseLeave={() => setHoveredVariant(null)}
              aria-current={selected ? 'true' : undefined}
              aria-label={`View ${variant.colorName || variant.name} variant`}
              className={cardClasses}
            >
              {renderCardInner(variant)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
