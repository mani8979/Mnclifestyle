import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductQuickViewModal from './ProductQuickViewModal';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isSaved = isInWishlist(product.id);
  const hasSecondaryImage = product.images && product.images.length > 1;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, selectedColor);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-beige-300/80 shadow-soft hover:shadow-luxury transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Badges & Quick Action Floating Buttons */}
      <div className="relative aspect-[4/3] bg-beige-100 overflow-hidden">
        {/* Main & Secondary Image Transition */}
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={isHovered && hasSecondaryImage ? product.images[1] : product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover luxury-image-zoom"
            loading="lazy"
          />
        </Link>

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="bg-espresso/85 backdrop-blur-sm text-ivory-100 text-[10px] font-sans uppercase tracking-widest px-2.5 py-1 rounded shadow-sm font-medium">
              {product.badge}
            </span>
          </div>
        )}

        {/* Wishlist Button (Min 44x44px touch area) */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] p-2.5 rounded-full transition-all duration-200 z-10 shadow-sm flex items-center justify-center ${
            isSaved
              ? 'bg-white text-bronze scale-105'
              : 'bg-white/80 backdrop-blur-sm text-charcoal hover:bg-white hover:text-bronze'
          }`}
          title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-bronze' : ''}`} />
        </button>

        {/* Desktop Quick Add Bar on Hover */}
        <div className="hidden lg:flex absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 items-center justify-between gap-2 z-10">
          <button
            onClick={handleQuickAdd}
            className={`flex-1 py-2 rounded text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5 shadow ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-charcoal hover:bg-bronze hover:text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsQuickViewOpen(true);
            }}
            className="p-2 bg-white/90 hover:bg-white text-charcoal rounded transition-colors"
            title="Quick View Piece"
            aria-label="Quick View Piece"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-bronze">
              {product.categoryLabel}
            </span>
            <div className="flex items-center text-warmgrey gap-1 text-[11px]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-lg font-medium text-charcoal leading-snug group-hover:text-bronze transition-colors">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>

          {/* Short Excerpt */}
          <p className="text-xs text-warmgrey mt-1.5 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Pricing, Color Swatches & Mobile Action */}
        <div className="pt-4 mt-3 border-t border-beige-200">
          {/* Color preview dots */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-[10px] text-warmgrey uppercase tracking-wider mr-1">Finishes:</span>
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedColor(color.name);
                  }}
                  title={color.name}
                  aria-label={`Select finish ${color.name}`}
                  className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                    selectedColor === color.name
                      ? 'ring-1 ring-offset-1 ring-bronze scale-110'
                      : 'border-black/20 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg sm:text-xl font-bold text-charcoal">
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-warmgrey/70 line-through">
                  ${product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Mobile / Tablet Quick Add Button (44px min touch area with visual feedback) */}
            <button
              onClick={handleQuickAdd}
              className={`lg:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center active:scale-95 shadow-2xs ${
                justAdded
                  ? 'bg-emerald-700 text-white'
                  : 'bg-beige-200 text-charcoal hover:bg-bronze hover:text-white'
              }`}
              title="Add to shopping bag"
              aria-label={`Add ${product.name} to shopping bag`}
            >
              {justAdded ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </button>

            {/* Desktop link */}
            <Link
              to={`/product/${product.id}`}
              className="hidden lg:inline-flex text-xs font-semibold text-charcoal/70 group-hover:text-bronze transition-colors items-center gap-1"
            >
              <span>Explore</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
}


