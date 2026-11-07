import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import SwatchModal from '../components/SwatchModal';
import { businessConfig } from '../data/businessConfig';
import {
  Heart,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  Check,
  Ruler,
  Layers,
  Sparkles,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const product = products.find((p) => p.id === id);

  if (!product) {
    return <Navigate to="/shop" replace />;
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0]?.name || 'Standard'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('dimensions');
  const [isSwatchOpen, setIsSwatchOpen] = useState(false);

  const isSaved = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor);
    setIsCartOpen(true);
  };

  const handleRequestSample = () => {
    setIsSwatchOpen(true);
  };

  // Related products from same category or complementary
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="py-8 sm:py-14 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-warmgrey mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-charcoal transition-colors">Furniture</Link>
          <span>/</span>
          <Link to={`/category/${product.category}`} className="hover:text-charcoal transition-colors">
            {product.categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-charcoal font-medium truncate">{product.name}</span>
        </nav>

        {/* Top Product View: Gallery + Purchasing Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-20">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Active Image with Zoom effect */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-beige-200 border border-beige-300 shadow-soft">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={`${product.name} - Angle ${activeImageIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-500"
              />

              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span className="bg-espresso/90 backdrop-blur-sm text-ivory-100 text-xs uppercase tracking-widest px-3 py-1 rounded font-medium shadow-sm">
                    {product.badge}
                  </span>
                </div>
              )}

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md transition-all ${
                  isSaved
                    ? 'bg-white text-bronze scale-105'
                    : 'bg-white/80 backdrop-blur-sm text-charcoal hover:bg-white hover:text-bronze'
                }`}
                aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-bronze' : ''}`} />
              </button>
            </div>

            {/* Thumbnail selector row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-bronze shadow-sm scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover bg-beige-200"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Specifications & Purchasing */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            
            {/* Category & Rating */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-bronze">
                {product.categoryLabel} — {product.subCategory}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-warmgrey">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-charcoal">{product.rating}</span>
                <span>({product.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-medium leading-tight mb-2">
              {product.name}
            </h1>

            {/* SKU and Stock status */}
            <div className="flex items-center gap-3 text-xs text-warmgrey mb-4">
              <span>SKU: {product.sku}</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">In Stock for White-Glove Placement</span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-beige-300">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-base text-warmgrey line-through">
                  ${product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-xs text-warmgrey">USD (Includes In-Home Assembly)</span>
            </div>

            {/* Short Narrative */}
            <p className="text-xs sm:text-sm text-warmgrey leading-relaxed mb-6 font-sans">
              {product.shortDescription}
            </p>

            {/* Color / Finish Swatch Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs uppercase tracking-wider text-charcoal font-semibold">
                    Finish / Fabric:
                  </span>
                  <span className="text-xs text-bronze font-medium">{selectedColor}</span>
                </div>
                <div className="flex gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        selectedColor === c.name
                          ? 'border-bronze bg-beige-100 text-charcoal ring-1 ring-bronze'
                          : 'border-beige-300 bg-white text-warmgrey hover:border-charcoal/40'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2 mb-8">
              <div className="flex gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-beige-300 rounded-lg bg-white px-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-charcoal hover:text-bronze transition-colors text-sm font-bold"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-semibold text-charcoal">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-charcoal hover:text-bronze transition-colors text-sm font-bold"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-espresso text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-bronze transition-colors flex items-center justify-center gap-2 shadow-soft"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Selection</span>
                </button>
              </div>

              {/* Swatch sample / inquiry buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleRequestSample}
                  className="flex-1 py-2.5 bg-white border border-beige-300 text-charcoal hover:bg-beige-100 rounded-lg text-xs font-medium transition-colors"
                >
                  {sampleRequested ? '✓ Complimentary Swatch Box Requested' : 'Order Complimentary Swatch Kit'}
                </button>
                <Link
                  to="/contact"
                  className="px-4 py-2.5 bg-white border border-beige-300 text-charcoal hover:bg-beige-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Ask a Design Specialist"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-bronze" />
                  <span>Design Inquiry</span>
                </Link>
              </div>
            </div>

            {/* Value Guarantees List */}
            <div className="border-t border-beige-300 pt-5 space-y-2.5 text-xs text-charcoal">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-bronze flex-shrink-0" />
                <span>{product.leadTime}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-bronze flex-shrink-0" />
                <span>{product.warranty}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-bronze flex-shrink-0" />
                <span>{businessConfig.sustainability.claim}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Tabs: Dimensions, Materials, Care, Delivery */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-beige-300 shadow-soft mb-24">
          <div className="flex flex-wrap border-b border-beige-300 pb-4 gap-4 sm:gap-8">
            <button
              onClick={() => setActiveTab('dimensions')}
              className={`text-xs uppercase tracking-widest font-semibold pb-2 border-b-2 transition-all ${
                activeTab === 'dimensions'
                  ? 'border-bronze text-charcoal'
                  : 'border-transparent text-warmgrey hover:text-charcoal'
              }`}
            >
              Dimensions & Specifications
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`text-xs uppercase tracking-widest font-semibold pb-2 border-b-2 transition-all ${
                activeTab === 'materials'
                  ? 'border-bronze text-charcoal'
                  : 'border-transparent text-warmgrey hover:text-charcoal'
              }`}
            >
              Materials & Craftsmanship
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`text-xs uppercase tracking-widest font-semibold pb-2 border-b-2 transition-all ${
                activeTab === 'care'
                  ? 'border-bronze text-charcoal'
                  : 'border-transparent text-warmgrey hover:text-charcoal'
              }`}
            >
              Care & Maintenance
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`text-xs uppercase tracking-widest font-semibold pb-2 border-b-2 transition-all ${
                activeTab === 'delivery'
                  ? 'border-bronze text-charcoal'
                  : 'border-transparent text-warmgrey hover:text-charcoal'
              }`}
            >
              White-Glove In-Home Service
            </button>
          </div>

          <div className="pt-6">
            {activeTab === 'dimensions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h4 className="font-serif text-xl text-charcoal font-medium">Architectural Measurements</h4>
                  <p className="text-xs sm:text-sm text-warmgrey leading-relaxed">
                    Accurately measured to ensure effortless movement through doorways, corridors, and freight elevators.
                  </p>
                  <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs border-t border-beige-200 pt-3">
                    {Object.entries(product.dimensions).map(([key, value]) => (
                      <div key={key}>
                        <dt className="uppercase tracking-wider text-warmgrey text-[10px] capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </dt>
                        <dd className="font-semibold text-charcoal mt-0.5">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="bg-ivory p-6 rounded-2xl border border-beige-300 text-xs text-warmgrey space-y-2">
                  <span className="font-semibold uppercase tracking-wider text-charcoal block text-[11px]">
                    Placement & Fitting Advice:
                  </span>
                  <p>
                    We recommend leaving at least 45 cm (18 in) of clearance around this piece for natural circulation. Need custom dimensions? Our studio accommodates bespoke length adjustments for residential residences.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="space-y-4 max-w-3xl">
                <h4 className="font-serif text-xl text-charcoal font-medium">Authentic Material Integrity</h4>
                <p className="text-xs sm:text-sm text-warmgrey leading-relaxed">
                  {product.fullDescription}
                </p>
                <div className="pt-4 border-t border-beige-200">
                  <h5 className="text-xs uppercase tracking-wider text-charcoal font-semibold mb-3">
                    Master Components:
                  </h5>
                  <ul className="space-y-2 text-xs sm:text-sm text-charcoal-700">
                    {product.materials.map((mat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-bronze flex-shrink-0 mt-0.5" />
                        <span>{mat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-warmgrey leading-relaxed">
                <h4 className="font-serif text-xl text-charcoal font-medium">Preserving Enduring Beauty</h4>
                <p>
                  Fine furniture develops character with age when treated with attentive care. To preserve the natural grain and textile resilience:
                </p>
                <ul className="space-y-2 text-charcoal-700 list-disc list-inside">
                  <li>Dust solid wood surfaces weekly using a dry, lint-free microfiber cloth along the wood grain.</li>
                  <li>Avoid direct exposure to prolonged intense sunlight or positioning adjacent to high-heat radiator vents.</li>
                  <li>Clean spills promptly with a clean, slightly damp cotton cloth without chemical detergents.</li>
                  <li>For bouclé and wool fabrics, gently vacuum with a soft brush attachment on low suction.</li>
                </ul>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-warmgrey leading-relaxed">
                <h4 className="font-serif text-xl text-charcoal font-medium">The White-Glove Standard</h4>
                <p>
                  Every piece ordered through MNC Lifestyle receives our premium white-glove treatment at zero additional cost:
                </p>
                <ul className="space-y-2 text-charcoal-700 list-disc list-inside">
                  <li>Pre-scheduled delivery window coordinated by your dedicated client concierge.</li>
                  <li>Two-person uniformed team places the furniture in your designated room of choice.</li>
                  <li>Complete assembly, leveling, and structural inspection performed on-site.</li>
                  <li>All protective wooden crating and packing materials are removed and responsibly recycled.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Furniture / "Complete the Look" */}
        {relatedProducts.length > 0 && (
          <div>
            <SectionHeading
              subtitle="Cohesive Arrangements"
              title="You May Also Admire"
              description="Complementary furniture pieces designed with matching timber finishes and shared aesthetic restraint."
              align="left"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Swatch Order Modal */}
        <SwatchModal isOpen={isSwatchOpen} onClose={() => setIsSwatchOpen(false)} />

        {/* Mobile Sticky Action Bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-beige-300 p-3.5 z-40 shadow-elevated flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-bronze block truncate font-semibold">
              {product.name}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-lg font-bold text-charcoal">
                ${product.price.toLocaleString()}
              </span>
              <span className="text-[10px] text-warmgrey">White-Glove</span>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="px-5 py-3 bg-espresso text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-bronze transition-colors flex items-center gap-2 flex-shrink-0 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Bag</span>
          </button>
        </div>

      </div>
    </div>
  );
}

