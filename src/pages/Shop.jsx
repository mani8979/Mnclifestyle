import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { formatINR } from '../utils/currency';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  RotateCcw,
  Check
} from 'lucide-react';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState('featured');
  const [priceRange, setPriceRange] = useState(300000);
  const [filterBadge, setFilterBadge] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sync state if URL search query changes externally
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Handle category selection
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catId });
    }
  };

  // Popular materials available in catalog
  const materialsList = [
    { id: 'all', label: 'All Materials' },
    { id: 'teak', label: 'Solid Teakwood' },
    { id: 'bouclé', label: 'Belgian Bouclé' },
    { id: 'travertine', label: 'Roman Travertine' },
    { id: 'sheesham', label: 'Sheesham Hardwood' },
    { id: 'brass', label: 'Brushed Brass' },
    { id: 'leather', label: 'Italian Leather' }
  ];

  // Specific 12 categories required
  const categoryNavItems = [
    { id: 'all', name: 'All Furniture' },
    { id: 'sofas', name: 'Sofas' },
    { id: 'beds', name: 'Beds' },
    { id: 'dining-sets', name: 'Dining Sets' },
    { id: 'study-tables', name: 'Study Tables' },
    { id: 'centre-tables', name: 'Centre Tables' },
    { id: 'recliners', name: 'Recliners' },
    { id: 'wardrobes', name: 'Wardrobes' },
    { id: 'cabinets-sideboards', name: 'Cabinets & Sideboards' },
    { id: 'office-furniture', name: 'Office Furniture' },
    { id: 'shoe-racks', name: 'Shoe Racks' },
    { id: 'bar-furniture', name: 'Bar Furniture' }
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all') {
          if (p.category !== selectedCategory) {
            // Also match legacy IDs if present
            const catObj = categories.find((c) => c.id === selectedCategory);
            if (!catObj || (p.category !== catObj.id && p.category !== catObj.legacyId)) {
              return false;
            }
          }
        }

        // Material filter
        if (selectedMaterial !== 'all') {
          const matchMat = p.materials?.some((m) =>
            m.toLowerCase().includes(selectedMaterial.toLowerCase())
          );
          if (!matchMat) return false;
        }

        // Edition / Badge filter
        if (filterBadge !== 'all') {
          if (filterBadge === 'bestseller' && !p.isBestseller) return false;
          if (filterBadge === 'signature' && p.badge !== 'Signature Piece') return false;
        }

        // Price filter
        if (p.price > priceRange) {
          return false;
        }

        // Search term
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.shortDescription.toLowerCase().includes(q);
          const matchCat = p.categoryLabel.toLowerCase().includes(q);
          const matchMat = p.materials?.some((m) => m.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchCat && !matchMat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === 'price-low') return a.price - b.price;
        if (selectedSort === 'price-high') return b.price - a.price;
        if (selectedSort === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0; // Default featured
      });
  }, [selectedCategory, selectedSort, priceRange, filterBadge, selectedMaterial, searchTerm]);

  // Count active filters (excluding defaults)
  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedMaterial !== 'all' ? 1 : 0) +
    (filterBadge !== 'all' ? 1 : 0) +
    (priceRange < 300000 ? 1 : 0) +
    (searchTerm.trim() !== '' ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedSort('featured');
    setPriceRange(300000);
    setFilterBadge('all');
    setSelectedMaterial('all');
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <div className="py-6 sm:py-10 lg:py-12 pb-24">
      <div className="max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-[50px]">
        
        {/* 1. Compact Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center justify-center space-x-2 text-xs text-[#766B61] mb-2 sm:mb-3">
          <Link to="/" className="hover:text-[#211710] transition-colors">Home</Link>
          <span className="text-[#DDD3C4]">/</span>
          <span className="text-[#211710] font-medium">Shop</span>
        </nav>

        {/* 2. Compact Page Header */}
        <div className="mb-6 sm:mb-8 text-center max-w-2xl mx-auto">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#D99B4A] font-bold block mb-1">
            THE MNC COLLECTION
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[40px] text-[#211710] font-normal tracking-tight leading-tight mb-2">
            Discover Our Furniture
          </h1>
          <p className="text-xs sm:text-sm text-[#766B61] leading-relaxed font-sans">
            Explore thoughtfully curated furniture designed for contemporary Indian homes.
          </p>
        </div>

        {/* 3. Horizontal Category Navigation Bar */}
        <div className="mb-6 sm:mb-8 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-1">
          <div className="inline-flex items-center gap-2 sm:gap-2.5 px-0.5">
            {categoryNavItems.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'bg-[#211710] text-white shadow-xs border border-[#211710]'
                      : 'bg-white text-[#211710] hover:border-[#D99B4A] hover:text-[#D99B4A] border border-[#E9D8C5]'
                  }`}
                  aria-pressed={isActive}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Compact Shopping Toolbar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E9D8C5] shadow-2xs mb-6 sm:mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Left: Search Input */}
          <div className="relative flex-1 max-w-full md:max-w-xs lg:max-w-sm">
            <Search className="w-4 h-4 text-[#766B61] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search furniture (e.g. Bouclé, Teak)..."
              className="w-full bg-[#F8F0E8]/50 border border-[#E9D8C5] rounded-full pl-9 pr-8 py-2 text-xs text-[#211710] placeholder:text-[#766B61]/70 focus:outline-none focus:border-[#D99B4A] transition-colors"
              aria-label="Search products"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#766B61] hover:text-[#211710] text-xs font-bold p-0.5"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Right Controls: Filters Button + Sort Dropdown + Product Count */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
            
            {/* Filter Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-white hover:bg-[#F8F0E8] border border-[#E9D8C5] rounded-full text-xs font-medium text-[#211710] transition-colors shadow-2xs"
              aria-label="Open filter options"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D99B4A]" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#211710] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-white hover:bg-[#F8F0E8] border border-[#E9D8C5] rounded-full pl-3.5 pr-8 py-2 text-xs font-medium text-[#211710] focus:outline-none focus:border-[#D99B4A] cursor-pointer shadow-2xs transition-colors appearance-none"
                aria-label="Sort products"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#766B61] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Product Count Indicator */}
            <span className="text-xs text-[#766B61] font-medium hidden sm:inline-block ml-1">
              <strong className="text-[#211710] font-semibold">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'piece' : 'pieces'}
            </span>

          </div>
        </div>

        {/* Active Filter Chips Strip (If any filters applied) */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
            <span className="text-[#766B61] text-[11px] uppercase tracking-wider font-semibold mr-1">
              Active Filters:
            </span>

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E9D8C5] text-[#211710] shadow-2xs">
                <span>Category: {categoryNavItems.find(c => c.id === selectedCategory)?.name || selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('all')}
                  className="text-[#766B61] hover:text-[#211710] font-bold"
                  aria-label="Remove category filter"
                >
                  ×
                </button>
              </span>
            )}

            {selectedMaterial !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E9D8C5] text-[#211710] shadow-2xs">
                <span>Material: {materialsList.find(m => m.id === selectedMaterial)?.label || selectedMaterial}</span>
                <button
                  type="button"
                  onClick={() => setSelectedMaterial('all')}
                  className="text-[#766B61] hover:text-[#211710] font-bold"
                  aria-label="Remove material filter"
                >
                  ×
                </button>
              </span>
            )}

            {filterBadge !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E9D8C5] text-[#211710] shadow-2xs">
                <span>Edition: {filterBadge === 'bestseller' ? 'Bestsellers' : 'Signature Pieces'}</span>
                <button
                  type="button"
                  onClick={() => setFilterBadge('all')}
                  className="text-[#766B61] hover:text-[#211710] font-bold"
                  aria-label="Remove edition filter"
                >
                  ×
                </button>
              </span>
            )}

            {priceRange < 300000 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E9D8C5] text-[#211710] shadow-2xs">
                <span>Price: Up to {formatINR(priceRange)}</span>
                <button
                  type="button"
                  onClick={() => setPriceRange(300000)}
                  className="text-[#766B61] hover:text-[#211710] font-bold"
                  aria-label="Remove price filter"
                >
                  ×
                </button>
              </span>
            )}

            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E9D8C5] text-[#211710] shadow-2xs">
                <span>Search: "{searchTerm}"</span>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-[#766B61] hover:text-[#211710] font-bold"
                  aria-label="Remove search filter"
                >
                  ×
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#D99B4A] hover:text-[#211710] font-semibold text-xs ml-1 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>
        )}

        {/* 5. Product Grid: 4 cols on desktop, 3 on md, 2 on mobile */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-[#E9D8C5] p-6 sm:p-10 my-6 max-w-lg mx-auto shadow-2xs">
            <h3 className="font-serif text-2xl text-[#211710] mb-2 font-normal">
              No matching pieces found
            </h3>
            <p className="text-xs sm:text-sm text-[#766B61] leading-relaxed mb-6 font-sans">
              We couldn't find any furniture pieces matching your current filters. Try adjusting your selections or clear all filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-[#211710] text-[#F8F0E8] rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-[#D99B4A] hover:text-[#211710] transition-colors shadow-2xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>

      {/* 6. Advanced Filters Drawer / Slide-Over Modal */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#211710]/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#E9D8C5] animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E9D8C5] flex items-center justify-between bg-[#F8F0E8]/50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#D99B4A]" />
                <h3 className="font-serif text-lg font-medium text-[#211710]">
                  Filter Furniture
                </h3>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#211710] text-white text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-2 text-[#766B61] hover:text-[#211710] transition-colors rounded-full hover:bg-black/5"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* Filter 1: Category */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-[#211710] mb-3">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categoryNavItems.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-[#211710] text-white font-semibold'
                            : 'bg-[#F8F0E8] text-[#211710] hover:bg-[#E9D8C5]'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter 2: Material */}
              <div className="pt-4 border-t border-[#E9D8C5]/70">
                <label className="block text-xs uppercase tracking-wider font-bold text-[#211710] mb-3">
                  Material
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {materialsList.map((mat) => {
                    const isSelected = selectedMaterial === mat.id;
                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => setSelectedMaterial(mat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#211710] text-white font-semibold'
                            : 'bg-[#F8F0E8] text-[#211710] hover:bg-[#E9D8C5]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-[#D99B4A]" />}
                        <span>{mat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter 3: Price Range */}
              <div className="pt-4 border-t border-[#E9D8C5]/70">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider font-bold text-[#211710]">
                    Maximum Price
                  </label>
                  <span className="text-xs font-bold text-[#211710] font-sans tabular-nums">
                    Up to {formatINR(priceRange)}
                  </span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="300000"
                  step="5000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#211710] cursor-pointer"
                  aria-label="Maximum price filter"
                />
                <div className="flex justify-between text-[10px] text-[#766B61] mt-1 font-mono">
                  <span>₹15,000</span>
                  <span>₹3,00,000</span>
                </div>
              </div>

              {/* Filter 4: Collection / Edition */}
              <div className="pt-4 border-t border-[#E9D8C5]/70">
                <label className="block text-xs uppercase tracking-wider font-bold text-[#211710] mb-3">
                  Collection / Edition
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'all', label: 'All Editions' },
                    { id: 'bestseller', label: 'Bestselling Pieces' },
                    { id: 'signature', label: 'Signature Pieces' }
                  ].map((ed) => {
                    const isSelected = filterBadge === ed.id;
                    return (
                      <button
                        key={ed.id}
                        type="button"
                        onClick={() => setFilterBadge(ed.id)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors text-left flex items-center justify-between border ${
                          isSelected
                            ? 'border-[#211710] bg-[#211710] text-white font-semibold'
                            : 'border-[#E9D8C5] bg-white text-[#211710] hover:bg-[#F8F0E8]'
                        }`}
                      >
                        <span>{ed.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#D99B4A]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-[#E9D8C5] bg-[#F8F0E8]/50 flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-1/3 py-2.5 border border-[#E9D8C5] hover:bg-white text-[#211710] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-center"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 bg-[#211710] hover:bg-[#D99B4A] text-white hover:text-[#211710] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-center shadow-xs"
              >
                Show {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
