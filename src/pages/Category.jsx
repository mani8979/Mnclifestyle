import React, { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Category() {
  const { categoryId } = useParams();
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [sortOption, setSortOption] = useState('featured');

  // Reset subcategory selection when route parameter changes
  React.useEffect(() => {
    setSelectedSubcategory('all');
  }, [categoryId]);

  const category = categories.find((c) => c.id === categoryId);

  // If category does not exist, redirect to shop
  if (!category) {
    return <Navigate to="/shop" replace />;
  }

  // Filter products for this category
  const categoryProducts = useMemo(() => {
    let prods = products.filter((p) => p.category === categoryId);

    if (selectedSubcategory !== 'all') {
      prods = prods.filter((p) => p.subCategory === selectedSubcategory);
    }

    return prods.sort((a, b) => {
      if (sortOption === 'price-low') return a.price - b.price;
      if (sortOption === 'price-high') return b.price - a.price;
      if (sortOption === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [categoryId, selectedSubcategory, sortOption]);

  const otherCategories = categories.filter((c) => c.id !== categoryId).slice(0, 3);

  return (
    <div className="pb-24">
      {/* Category Hero Banner */}
      <div className="relative min-h-[45vh] lg:min-h-[50vh] flex items-center justify-center overflow-hidden bg-espresso">
        <img
          src={category.image}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/50 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center space-x-2 text-xs text-ivory-200/80 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-white transition-colors">Categories</Link>
            <span>/</span>
            <span className="text-bronze-light font-medium">{category.name}</span>
          </div>

          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-bronze-light block mb-2">
            {category.tagline}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight mb-4">
            {category.title}
          </h1>
          <p className="text-sm sm:text-base text-ivory-200/90 max-w-2xl mx-auto leading-relaxed font-sans">
            {category.description}
          </p>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-ivory-200/80">
            <span>{categoryProducts.length} Curated Designs</span>
            <span>•</span>
            <span>White-Glove Delivery</span>
            <span>•</span>
            <span>10-Yr Warranty</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* Subcategory Navigation & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-8 border-b border-beige-300">
          {/* Subcategory Pills */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-colors ${selectedSubcategory === 'all'
                  ? 'bg-espresso text-white'
                  : 'bg-white text-charcoal hover:bg-beige-200 border border-beige-300'
                }`}
            >
              All {category.name}
            </button>
            {category.subcategories?.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-colors ${selectedSubcategory === sub
                    ? 'bg-espresso text-white'
                    : 'bg-white text-charcoal hover:bg-beige-200 border border-beige-300'
                  }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-auto flex items-center justify-end gap-2 text-xs">
            <span className="text-warmgrey uppercase tracking-wider font-medium">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-white border border-beige-300 rounded-lg px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:border-bronze"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {categoryProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-beige-300 p-8 my-8">
            <h3 className="font-serif text-xl text-charcoal mb-2">
              No designs found in this subcategory
            </h3>
            <p className="text-xs text-warmgrey mb-4">
              Switch back to all {category.name.toLowerCase()} pieces or browse our complete catalog.
            </p>
            <button
              onClick={() => setSelectedSubcategory('all')}
              className="px-4 py-2 bg-espresso text-white rounded text-xs uppercase tracking-wider"
            >
              View All {category.name}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Editorial Room Styling Guide Callout */}
        <div className="mt-20 p-8 sm:p-12 bg-beige-200/60 rounded-3xl border border-beige-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <span className="text-xs uppercase tracking-[0.25em] text-bronze font-semibold block mb-2">
                Designer's Perspective
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-charcoal font-medium mb-3">
                Styling Your {category.name} Sanctuary
              </h3>
              <p className="text-xs sm:text-sm text-warmgrey leading-relaxed font-sans max-w-2xl">
                When curating {category.name.toLowerCase()} arrangements, begin with anchoring proportions. Pair low-profile seating with organic stone centerpiece tables to maintain an open horizontal sightline. Layer textured bouclé and linen fabrics against solid quarter-sawn oak to balance tactile warmth with architectural poise.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-charcoal font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-bronze" /> Natural Timber & Honest Joinery
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-bronze" /> Ergonomically Tuned Proportions
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-bronze" /> Scalable to Your Architectural Floorplan
                </span>
              </div>
            </div>

            <div className="text-left lg:text-right">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-espresso text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-bronze transition-colors shadow-soft"
              >
                <span>Request Space Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Explore Other Rooms */}
        <div className="mt-24">
          <SectionHeading
            subtitle="Complete Your Residence"
            title="Explore Other Rooms"
            description="Discover cohesive furniture systems crafted to harmonize across adjacent spaces."
            align="left"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {otherCategories.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.id}`}
                className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-beige-200 block shadow-soft"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover luxury-image-zoom brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[10px] uppercase tracking-widest text-bronze-light">Room Collection</span>
                  <h4 className="font-serif text-xl text-white group-hover:text-bronze-light transition-colors">
                    {c.name}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-ivory-200 mt-1">
                    <span>Explore &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
