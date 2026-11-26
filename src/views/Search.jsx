'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Link, useSearchParams } from '@/lib/router-bridge';
import { Search as SearchIcon, X, ArrowRight, RotateCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products as fallbackProducts } from '../data/products';
import { categories as fallbackCategories } from '../data/categories';
import { getSafeImageSrc, shouldUnoptimizeImage } from '../utils/image';
import FormattedTitle from '../components/shared/FormattedTitle';

export default function SearchView({ initialProducts, initialCategories }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCat = searchParams.get('category') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [liveProducts] = useState(
    Array.isArray(initialProducts) && initialProducts.length > 0 ? initialProducts : fallbackProducts
  );
  const [liveCategories] = useState(
    Array.isArray(initialCategories) && initialCategories.length > 0 ? initialCategories : fallbackCategories
  );
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleQueryChange = (val) => {
    setQuery(val);
    const next = new URLSearchParams();
    if (val.trim()) next.set('q', val);
    if (selectedCategory !== 'all') next.set('category', selectedCategory);
    setSearchParams(next);
  };

  const handleCategoryChange = (catSlug) => {
    setSelectedCategory(catSlug);
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query);
    if (catSlug !== 'all') next.set('category', catSlug);
    setSearchParams(next);
  };

  const normalizedCategories = useMemo(() => {
    return liveCategories.filter((c) => {
      const slug = c.slug || c.id;
      return slug && slug !== 'wardrobes-2';
    });
  }, [liveCategories]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return liveProducts.filter((p) => {
      if (selectedCategory !== 'all') {
        const matchesCat =
          p.category === selectedCategory ||
          p.categorySlug === selectedCategory ||
          p.categoryLabel?.toLowerCase() === selectedCategory.toLowerCase();
        if (!matchesCat) return false;
      }
      if (!q) return true;
      return (
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.categoryLabel || '').toLowerCase().includes(q) ||
        String(p.category || '').toLowerCase().includes(q) ||
        String(p.subCategory || '').toLowerCase().includes(q) ||
        String(p.shortDescription || '').toLowerCase().includes(q) ||
        (Array.isArray(p.materials) && p.materials.some((m) => String(m).toLowerCase().includes(q)))
      );
    });
  }, [liveProducts, query, selectedCategory]);

  const popularKeywords = [
    'Recliner',
    'Sofa',
    'Bed',
    'Wardrobe',
    'Dining Table',
    'Office Table',
    'Chair',
    'Centre Table',
  ];

  const hasSearchOrFilter = query.trim().length > 0 || selectedCategory !== 'all';

  return (
    <div className="pt-3 sm:pt-5 pb-24 min-h-[70vh]">
      <div className="max-w-[1672px] mx-auto px-3 sm:px-8 lg:px-[50px]">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center justify-center space-x-2 text-[11px] sm:text-xs text-[#766B61] mb-2"
        >
          <Link to="/" className="hover:text-[#211710] transition-colors">
            Home
          </Link>
          <span className="text-[#DDD3C4]">/</span>
          <span className="text-[#211710] font-medium">Search</span>
        </nav>

        {/* Page Header & Search Input */}
        <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#855214] font-bold block mb-1">
            MNC LIFE STYLE DAMRO
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#211710] font-normal tracking-tight mb-4">
            Search Our Collection
          </h1>

          <div className="relative flex items-center bg-white rounded-2xl border border-[#E9D8C5] shadow-sm px-4 sm:px-5 h-12 sm:h-14 focus-within:border-[#D69A4B] focus-within:ring-2 focus-within:ring-[#D69A4B]/20 transition-all">
            <SearchIcon className="w-5 h-5 text-[#D69A4B] mr-3 shrink-0" />
            <label htmlFor="page-search-input" className="sr-only">
              Search furniture pieces
            </label>
            <input
              id="page-search-input"
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search sofas, recliners, beds, wardrobes, dining tables..."
              className="w-full bg-transparent text-sm sm:text-base text-[#211A15] placeholder:text-[#77736D] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange('')}
                className="p-1.5 text-[#77736D] hover:text-[#211A15] rounded-full hover:bg-[#F8F0E8] transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Popular Keywords */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap mt-3 text-xs">
            <span className="text-[#77736D] font-medium uppercase tracking-wider text-[10px]">
              Popular:
            </span>
            {popularKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleQueryChange(kw)}
                className={`px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  query.toLowerCase() === kw.toLowerCase()
                    ? 'bg-[#211710] text-white border-[#211710]'
                    : 'bg-white text-[#211A15] border-[#E9D8C5] hover:border-[#D69A4B]'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Strip */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#766B61]">
              Filter by Category
            </h2>
            {hasSearchOrFilter && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('all');
                  setSearchParams(new URLSearchParams());
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#D69A4B] hover:text-[#211710] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => handleCategoryChange('all')}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[#211710] text-white border-[#211710]'
                  : 'bg-white text-[#211A15] border-[#E9D8C5] hover:border-[#D69A4B]'
              }`}
            >
              All Categories
            </button>
            {normalizedCategories.map((cat) => {
              const slug = cat.slug || cat.id;
              const active = selectedCategory === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => handleCategoryChange(active ? 'all' : slug)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer shrink-0 ${
                    active
                      ? 'bg-[#211710] text-[#D69A4B] border-[#211710]'
                      : 'bg-white text-[#211A15] border-[#E9D8C5] hover:border-[#D69A4B]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Browse Categories Grid (when no search query/filter is active) */}
        {!hasSearchOrFilter ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl sm:text-2xl text-[#211710] font-normal">
                Browse Furniture Categories
              </h2>
              <Link
                to="/shop"
                className="text-xs font-semibold text-[#855214] hover:text-[#211710] inline-flex items-center gap-1"
              >
                <span>View All ({liveProducts.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {normalizedCategories.map((cat) => {
                const slug = cat.slug || cat.id;
                const imgSrc = getSafeImageSrc(cat.image);
                return (
                  <Link
                    key={slug}
                    to={`/category/${slug}`}
                    className="group relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#EAE2D8] border border-[#E9D8C5] shadow-2xs hover:shadow-luxury transition-all"
                  >
                    <Image
                      src={imgSrc}
                      alt={cat.name}
                      fill
                      unoptimized={shouldUnoptimizeImage(imgSrc)}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#211710]/85 via-[#211710]/20 to-transparent flex flex-col justify-end p-3 sm:p-4">
                      <h3 className="font-serif text-sm sm:text-lg text-white font-medium leading-tight group-hover:text-[#D69A4B] transition-colors">
                        <FormattedTitle text={cat.name} />
                      </h3>
                      <span className="text-[10px] sm:text-xs text-[#E9D8C5] mt-0.5 inline-flex items-center gap-1">
                        <span>Explore</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs sm:text-sm text-[#766B61]">
                Found <strong className="text-[#211710]">{filteredProducts.length}</strong>{' '}
                {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                {query.trim() ? ` for "${query.trim()}"` : ''}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#E9D8C5] p-6 max-w-lg mx-auto">
                <h3 className="font-serif text-xl text-[#211710] mb-2">No matching furniture found</h3>
                <p className="text-xs sm:text-sm text-[#766B61] mb-5">
                  Try another keyword or clear your category filter to browse all pieces.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedCategory('all');
                    setSearchParams(new URLSearchParams());
                  }}
                  className="px-5 py-2.5 bg-[#211710] text-white rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-[#D69A4B] hover:text-[#211710] transition-colors"
                >
                  Clear Search &amp; Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
                {filteredProducts.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
