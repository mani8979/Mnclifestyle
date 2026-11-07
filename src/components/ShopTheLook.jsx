import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowRight, X, Sparkles } from 'lucide-react';

export default function ShopTheLook() {
  const { addToCart, setIsCartOpen } = useCart();
  const [activePin, setActivePin] = useState('mnc-liv-01');

  // Hotspots definitions on the photograph
  const hotspots = [
    {
      productId: 'mnc-liv-01',
      x: '52%',
      y: '58%',
      label: 'Aura Curved Sofa',
    },
    {
      productId: 'mnc-cof-01',
      x: '42%',
      y: '78%',
      label: 'Kanso Travertine Table',
    },
    {
      productId: 'mnc-liv-02',
      x: '18%',
      y: '65%',
      label: 'Soren Lounge Chair',
    },
  ];

  const activeProduct = products.find((p) => p.id === activePin) || products[0];

  const handleQuickAdd = (product) => {
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-[0.25em] text-bronze font-semibold block mb-2">
          Curated Atmospheres
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal tracking-tight">
          Shop The Living Room Suite
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-warmgrey">
          Hover or tap on any pinpoint to explore the individual architectural pieces composing this space.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-4 sm:p-8 border border-beige-300 shadow-soft">
        
        {/* Hotspot Interactive Image Container */}
        <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-beige-200">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85"
            alt="MNC Lifestyle Penthouse Living Room"
            className="w-full h-full object-cover brightness-95"
          />

          {/* Hotspot Pins */}
          {hotspots.map((pin) => {
            const isSelected = activePin === pin.productId;
            return (
              <div
                key={pin.productId}
                style={{ top: pin.y, left: pin.x }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <button
                  onClick={() => setActivePin(pin.productId)}
                  aria-label={`View ${pin.label}`}
                  className={`group relative flex items-center justify-center transition-transform ${
                    isSelected ? 'scale-125' : 'hover:scale-115'
                  }`}
                >
                  {/* Outer pulse wave */}
                  <span
                    className={`absolute w-8 h-8 rounded-full transition-opacity ${
                      isSelected
                        ? 'bg-bronze/40 animate-ping'
                        : 'bg-white/40 group-hover:bg-bronze/30 animate-pulse'
                    }`}
                  />
                  {/* Center pin disc */}
                  <span
                    className={`relative w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md transition-colors ${
                      isSelected
                        ? 'bg-espresso text-white ring-2 ring-bronze'
                        : 'bg-white text-charcoal group-hover:bg-bronze group-hover:text-white'
                    }`}
                  >
                    +
                  </span>
                </button>
              </div>
            );
          })}

          {/* Compact Mobile Product Information Overlay (Mobile & Tablet only) */}
          <div className="lg:hidden absolute bottom-3 inset-x-3 sm:inset-x-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-elevated border border-beige-300 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-3">
              <img
                src={activeProduct.images[0]}
                alt={activeProduct.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-beige-200 border border-beige-300 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-bronze font-semibold block truncate">
                  {activeProduct.categoryLabel}
                </span>
                <h4 className="font-serif text-sm sm:text-base font-medium text-charcoal truncate">
                  {activeProduct.name}
                </h4>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-serif text-sm sm:text-base font-bold text-charcoal">
                    ${activeProduct.price.toLocaleString()}
                  </span>
                  {activeProduct.originalPrice && (
                    <span className="text-[11px] text-warmgrey line-through">
                      ${activeProduct.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
                <button
                  onClick={() => handleQuickAdd(activeProduct)}
                  className="px-3 py-2 bg-espresso text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-bronze transition-colors flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px]"
                  aria-label={`Add ${activeProduct.name} to shopping bag`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </button>
                <Link
                  to={`/product/${activeProduct.id}`}
                  className="text-[10px] text-charcoal/80 hover:text-bronze font-medium underline underline-offset-2 pr-1"
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Product Card Side Panel */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="bg-ivory/60 rounded-2xl p-6 border border-beige-300">
            <span className="text-[10px] uppercase tracking-widest text-bronze font-semibold block mb-1">
              Active Selection
            </span>
            
            <div className="flex gap-4 items-center mb-4">
              <img
                src={activeProduct.images[0]}
                alt={activeProduct.name}
                className="w-20 h-20 rounded-xl object-cover bg-beige-200 border border-beige-300 flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-warmgrey">
                  {activeProduct.categoryLabel}
                </span>
                <h4 className="font-serif text-lg font-medium text-charcoal leading-snug truncate">
                  {activeProduct.name}
                </h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-serif text-base font-bold text-charcoal">
                    ${activeProduct.price.toLocaleString()}
                  </span>
                  {activeProduct.originalPrice && (
                    <span className="text-xs text-warmgrey line-through">
                      ${activeProduct.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-warmgrey leading-relaxed mb-6 font-sans line-clamp-3">
              {activeProduct.shortDescription}
            </p>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => handleQuickAdd(activeProduct)}
                className="w-full py-3 bg-espresso text-white rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-bronze transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Shopping Bag</span>
              </button>
              <Link
                to={`/product/${activeProduct.id}`}
                className="w-full py-2.5 bg-white border border-beige-300 text-charcoal rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-beige-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Full Specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Hotspot Selectors on Mobile/Tablet */}
          <div className="mt-4 pt-4 border-t border-beige-200">
            <span className="text-[11px] uppercase tracking-wider text-warmgrey block mb-2">
              Pieces in this room:
            </span>
            <div className="flex flex-wrap gap-2">
              {hotspots.map((pin) => {
                const prod = products.find((p) => p.id === pin.productId);
                const isSelected = activePin === pin.productId;
                return (
                  <button
                    key={pin.productId}
                    onClick={() => setActivePin(pin.productId)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      isSelected
                        ? 'bg-charcoal text-white border-charcoal'
                        : 'bg-white text-warmgrey border-beige-300 hover:text-charcoal'
                    }`}
                  >
                    {prod?.name || pin.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

