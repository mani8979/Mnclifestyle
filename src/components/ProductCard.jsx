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
    once: true
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
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E9D8C5] shadow-2xs hover:shadow-luxury hover:border-[#D69A4B]/60 transition-all duration-300 h-full cursor-pointer ${
        isVisible ? 'is-revealed' : 'is-hidden'
      }`}
    >
      {/* 1. Product Image — Completely Clean, No Overlays, No Text, No Badges */}
      <div className="relative aspect-[4/3] w-full bg-[#F8F0E8]/40 overflow-hidden border-b border-[#E9D8C5]/60">
        <Image
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Product Information Container */}
      <div className="p-3 sm:p-4 lg:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* 2. Product Category & Subtle Badge */}
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#855214] truncate">
              {product.categoryLabel || product.category}
            </span>
            {product.badge && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#77736D] bg-[#F8F0E8] px-1.5 py-0.5 rounded border border-[#E9D8C5]/80 shrink-0">
                {product.badge}
              </span>
            )}
          </div>

          {/* 3. Product Name (Playfair Display) — Standardized height to keep cards aligned */}
          <h3 className="font-serif text-sm sm:text-base lg:text-[17px] font-medium text-[#211A15] leading-snug group-hover:text-[#D69A4B] transition-colors line-clamp-2 min-h-[2.8em] sm:min-h-[3em] flex items-start">
            {product.name}
          </h3>

          {/* 4. Short Product Description — Enhanced readability, line spacing & standardized height */}
          <p className="text-xs sm:text-[13px] text-[#38302A] line-clamp-2 leading-[1.55] mt-1 font-sans h-[3.1em] overflow-hidden">
            {product.shortDescription}
          </p>

          {/* 5. Available Finishes or Colors — Consistent row height across all cards */}
          <div className="h-6 sm:h-7 flex items-center gap-1.5 my-1.5 sm:my-2">
            {product.colors && product.colors.length > 0 ? (
              <>
                <span className="text-[9px] sm:text-[10px] text-[#77736D] font-medium uppercase tracking-wider">
                  Finishes:
                </span>
                <div className="flex items-center gap-1">
                  {product.colors.map((color) => (
                    <span
                      key={color.name}
                      title={color.name}
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/15 shadow-2xs inline-block"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <span className="text-[10px] text-[#77736D] italic">
                {product.materials?.[0] || 'Handcrafted Timber'}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Section: Price */}
        <div className="mt-auto pt-2.5 sm:pt-3.5 border-t border-[#E9D8C5]/70">
          {/* Price Block: Selling Price, Original MRP & Savings */}
          <div className="space-y-0.5">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#77736D] font-medium block">
              Selling Price
            </span>

            {/* Selling Price (prominent) + MRP */}
            <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
              <span className="text-base sm:text-xl lg:text-[22px] font-bold text-[#211710] font-sans tabular-nums tracking-tight leading-none">
                {formatINR(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-[#766B61] line-through font-sans tabular-nums font-normal">
                  MRP {formatINR(product.originalPrice)}
                </span>
              )}
            </div>

            {/* You Save Label */}
            <div className="h-5 sm:h-6 flex items-center pt-0.5">
              {hasDiscount ? (
                <span className="inline-block text-[10px] sm:text-[11px] font-sans font-medium text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-1.5 sm:px-2 py-0.5 rounded truncate max-w-full">
                  Save {formatINR(savingsAmount)} ({discountPercent}% OFF)
                </span>
              ) : (
                <span className="text-[10px] text-[#77736D] font-sans">
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
