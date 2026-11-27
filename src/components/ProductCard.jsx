'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/lib/router-bridge';
import { formatINR } from '../utils/currency';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { slugify } from '../data/products';
import { getSafeImageSrc, shouldUnoptimizeImage } from '../utils/image';
import { getProductDisplaySwatches } from '../utils/colors';
import FormattedTitle from './shared/FormattedTitle';
import ShareProductButton from './ShareProductButton';

export default function ProductCard({ product, index }) {
  // Subtle stagger based on grid position (0ms, 80ms, 160ms, 240ms)
  const staggerDelay = typeof index === 'number' ? (index % 4) * 80 : 0;

  const { ref, isVisible, style: revealStyle } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px',
    delay: staggerDelay,
    duration: 700,
    distance: 20,
    once: true,
  });

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const savingsAmount = hasDiscount ? product.originalPrice - product.price : 0;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const productSlug = product.slug || slugify(product.name);
  const cardImageSrc = getSafeImageSrc(product.images?.[0]);
  const displaySwatches = getProductDisplaySwatches(product);

  return (
    <Link
      ref={ref}
      to={`/product/${productSlug}`}
      style={revealStyle}
      data-revealed={isVisible}
      aria-label={`View details of ${product.name}`}
      className={`group relative flex flex-col min-w-0 bg-white rounded-2xl overflow-hidden border border-[#E9D8C5] shadow-2xs hover:shadow-luxury hover:border-[#D69A4B]/60 active:scale-[0.98] transition-all duration-300 h-full cursor-pointer ${isVisible ? 'is-revealed' : 'is-hidden'
        }`}
    >
      {/* 1. Product Image: 16:10 edge-to-edge fill with zero white letterbox space */}
      <div className="relative aspect-[16/10] w-full bg-[#F8F0E8]/40 overflow-hidden border-b border-[#E9D8C5]/60 rounded-t-2xl">
        <Image
          src={cardImageSrc}
          alt={product.name}
          fill
          loading="lazy"
          unoptimized={shouldUnoptimizeImage(cardImageSrc)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Quick Share Action Button */}
        <div className="absolute top-2 right-2 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
          <ShareProductButton product={product} variant="card" />
        </div>

        {/* Mobile Badge Overlay (Bottom-Right, compact) */}
        {product.badge && (
          <span className="sm:hidden absolute bottom-2 right-2 z-10 text-[9px] font-semibold uppercase tracking-wider text-white bg-[#D69A4B] px-2 py-0.5 rounded shadow-xs max-w-[calc(100%-16px)] whitespace-nowrap truncate">
            {product.badge}
          </span>
        )}
      </div>

      {/* Product Information Container */}
      <div className="p-2.5 sm:p-4 lg:p-5 flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Desktop 2-badge / category row (hidden on mobile) */}
          <div className="hidden sm:flex items-center justify-between gap-1.5 mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#855214] truncate">
              {product.categoryLabel || product.category}
            </span>
            {product.badge && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#77736D] bg-[#F8F0E8] px-1.5 py-0.5 rounded border border-[#E9D8C5]/80 shrink-0">
                {product.badge}
              </span>
            )}
          </div>

          {/* Mobile Category (Ultra-compact single line) */}
          <div className="sm:hidden mb-0.5">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-[#855214] block truncate">
              {product.categoryLabel || product.category}
            </span>
          </div>

          {/* Product Name (Small & clean on mobile, Playfair Display on desktop) */}
          <h3 className="font-serif text-[13px] sm:text-base lg:text-[17px] font-medium text-[#211A15] leading-snug group-hover:text-[#D69A4B] transition-colors line-clamp-2 sm:min-h-[3em]">
            <FormattedTitle text={product.name} />
          </h3>

          {/* Short Product Description — Hidden on mobile, visible on sm and above */}
          <p className="hidden sm:block text-xs sm:text-[13px] text-[#38302A] line-clamp-2 leading-[1.55] mt-1 font-sans h-[3.1em] overflow-hidden">
            {product.shortDescription}
          </p>

          {/* Available Finishes — Compact on mobile */}
          <div className="h-4 sm:h-7 flex items-center gap-1.5 my-1 sm:my-2">
            {displaySwatches.length > 0 ? (
              <>
                <span className="hidden sm:inline-block text-[10px] text-[#77736D] font-medium uppercase tracking-wider">
                  {Array.isArray(product.colorVariants) && product.colorVariants.length > 1
                    ? 'Colours:'
                    : 'Finishes:'}
                </span>
                <div className="flex items-center gap-1">
                  {displaySwatches.slice(0, 4).map((color) => (
                    <span
                      key={color.name}
                      title={color.name}
                      className="w-3 h-3 rounded-full border border-black/15 shadow-2xs inline-block shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                  {displaySwatches.length > 4 && (
                    <span className="text-[10px] text-[#77736D] font-medium leading-none pl-0.5">
                      +{displaySwatches.length - 4}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <span className="text-[10px] text-[#77736D] italic truncate pr-1">
                {product.materials?.[0] || 'Handcrafted Timber'}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Section: Price & CTA (pinned to bottom with mt-auto) */}
        <div className="mt-auto pt-1.5 sm:pt-3.5 border-t border-[#E9D8C5]/50 sm:border-[#E9D8C5]/70">
          <div className="space-y-0.5">
            <span className="hidden sm:block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#77736D] font-medium">
              Selling Price
            </span>

            {/* Selling Price (prominent) + MRP struck-through + Discount */}
            <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5">
              <span className="text-[14px] sm:text-xl lg:text-[22px] font-bold text-[#211710] font-sans tabular-nums tracking-tight leading-none">
                {formatINR(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-[11px] sm:text-xs text-gray-400 sm:text-[#766B61] line-through font-sans tabular-nums font-normal">
                  MRP {formatINR(product.originalPrice)}
                </span>
              )}
              {hasDiscount && (
                <span className="sm:hidden text-[10px] font-semibold text-emerald-700 font-sans">
                  ({discountPercent}% Off)
                </span>
              )}
            </div>

            {/* Desktop You Save Label */}
            <div className="hidden sm:flex h-5 sm:h-6 items-center pt-0.5">
              {hasDiscount ? (
                <span className="inline-block text-[11px] font-sans font-medium text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-2 py-0.5 rounded truncate max-w-full">
                  Save {formatINR(savingsAmount)} ({discountPercent}% OFF)
                </span>
              ) : (
                <span className="text-[11px] text-[#77736D] font-sans">
                  Direct Concierge Pricing
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
