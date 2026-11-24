'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/lib/router-bridge';
import { formatINR } from '../utils/currency';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { slugify } from '../data/products';

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

  return (
    <Link
      to={`/product/${productSlug}`}
      ref={ref}
      style={revealStyle}
      data-revealed={isVisible}
      aria-label={`View details of ${product.name}`}
      className={`group relative flex flex-col min-w-0 bg-white rounded-2xl overflow-hidden border border-[#E9D8C5] shadow-2xs hover:shadow-luxury hover:border-[#D69A4B]/60 active:scale-[0.98] transition-all duration-300 h-full cursor-pointer ${
        isVisible ? 'is-revealed' : 'is-hidden'
      }`}
    >
      {/* 1. Product Image with aspect-[4/5] on mobile, sm:aspect-[4/3] on desktop */}
      <div className="relative aspect-[4/5] sm:aspect-[4/3] w-full bg-[#F8F0E8]/40 overflow-hidden border-b border-[#E9D8C5]/60 rounded-t-2xl">
        <Image
          src={
            product.images && product.images.length > 0
              ? product.images[0]
              : 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'
          }
          alt={product.name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Mobile Badge Overlay (Top-Left) */}
        {product.badge && (
          <span className="sm:hidden absolute top-2 left-2 z-10 text-[10px] font-medium uppercase tracking-wider text-[#77736D] bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-2xs border border-[#E9D8C5]/60 max-w-[calc(100%-16px)] truncate">
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

          {/* Mobile Category (Single clean line, no truncate squeezing with badges) */}
          <div className="sm:hidden mb-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#855214] block truncate">
              {product.categoryLabel || product.category}
            </span>
          </div>

          {/* Product Name (Playfair Display) — Standardized height to keep cards aligned */}
          <h3 className="font-serif text-[15px] sm:text-base lg:text-[17px] font-medium text-[#211A15] leading-tight sm:leading-snug group-hover:text-[#D69A4B] transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3em] flex items-start">
            {product.name}
          </h3>

          {/* Short Product Description — Hidden on mobile, visible on sm and above */}
          <p className="hidden sm:block text-xs sm:text-[13px] text-[#38302A] line-clamp-2 leading-[1.55] mt-1 font-sans h-[3.1em] overflow-hidden">
            {product.shortDescription}
          </p>

          {/* Available Finishes — No FINISHES: label on mobile, max 4 16px swatches +N */}
          <div className="h-5 sm:h-7 flex items-center gap-1.5 my-1 sm:my-2">
            {product.colors && product.colors.length > 0 ? (
              <>
                <span className="hidden sm:inline-block text-[10px] text-[#77736D] font-medium uppercase tracking-wider">
                  Finishes:
                </span>
                <div className="flex items-center gap-1">
                  {product.colors.slice(0, 4).map((color) => (
                    <span
                      key={color.name}
                      title={color.name}
                      className="w-4 h-4 sm:w-3 sm:h-3 rounded-full border border-black/15 shadow-2xs inline-block shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                  {product.colors.length > 4 && (
                    <span className="text-[10px] text-[#77736D] font-medium leading-none pl-0.5">
                      +{product.colors.length - 4}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <span className="text-[11px] sm:text-[10px] text-[#77736D] italic truncate">
                {product.materials?.[0] || 'Handcrafted Timber'}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Section: Price & CTA (pinned to bottom with mt-auto) */}
        <div className="mt-auto pt-2 sm:pt-3.5 border-t border-[#E9D8C5]/70">
          <div className="space-y-0.5">
            <span className="hidden sm:block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#77736D] font-medium">
              Selling Price
            </span>

            {/* Selling Price (prominent) + MRP struck-through + Discount */}
            <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5">
              <span className="text-base sm:text-xl lg:text-[22px] font-bold text-[#211710] font-sans tabular-nums tracking-tight leading-none">
                {formatINR(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 sm:text-[#766B61] line-through font-sans tabular-nums font-normal">
                  MRP {formatINR(product.originalPrice)}
                </span>
              )}
              {hasDiscount && (
                <span className="sm:hidden text-[11px] font-semibold text-emerald-700 font-sans">
                  {discountPercent}% OFF
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
