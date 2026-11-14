import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { formatINR } from '../utils/currency';

export default function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isSaved = isInWishlist(product.id);
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const savingsAmount = hasDiscount ? product.originalPrice - product.price : 0;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E9D8C5] shadow-xs hover:shadow-luxury transition-all duration-300 h-full">
      {/* 1. Product Image — Completely Clean, No Overlays, No Text, No Badges */}
      <div className="relative aspect-[4/3] w-full bg-[#F8F0E8]/40 overflow-hidden border-b border-[#E9D8C5]/60">
        <Link
          to={`/product/${product.id}`}
          className="block w-full h-full"
          aria-label={`View details of ${product.name}`}
        >
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : ''}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Product Information Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* 2. Product Category & Subtle Badge / Wishlist */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#D69A4B]">
              {product.categoryLabel || product.category}
            </span>
            <div className="flex items-center gap-2">
              {product.badge && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#77736D] bg-[#F8F0E8] px-2 py-0.5 rounded border border-[#E9D8C5]/80">
                  {product.badge}
                </span>
              )}
              <button
                onClick={handleWishlistClick}
                className="p-1 text-[#77736D] hover:text-[#D69A4B] transition-colors"
                title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#D69A4B] text-[#D69A4B]' : ''}`} />
              </button>
            </div>
          </div>

          {/* 3. Product Name (Playfair Display) */}
          <h3 className="font-serif text-lg sm:text-[19px] font-medium text-[#211A15] leading-snug group-hover:text-[#D69A4B] transition-colors">
            <Link to={`/product/${product.id}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>

          {/* 4. Short Product Description */}
          <p className="text-xs sm:text-[13px] text-[#77736D] line-clamp-2 leading-relaxed mt-1.5 font-sans">
            {product.shortDescription}
          </p>

          {/* 5. Available Finishes or Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 my-3 pt-1">
              <span className="text-[10px] sm:text-[11px] text-[#77736D] font-medium uppercase tracking-wider mr-1">
                Finishes:
              </span>
              <div className="flex items-center gap-1.5">
                {product.colors.map((color) => (
                  <span
                    key={color.name}
                    title={color.name}
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs inline-block"
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#77736D]">({product.colors.length})</span>
            </div>
          )}
        </div>

        {/* Bottom Section: Price & View Details Action */}
        <div className="mt-auto pt-4 border-t border-[#E9D8C5]/70">
          {/* 6 & 7. Price Block: Selling Price, Original MRP & Savings */}
          <div className="space-y-1 mb-4">
            <span className="text-[10px] uppercase tracking-wider text-[#77736D] font-semibold block">
              Selling Price
            </span>

            {/* Selling Price (prominent) + MRP */}
            <div className="flex items-baseline flex-wrap gap-x-2.5 gap-y-0.5">
              <span className="text-2xl sm:text-[25px] font-bold text-[#211710] font-sans tracking-tight leading-none">
                {formatINR(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs sm:text-sm text-[#77736D] line-through font-medium">
                  MRP: {formatINR(product.originalPrice)}
                </span>
              )}
            </div>

            {/* You Save Label */}
            {hasDiscount && (
              <div className="pt-1">
                <span className="inline-block text-[11px] sm:text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
                  You Save: {formatINR(savingsAmount)} ({discountPercent}% OFF)
                </span>
              </div>
            )}
          </div>

          {/* 8. View Details Button (Primary Action) */}
          <Link
            to={`/product/${product.id}`}
            className="w-full min-h-[44px] py-2.5 px-4 bg-[#211710] hover:bg-[#D69A4B] text-[#F8F0E8] hover:text-[#211710] text-xs uppercase tracking-widest font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-xs group/btn"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
