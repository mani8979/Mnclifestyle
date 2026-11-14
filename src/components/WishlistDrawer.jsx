import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, MessageCircle, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { formatINR } from '../utils/currency';
import { getWhatsAppInquiryUrl } from '../utils/whatsapp';

export default function WishlistDrawer() {
  const { isWishlistOpen, setIsWishlistOpen, wishlistProducts, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#211710]/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#F8F0E8] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-[#E9D8C5]">
        {/* Header */}
        <div className="p-6 border-b border-[#E9D8C5] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#D69A4B] fill-[#D69A4B]" />
            <div>
              <h2 className="text-xl font-serif font-medium text-[#211A15]">Curated Wishlist</h2>
              <p className="text-xs text-[#77736D] uppercase tracking-wider">
                {wishlistProducts.length} Saved {wishlistProducts.length === 1 ? 'Piece' : 'Pieces'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-2 text-[#77736D] hover:text-[#211A15] rounded-full hover:bg-[#F8F0E8] transition-colors"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {wishlistProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#E9D8C5]/50 flex items-center justify-center text-warmgrey mb-4">
              <Heart className="w-8 h-8 text-warmgrey" />
            </div>
            <h3 className="text-xl font-serif text-[#211A15] mb-1">Your wishlist is empty</h3>
            <p className="text-xs text-[#77736D] max-w-xs mb-6">
              Save your favorite architectural seating, dining tables, and bedroom suites to review anytime.
            </p>
            <button
              onClick={() => {
                setIsWishlistOpen(false);
                navigate('/shop');
              }}
              className="px-6 py-3 bg-[#211710] text-[#F8F0E8] text-xs uppercase tracking-widest font-semibold hover:bg-[#D69A4B] hover:text-[#211710] transition-colors rounded-lg"
            >
              Explore Collections
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-beige-200">
            {wishlistProducts.map((prod) => {
              const whatsappUrl = getWhatsAppInquiryUrl({
                product: prod,
                topic: 'Wishlist Item Enquiry'
              });

              return (
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
                    <span className="text-[10px] uppercase tracking-wider text-[#D69A4B] font-semibold">
                      {prod.categoryLabel}
                    </span>
                    <h4
                      onClick={() => {
                        setIsWishlistOpen(false);
                        navigate(`/product/${prod.id}`);
                      }}
                      className="text-sm font-serif font-medium text-[#211A15] hover:text-[#D69A4B] cursor-pointer truncate"
                    >
                      {prod.name}
                    </h4>
                    <p className="text-xs font-sans font-bold tabular-nums text-[#211A15] mt-1">
                      {formatINR(prod.price)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#25D366] text-white rounded text-xs font-semibold hover:bg-[#20ba5a] transition-colors flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span>Enquire</span>
                      </a>
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
              );
            })}
          </div>
        )}

        {/* Footer */}
        {wishlistProducts.length > 0 && (
          <div className="p-6 border-t border-[#E9D8C5] bg-white">
            <button
              onClick={() => {
                setIsWishlistOpen(false);
                navigate('/shop');
              }}
              className="w-full py-3 border border-[#211A15] text-[#211A15] hover:bg-[#211710] hover:text-[#F8F0E8] transition-colors rounded-lg text-xs font-medium uppercase tracking-widest text-center"
            >
              Continue Exploring Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
