import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistDrawer() {
  const { isWishlistOpen, setIsWishlistOpen, wishlistProducts, toggleWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-ivory-100 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-beige-300">
        {/* Header */}
        <div className="p-6 border-b border-beige-300 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-bronze fill-bronze" />
            <div>
              <h2 className="text-xl font-serif font-medium text-charcoal">Curated Wishlist</h2>
              <p className="text-xs text-warmgrey uppercase tracking-wider">
                {wishlistProducts.length} Saved {wishlistProducts.length === 1 ? 'Piece' : 'Pieces'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-2 text-warmgrey hover:text-charcoal rounded-full hover:bg-ivory transition-colors"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {wishlistProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-beige-200/70 flex items-center justify-center text-warmgrey mb-4">
              <Heart className="w-8 h-8 text-warmgrey" />
            </div>
            <h3 className="text-xl font-serif text-charcoal mb-1">Your wishlist is empty</h3>
            <p className="text-xs text-warmgrey max-w-xs mb-6">
              Save your favorite architectural seating, dining tables, and bedroom suites to review anytime.
            </p>
            <button
              onClick={() => {
                setIsWishlistOpen(false);
                navigate('/shop');
              }}
              className="px-6 py-3 bg-charcoal text-white text-xs uppercase tracking-widest font-medium hover:bg-bronze transition-colors rounded-lg"
            >
              Explore Collections
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-beige-200">
            {wishlistProducts.map((prod) => (
              <div key={prod.id} className="pt-4 first:pt-0 flex gap-4 items-center">
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  onClick={() => {
                    setIsWishlistOpen(false);
                    navigate(`/product/${prod.id}`);
                  }}
                  className="w-20 h-20 object-cover rounded-lg bg-beige-200 flex-shrink-0 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-bronze font-semibold">
                    {prod.categoryLabel}
                  </span>
                  <h4
                    onClick={() => {
                      setIsWishlistOpen(false);
                      navigate(`/product/${prod.id}`);
                    }}
                    className="text-sm font-serif font-medium text-charcoal hover:text-bronze cursor-pointer truncate"
                  >
                    {prod.name}
                  </h4>
                  <p className="text-xs font-semibold text-charcoal mt-1">
                    ${prod.price.toLocaleString()}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleMoveToCart(prod)}
                      className="px-3 py-1.5 bg-espresso text-white rounded text-xs font-medium hover:bg-bronze transition-colors flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                    <button
                      onClick={() => toggleWishlist(prod.id)}
                      className="p-1.5 text-warmgrey hover:text-red-700 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {wishlistProducts.length > 0 && (
          <div className="p-6 border-t border-beige-300 bg-white">
            <button
              onClick={() => {
                setIsWishlistOpen(false);
                navigate('/shop');
              }}
              className="w-full py-3 border border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors rounded-lg text-xs font-medium uppercase tracking-widest text-center"
            >
              Continue Exploring Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

