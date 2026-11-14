import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { formatINR } from '../utils/currency';
import { Filter, Search, RotateCcw } from 'lucide-react';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState('featured');
  const [priceRange, setPriceRange] = useState(300000);
  const [filterBadge, setFilterBadge] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sync state if URL search query changes externally
  React.useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Synchronize category with url query param if changed
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catId });
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }
        // Badge filter
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
        if (selectedSort === 'rating') return b.rating - a.rating;
        // Default featured
        return 0;
      });
  }, [selectedCategory, selectedSort, priceRange, filterBadge, searchTerm]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedSort('featured');
    setPriceRange(300000);
    setFilterBadge('all');
    setSearchTerm('');
    setSearchParams({});
  };

  const isFiltered =
    selectedCategory !== 'all' ||
    selectedSort !== 'featured' ||
    priceRange < 300000 ||
    filterBadge !== 'all' ||
    searchTerm.trim() !== '';

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-[50px]">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-warmgrey mb-6">
          <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">Furniture Catalog</span>
        </div>

        {/* Page Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#D69A4B] font-semibold block mb-2">
            The Complete Indian Collection
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal font-normal tracking-tight">
            Furniture & Living Solutions
          </h1>
          <p className="mt-3 text-sm sm:text-base text-warmgrey leading-relaxed">
            Every piece is crafted in small limited editions using authentic seasoned Indian teakwood, Sheesham, Belgian bouclé, and Italian Roman travertine.
          </p>
        </div>

        {/* Filter Navigation Bar */}
        <div className="bg-white rounded-2xl p-6 border border-[#E9D8C5] shadow-soft mb-10 space-y-6">
          
          {/* Top row: Category Pills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-charcoal font-semibold flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#D69A4B]" />
                <span>Categories & Rooms</span>
              </span>
              {isFiltered && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#D69A4B] hover:text-[#9E6726] font-medium flex items-center gap-1 underline underline-offset-4"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-200 font-medium ${
                  selectedCategory === 'all'
                    ? 'bg-[#211710] text-white shadow-sm'
                    : 'bg-[#F8F0E8] text-[#211A15] hover:bg-[#E9D8C5] border border-[#E9D8C5]'
                }`}
              >
                All Furniture ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-200 font-medium ${
                    selectedCategory === cat.id
                      ? 'bg-[#211710] text-white shadow-sm'
                      : 'bg-[#F8F0E8] text-[#211A15] hover:bg-[#E9D8C5] border border-[#E9D8C5]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom row: Search input, Badges, Price, Sorting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-beige-200 items-end">
            
            {/* Search Input */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-warmgrey mb-1.5 font-medium">
                Keyword Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-warmgrey absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. Bouclé, Teak, Travertine..."
                  className="w-full bg-[#F8F0E8]/60 border border-[#E9D8C5] rounded-lg pl-9 pr-3 py-2 text-xs text-charcoal placeholder:text-warmgrey focus:outline-none focus:border-[#D69A4B]"
                />
              </div>
            </div>

            {/* Collection Curation Filter */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-warmgrey mb-1.5 font-medium">
                Curation Status
              </label>
              <select
                value={filterBadge}
                onChange={(e) => setFilterBadge(e.target.value)}
                className="w-full bg-[#F8F0E8]/60 border border-[#E9D8C5] rounded-lg px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-[#D69A4B]"
              >
                <option value="all">All Editions</option>
                <option value="bestseller">Bestselling Pieces</option>
                <option value="signature">Signature Pieces</option>
              </select>
            </div>

            {/* Max Price Range Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs uppercase tracking-wider text-warmgrey font-medium">
                  Max Price
                </label>
                <span className="text-xs font-semibold text-charcoal font-serif">
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
                className="w-full accent-[#D69A4B] cursor-pointer"
              />
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-warmgrey mb-1.5 font-medium">
                Sort By
              </label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full bg-[#F8F0E8]/60 border border-[#E9D8C5] rounded-lg px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-[#D69A4B]"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-beige-300">
          <p className="text-xs text-warmgrey">
            Displaying <span className="font-semibold text-charcoal">{filteredProducts.length}</span> handcrafted designs
          </p>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-beige-300 p-8 my-8">
            <h3 className="font-serif text-2xl text-charcoal mb-2">No matching pieces found</h3>
            <p className="text-xs sm:text-sm text-warmgrey max-w-md mx-auto mb-6">
              We couldn't find any furniture pieces matching your current filters. Try expanding your search criteria or resetting filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-3 bg-[#211710] text-[#F8F0E8] rounded-lg text-xs uppercase tracking-widest font-semibold hover:bg-[#D69A4B] hover:text-[#211710] transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
