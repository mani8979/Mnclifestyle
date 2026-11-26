'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useNavigate } from '@/lib/router-bridge';
import { Search, X, ArrowRight } from 'lucide-react';
import { products, slugify } from '../data/products';
import { formatINR } from '../utils/currency';
import { getSafeImageSrc, shouldUnoptimizeImage } from '../utils/image';
import FormattedTitle from './shared/FormattedTitle';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim() === ''
    ? []
    : products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.materials.some((m) => m.toLowerCase().includes(q))
        );
      });

  const popularKeywords = ['Bouclé Sofa', 'Teak Bed', 'Dining Set', 'Travertine', 'Recliner', 'Wardrobe', 'Study Table'];

  const handleSelectProduct = (productOrId) => {
    onClose();
    const slug = typeof productOrId === 'object' ? (productOrId.slug || slugify(productOrId.name)) : productOrId;
    navigate(`/product/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#211710]/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-[#F8F0E8] rounded-2xl shadow-elevated border border-[#E9D8C5] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-6 py-5 border-b border-[#E9D8C5] bg-white">
          <Search className="w-5 h-5 text-[#D69A4B] mr-4 flex-shrink-0" />
          <label htmlFor="search-furniture-input" className="sr-only">Search furniture pieces</label>
          <input
            id="search-furniture-input"
            ref={inputRef}
            type="text"
            aria-label="Search luxury sofas, teak dining tables, beds, recliners"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search luxury sofas, teak dining tables, beds, recliners..."
            className="w-full bg-transparent text-[#211A15] placeholder:text-warmgrey text-base md:text-lg focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-warmgrey hover:text-charcoal mr-2"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-warmgrey hover:text-charcoal transition-colors rounded-full hover:bg-[#F8F0E8]"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestions & Tags */}
        <div className="px-6 py-3 bg-[#E9D8C5]/30 border-b border-[#E9D8C5] flex items-center gap-2 flex-wrap text-xs">
          <span className="text-warmgrey font-medium uppercase tracking-wider text-[10px]">Popular:</span>
          {popularKeywords.map((kw) => (
            <button
              key={kw}
              onClick={() => setQuery(kw)}
              className="px-2.5 py-1 rounded-full bg-white text-charcoal hover:bg-[#D69A4B] hover:text-[#211710] transition-colors border border-beige-300 shadow-sm"
            >
              {kw}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-6 divide-y divide-beige-200">
          {query.trim() === '' ? (
            <div className="text-center py-10">
              <p className="text-sm text-warmgrey font-serif text-lg italic">
                Begin typing to discover handcrafted furniture pieces
              </p>
              <p className="text-xs text-warmgrey/70 mt-1">
                Search by category, wood species (Teak, Sheesham), stone (Travertine, Marble), or design name.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base text-charcoal font-medium">No pieces found matching "{query}"</p>
              <p className="text-xs text-warmgrey mt-1">
                Try searching for broader keywords like "Sofa", "Bed", "Table", or "Dining".
              </p>
            </div>
          ) : (
            filtered.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleSelectProduct(prod)}
                className="py-3 flex items-center gap-4 hover:bg-white/80 p-3 rounded-lg transition-colors cursor-pointer group"
              >
                <Image
                  src={getSafeImageSrc(prod.images?.[0])}
                  unoptimized={shouldUnoptimizeImage(getSafeImageSrc(prod.images?.[0]))}
                  alt={prod.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-md bg-beige-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-bron font-semibold text-[#D69A4B]">
                      {prod.categoryLabel}
                    </span>
                    {prod.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-beige-200 text-charcoal-700">
                        {prod.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm md:text-base font-serif font-medium text-charcoal truncate group-hover:text-bronze transition-colors">
                    <FormattedTitle text={prod.name} />
                  </h4>
                  <p className="text-xs text-warmgrey truncate">{prod.shortDescription}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-sans font-bold tabular-nums text-charcoal">{formatINR(prod.price)}</span>
                  <div className="flex items-center text-xs text-[#D69A4B] font-medium justify-end mt-1 group-hover:translate-x-1 transition-transform">
                    <span>View</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
