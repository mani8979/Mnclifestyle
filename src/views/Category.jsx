'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useParams, Link, Navigate } from '@/lib/router-bridge';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { categories, findCategoryById } from '../data/categories';
import { products } from '../data/products';
import { getWhatsAppConsultationUrl } from '../utils/whatsapp';
import { getSafeImageSrc, shouldUnoptimizeImage } from '../utils/image';
import { collectAvailableColors, matchesSelectedColor } from '../utils/colors';
import FormattedTitle from '../components/shared/FormattedTitle';
import {
  SlidersHorizontal,
  X,
  CheckCircle2,
  MessageCircle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Truck
} from 'lucide-react';

export default function Category({ initialCategory, initialProducts, allCategories }) {
  const params = useParams();
  const categoryId = params?.categorySlug || params?.categoryId;
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortOption, setSortOption] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Reset filters when category route changes
  useEffect(() => {
    setSelectedSubcategory('all');
    setSelectedColor('all');
    setSelectedPriceRange('all');
    setSortOption('featured');
    setIsMobileFilterOpen(false);
  }, [categoryId]);

  const category = initialCategory || findCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  const allProducts = Array.isArray(initialProducts) ? initialProducts : products;

  // Base products for this category (supports matching by ID or legacy ID or slug)
  const baseCategoryProducts = useMemo(() => {
    if (Array.isArray(initialProducts)) {
      return initialProducts;
    }
    return allProducts.filter(
      (p) => p.category === category.id || (category.legacyId && p.category === category.legacyId) || (category.slug && p.category === category.slug)
    );
  }, [category, initialProducts, allProducts]);

  // Only display subcategory options that have at least one product
  const availableSubcategories = useMemo(() => {
    const subs = new Set(baseCategoryProducts.map((p) => p.subCategory).filter(Boolean));
    return Array.from(subs);
  }, [baseCategoryProducts]);

  // Colors available within active category (+ subcategory if selected)
  const availableColors = useMemo(() => {
    const scoped =
      selectedSubcategory === 'all'
        ? baseCategoryProducts
        : baseCategoryProducts.filter((p) => p.subCategory === selectedSubcategory);
    return collectAvailableColors(scoped);
  }, [baseCategoryProducts, selectedSubcategory]);

  const effectiveSelectedColor =
    selectedColor !== 'all' && availableColors.some((c) => c.key === selectedColor.toLowerCase())
      ? selectedColor
      : 'all';

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let prods = [...baseCategoryProducts];

    // Subcategory Filter
    if (selectedSubcategory !== 'all') {
      prods = prods.filter((p) => p.subCategory === selectedSubcategory);
    }

    // Color Filter
    if (effectiveSelectedColor !== 'all') {
      prods = prods.filter((p) => matchesSelectedColor(p, effectiveSelectedColor));
    }

    // Price Filter
    if (selectedPriceRange === 'under-50k') {
      prods = prods.filter((p) => p.price < 50000);
    } else if (selectedPriceRange === '50k-100k') {
      prods = prods.filter((p) => p.price >= 50000 && p.price <= 100000);
    } else if (selectedPriceRange === 'above-100k') {
      prods = prods.filter((p) => p.price > 100000);
    }

    // Sort
    return prods.sort((a, b) => {
      if (sortOption === 'price-low') return a.price - b.price;
      if (sortOption === 'price-high') return b.price - a.price;
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOption === 'featured') {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      }
      return 0;
    });
  }, [baseCategoryProducts, selectedSubcategory, effectiveSelectedColor, selectedPriceRange, sortOption]);

  const resetFilters = () => {
    setSelectedSubcategory('all');
    setSelectedColor('all');
    setSelectedPriceRange('all');
    setSortOption('featured');
  };

  const hasActiveFilters =
    selectedSubcategory !== 'all' ||
    effectiveSelectedColor !== 'all' ||
    selectedPriceRange !== 'all' ||
    sortOption !== 'featured';

  const activeCategoriesList =
    Array.isArray(allCategories) && allCategories.length > 0 ? allCategories : categories;
  const otherCategories = activeCategoriesList
    .filter((c) => (c.slug || c.id) !== (category.slug || category.id))
    .slice(0, 3);
  const whatsappConsultationUrl = getWhatsAppConsultationUrl(
    `Custom ${category.name} Selection & Interior Styling`
  );

  // Balanced responsive grid classes depending on product count (1 big card per row on mobile, 2+ on tablet/desktop)
  const getCategoryGridClasses = (count) => {
    if (count === 1) return 'max-w-md mx-auto';
    if (count === 2) return 'grid grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto gap-4 sm:gap-8';
    if (count === 3) return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto gap-4 sm:gap-6';
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6';
  };

  return (
    <div className="pb-24 bg-[#F8F0E8]/40">
      
      {/* 1. Category Hero Banner */}
      <div className="bg-[#211710] text-[#F8F0E8] py-12 sm:py-16 relative overflow-hidden border-b border-[#49301F]">
        {/* Subtle Background Ambience */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src={getSafeImageSrc(category.image)}
            unoptimized={shouldUnoptimizeImage(getSafeImageSrc(category.image))}
            alt={category.name}
            fill
            sizes="100vw"
            className="object-cover brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#211710] via-[#211710]/70 to-[#211710]/40" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center space-x-2 text-xs text-[#C9BBAE] mb-3 font-sans">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-white transition-colors">Furniture</Link>
            <span>/</span>
            <span className="text-[#D69A4B] font-semibold">{category.name}</span>
          </nav>

          {/* Subtitle / Tagline */}
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#D69A4B] block mb-2 font-sans">
            {category.tagline || 'Curated Contemporary Living'}
          </span>

          {/* Main Title */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-tight mb-3">
            <FormattedTitle text={category.title || category.name} />
          </h1>

          {/* Meaningful Description */}
          <p className="text-xs sm:text-sm text-[#C9BBAE] max-w-2xl mx-auto leading-relaxed font-sans mb-5">
            {category.description}
          </p>

          {/* Supporting Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#C9BBAE] font-sans pt-3 border-t border-white/10">
            <div className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D69A4B]" />
              <span>{baseCategoryProducts.length} Curated Designs</span>
            </div>
            <span>•</span>
            <div className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#D69A4B]" />
              <span>Pan-India Delivery</span>
            </div>
            <span>•</span>
            <div className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D69A4B]" />
              <span>10-Year Craftsmanship Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">

        {/* Filter, Sort & Count Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E9D8C5] shadow-2xs mb-8">
          
          {/* Top Row: Pill Filters on Desktop & Mobile Filter Toggle */}
          <div className="flex items-center justify-between gap-4">
            
            {/* Desktop Subcategory Pills */}
            <div className="hidden lg:flex items-center flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubcategory('all')}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                  selectedSubcategory === 'all'
                    ? 'bg-[#211710] text-[#D69A4B] shadow-xs'
                    : 'bg-[#F8F0E8] text-[#211A15] hover:bg-[#E9D8C5] border border-[#E9D8C5]'
                }`}
              >
                All {category.name}
              </button>
              {availableSubcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                    selectedSubcategory === sub
                      ? 'bg-[#211710] text-[#D69A4B] shadow-xs'
                      : 'bg-[#F8F0E8] text-[#211A15] hover:bg-[#E9D8C5] border border-[#E9D8C5]'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Mobile Filter & Sort Drawer Button */}
            <div className="lg:hidden w-full flex items-center justify-between gap-2">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#211710] text-[#F8F0E8] rounded-xl text-xs uppercase tracking-wider font-semibold shadow-xs"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#D69A4B]" />
                <span>Filter & Sort {hasActiveFilters && '• Active'}</span>
              </button>

              <span className="text-xs text-[#766B61] font-medium">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
              </span>
            </div>

            {/* Desktop Sorting & Additional Filters */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Price Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#766B61] font-medium">Price:</span>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  aria-label="Filter by price range"
                  className="bg-[#F8F0E8] border border-[#E9D8C5] rounded-lg px-3 py-1.5 text-xs text-[#211A15] font-medium focus:outline-none focus:border-[#D69A4B]"
                >
                  <option value="all">All Prices</option>
                  <option value="under-50k">Under ₹50,000</option>
                  <option value="50k-100k">₹50,000 – ₹1,00,000</option>
                  <option value="above-100k">Above ₹1,00,000</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#766B61] font-medium">Sort:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  aria-label="Sort products"
                  className="bg-[#F8F0E8] border border-[#E9D8C5] rounded-lg px-3 py-1.5 text-xs text-[#211A15] font-medium focus:outline-none focus:border-[#D69A4B]"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>

          </div>

          {/* Desktop Color Filter Row */}
          {availableColors.length > 0 && (
            <div className="hidden lg:flex items-center flex-wrap gap-2 pt-3 mt-3 border-t border-[#E9D8C5]/60">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766B61] mr-1">
                Colour:
              </span>
              <button
                type="button"
                onClick={() => setSelectedColor('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  selectedColor === 'all'
                    ? 'bg-[#211710] text-white'
                    : 'bg-[#F8F0E8] text-[#211A15] hover:bg-[#E9D8C5] border border-[#E9D8C5]'
                }`}
              >
                All Colours
              </button>
              {availableColors.map((col) => {
                const active = selectedColor.toLowerCase() === col.key;
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => setSelectedColor(active ? 'all' : col.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                      active
                        ? 'bg-white border-[#007185] ring-2 ring-[#007185]/20 text-[#211710] font-semibold'
                        : 'bg-white border-[#E9D8C5] text-[#211A15] hover:border-[#211710]/40'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                    <span className="text-[10px] text-[#766B61]">({col.count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Results Summary Row */}
          <div className="hidden lg:flex items-center justify-between pt-3 mt-3 border-t border-[#E9D8C5]/60 text-xs text-[#766B61]">
            <div>
              <span>
                Showing <strong className="text-[#211A15]">{filteredProducts.length}</strong>{' '}
                {filteredProducts.length === 1 ? 'piece' : 'pieces'} in {category.name}
              </span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[#D69A4B] hover:text-[#211710] font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

        </div>

        {/* Active Filter Chips Strip */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
            <span className="text-[#766B61] text-[11px] uppercase tracking-wider font-semibold mr-1">
              Active Filters:
            </span>
            {selectedSubcategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E9D8C5] text-[#211A15] shadow-2xs">
                <span>Subcategory: {selectedSubcategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedSubcategory('all')}
                  className="text-[#766B61] hover:text-[#211710] font-bold"
                  aria-label="Remove subcategory filter"
                >
                  ×
                </button>
              </span>
            )}
            {effectiveSelectedColor !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E9D8C5] text-[#211A15] shadow-2xs">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{
                    backgroundColor:
                      availableColors.find((c) => c.key === effectiveSelectedColor.toLowerCase())?.hex ||
                      '#211710',
                  }}
                />
                <span>
                  Colour:{' '}
                  {availableColors.find((c) => c.key === effectiveSelectedColor.toLowerCase())?.name ||
                    effectiveSelectedColor}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedColor('all')}
                  className="text-[#766B61] hover:text-[#211710] font-bold"
                  aria-label="Remove colour filter"
                >
                  ×
                </button>
              </span>
            )}
            {selectedPriceRange !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E9D8C5] text-[#211A15] shadow-2xs">
                <span>
                  Price: {selectedPriceRange === 'under-50k' ? 'Under ₹50,000' : selectedPriceRange === '50k-100k' ? '₹50,000 – ₹1,00,000' : 'Above ₹1,00,000'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPriceRange('all')}
                  className="text-[#766B61] hover:text-[#211710] font-bold"
                  aria-label="Remove price filter"
                >
                  ×
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="text-[#D69A4B] hover:text-[#211710] font-semibold text-xs ml-1 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}

        {/* 3. Product Listing Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E9D8C5] p-8 my-8 shadow-xs max-w-xl mx-auto">
            <h3 className="font-serif text-2xl text-[#211A15] mb-2 font-normal">
              No designs match your criteria
            </h3>
            <p className="text-xs sm:text-sm text-[#766B61] mb-5 leading-relaxed font-sans">
              Try adjusting your subcategory or price range filter to explore our available handcrafted pieces.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-[#211710] text-[#F8F0E8] hover:bg-[#D69A4B] hover:text-[#211710] rounded-xl text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            data-testid="category-product-grid"
            className={getCategoryGridClasses(filteredProducts.length)}
          >
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}

        {/* 5. Explore Other Categories */}
        <div className="mt-16 sm:mt-20">
          <SectionHeading
            subtitle="Complete Your Residence"
            title="Explore Other Rooms & Categories"
            description="Discover cohesive furniture systems crafted to harmonize across adjacent spaces."
            align="left"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {otherCategories.map((c) => (
              <Link
                key={c.slug || c.id}
                to={`/category/${c.slug || c.id}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-beige-200 block shadow-soft border border-[#E9D8C5]"
              >
                <Image
                  src={getSafeImageSrc(c.image)}
                  unoptimized={shouldUnoptimizeImage(getSafeImageSrc(c.image))}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 brightness-90 group-hover:brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#211710]/85 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[10px] uppercase tracking-widest text-[#D69A4B] font-semibold">Category</span>
                  <h4 className="font-serif text-xl text-white group-hover:text-[#D69A4B] transition-colors">
                    <FormattedTitle text={c.name} />
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-[#E9D8C5] mt-1">
                    <span>Explore &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* 6. Mobile Filter & Sort Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-[#211710]/60 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-4/5 max-w-sm h-full bg-[#F8F0E8] shadow-2xl p-6 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9D8C5] mb-6">
              <span className="font-serif text-lg font-medium text-[#211A15]">
                Filter & Sort
              </span>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-[#211A15] hover:text-[#D69A4B] transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subcategories */}
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#766B61] block mb-3">
                Subcategory
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubcategory('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedSubcategory === 'all'
                      ? 'bg-[#211710] text-[#D69A4B]'
                      : 'bg-white text-[#211A15] border border-[#E9D8C5]'
                  }`}
                >
                  All {category.name}
                </button>
                {availableSubcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedSubcategory === sub
                        ? 'bg-[#211710] text-[#D69A4B]'
                        : 'bg-white text-[#211A15] border border-[#E9D8C5]'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter (Mobile Drawer) */}
            {availableColors.length > 0 && (
              <div className="mb-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#766B61] block mb-3">
                  Colour
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedColor('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedColor === 'all'
                        ? 'bg-[#211710] text-[#D69A4B]'
                        : 'bg-white text-[#211A15] border border-[#E9D8C5]'
                    }`}
                  >
                    All Colours
                  </button>
                  {availableColors.map((col) => {
                    const active = selectedColor.toLowerCase() === col.key;
                    return (
                      <button
                        key={col.key}
                        type="button"
                        onClick={() => setSelectedColor(active ? 'all' : col.key)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          active
                            ? 'bg-[#211710] text-[#D69A4B]'
                            : 'bg-white text-[#211A15] border border-[#E9D8C5]'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#766B61] block mb-2">
                Price Range
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full bg-white border border-[#E9D8C5] rounded-xl px-3 py-2 text-xs text-[#211A15] focus:outline-none focus:border-[#D69A4B]"
              >
                <option value="all">All Prices</option>
                <option value="under-50k">Under ₹50,000</option>
                <option value="50k-100k">₹50,000 – ₹1,00,000</option>
                <option value="above-100k">Above ₹1,00,000</option>
              </select>
            </div>

            {/* Sort Option */}
            <div className="mb-8">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#766B61] block mb-2">
                Sort By
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full bg-white border border-[#E9D8C5] rounded-xl px-3 py-2 text-xs text-[#211A15] focus:outline-none focus:border-[#D69A4B]"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            {/* Drawer Actions */}
            <div className="mt-auto space-y-2 pt-4 border-t border-[#E9D8C5]">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-[#211710] text-[#F8F0E8] rounded-xl text-xs uppercase tracking-wider font-semibold"
              >
                Show Results ({filteredProducts.length})
              </button>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="w-full py-2.5 bg-white border border-[#E9D8C5] text-[#211A15] rounded-xl text-xs font-medium"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
