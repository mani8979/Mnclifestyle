import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { products } from '../data/products';

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

  const popularKeywords = ['Bouclé Sofa', 'Oak Bed', 'Dining Table', 'Travertine', 'Lounge Chair', 'Credenza'];

  const handleSelectProduct = (id) => {
    onClose();
    navigate(`/product/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-charcoal/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-ivory-100 rounded-2xl shadow-elevated border border-beige-300 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-6 py-5 border-b border-beige-300 bg-white">
          <Search className="w-5 h-5 text-bronze mr-4 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search luxury sofas, oak dining tables, beds, credenzas..."
            className="w-full bg-transparent text-charcoal placeholder:text-warmgrey text-base md:text-lg focus:outline-none"
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
            className="p-2 text-warmgrey hover:text-charcoal transition-colors rounded-full hover:bg-ivory"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestions & Tags */}
        <div className="px-6 py-3 bg-beige/30 border-b border-beige-200 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-warmgrey font-medium uppercase tracking-wider text-[10px]">Popular:</span>
          {popularKeywords.map((kw) => (
            <button
              key={kw}
              onClick={() => setQuery(kw)}
              className="px-2.5 py-1 rounded-full bg-white text-charcoal hover:bg-bronze hover:text-white transition-colors border border-beige-300 shadow-sm"
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
                Search by furniture room, material (oak, travertine, bouclé), or piece name.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base text-charcoal font-medium">No pieces found matching "{query}"</p>
              <p className="text-xs text-warmgrey mt-1">
                Try searching for broader keywords like "Living", "Table", or "Chair".
              </p>
            </div>
          ) : (
            filtered.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleSelectProduct(prod.id)}
                className="py-3 flex items-center gap-4 hover:bg-white/80 p-3 rounded-lg transition-colors cursor-pointer group"
              >
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  className="w-16 h-16 object-cover rounded-md bg-beige-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-bronze font-semibold">
                      {prod.categoryLabel}
                    </span>
                    {prod.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-beige-200 text-charcoal-700">
                        {prod.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm md:text-base font-serif font-medium text-charcoal truncate group-hover:text-bronze transition-colors">
                    {prod.name}
                  </h4>
                  <p className="text-xs text-warmgrey truncate">{prod.shortDescription}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-semibold text-charcoal">${prod.price.toLocaleString()}</span>
                  <div className="flex items-center text-xs text-bronze font-medium justify-end mt-1 group-hover:translate-x-1 transition-transform">
                    <span>View</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-ivory-200 border-t border-beige-300 flex justify-between items-center text-xs text-warmgrey">
          <span>{filtered.length} curated design{filtered.length === 1 ? '' : 's'} available</span>
          <button
            onClick={() => {
              onClose();
              navigate('/shop');
            }}
            className="text-bronze hover:text-bronze-dark font-medium underline underline-offset-4"
          >
            Explore Complete Catalog &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

