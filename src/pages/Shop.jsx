import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { Filter, SlidersHorizontal, Search, RotateCcw, Sparkles } from 'lucide-react';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState('featured');
  const [priceRange, setPriceRange] = useState(5000);
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
          const matchMat = p.materials.some((m) => m.toLowerCase().includes(q));
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
    setPriceRange(5000);
    setFilterBadge('all');
    setSearchTerm('');
    setSearchParams({});
  };

  const isFiltered =
    selectedCategory !== 'all' ||
    selectedSort !== 'featured' ||
    priceRange < 5000 ||
    filterBadge !== 'all' ||
    searchTerm.trim() !== '';

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-warmgrey mb-6">
          <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">Furniture Catalog</span>
        </div>

        {/* Page Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-bronze font-semibold block mb-2">
            The Complete Collection
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal font-normal tracking-tight">
            Furniture & Living Solutions
          </h1>
          <p className="mt-3 text-sm sm:text-base text-warmgrey leading-relaxed">
            Every piece is made to order or crafted in small limited editions using authentic white oak, solid walnut, Belgian bouclé, and Roman travertine.
          </p>
        </div>

        {/* Filter Navigation Bar */}
        <div className="bg-white rounded-2xl p-6 border border-beige-300 shadow-soft mb-10 space-y-6">
          
          {/* Top row: Category Pills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-charcoal font-semibold flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-bronze" />
                <span>Rooms & Categories</span>
              </span>
              {isFiltered && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-bronze hover:text-bronze-dark font-medium flex items-center gap-1 underline underline-offset-4"
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
                    ? 'bg-espresso text-white shadow-sm'
                    : 'bg-ivory text-charcoal-700 hover:bg-beige-200 border border-beige-300'
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
                      ? 'bg-espresso text-white shadow-sm'
                      : 'bg-ivory text-charcoal-700 hover:bg-beige-200 border border-beige-300'
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
                  placeholder="e.g. Bouclé, Travertine..."
                  className="w-full bg-ivory/60 border border-beige-300 rounded-lg pl-9 pr-3 py-2 text-xs text-charcoal placeholder:text-warmgrey focus:outline-none focus:border-bronze"
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
                className="w-full bg-ivory/60 border border-beige-300 rounded-lg px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-bronze"
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
                  Up to ${priceRange.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-bronze cursor-pointer"
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
                className="w-full bg-ivory/60 border border-beige-300 rounded-lg px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-bronze"
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
            Showing <strong className="text-charcoal">{filteredProducts.length}</strong> of{' '}
            {products.length} architectural furniture designs
          </p>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-bronze">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complimentary In-Home Assembly Included</span>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-beige-300 p-8">
            <h3 className="font-serif text-2xl text-charcoal mb-2">No furniture pieces match your selection</h3>
            <p className="text-sm text-warmgrey max-w-md mx-auto mb-6">
              Try adjusting your price threshold, keyword search, or clearing selected category filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-3 bg-charcoal text-white text-xs uppercase tracking-widest rounded-lg hover:bg-bronze transition-colors"
            >
              Reset Filters
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
