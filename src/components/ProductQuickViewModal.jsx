import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ArrowRight, Heart, MessageCircle } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { formatINR, calculateDiscount } from '../utils/currency';
import { getWhatsAppOrderUrl, getWhatsAppInquiryUrl } from '../utils/whatsapp';

export default function ProductQuickViewModal({ product, isOpen, onClose }) {
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!isOpen || !product) return null;

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0]?.name || 'Standard'
  );
  const [quantity, setQuantity] = useState(1);

  const isSaved = isInWishlist(product.id);
  const discount = calculateDiscount(product.price, product.originalPrice);

  const whatsappOrderUrl = getWhatsAppOrderUrl({
    product,
    selectedColor,
    quantity
  });

  const whatsappInquiryUrl = getWhatsAppInquiryUrl({
    product,
    topic: 'Quick View Spec Inquiry'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#211710]/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-[#F8F0E8] rounded-3xl shadow-elevated border border-[#E9D8C5] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-charcoal hover:text-bronze bg-white/80 backdrop-blur-sm rounded-full transition-colors shadow-sm"
          aria-label="Close Quick View"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          
          {/* Left Column: Gallery */}
          <div className="p-6 md:p-8 bg-beige-200/50 flex flex-col justify-between">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-beige-300 shadow-soft mb-4">
              <img
                src={product.images[activeImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.badge && (
                  <span className="bg-[#211710]/85 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded">
                    {product.badge}
                  </span>
                )}
                {discount && (
                  <span className="bg-[#D69A4B] text-[#211710] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                    {discount}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === idx
                        ? 'border-bronze scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-bronze font-semibold">
                  {product.categoryLabel} — {product.subCategory}
                </span>
                <div className="flex items-center gap-1 text-xs text-warmgrey">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                </div>
              </div>

              <h3 className="font-serif text-2xl font-medium text-charcoal mb-2">
                {product.name}
              </h3>

              <div className="flex items-baseline gap-2.5 mb-4">
                <span className="font-serif text-2xl font-bold text-charcoal">
                  {formatINR(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-warmgrey line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
                <span className="text-[11px] text-[#49301F] font-medium ml-1">
                  (Incl. In-Home Assembly)
                </span>
              </div>

              <p className="text-xs text-warmgrey leading-relaxed mb-6 font-sans">
                {product.shortDescription}
              </p>

              {/* Finishes */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-wider text-charcoal font-semibold block mb-2">
                    Selected Finish: <span className="text-bronze font-normal">{selectedColor}</span>
                  </span>
                  <div className="flex gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${
                          selectedColor === c.name
                            ? 'border-bronze bg-beige-100 ring-1 ring-bronze'
                            : 'border-beige-300 hover:border-charcoal/40'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[11px] font-medium">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Direct WhatsApp Order */}
            <div className="space-y-3 pt-4 border-t border-beige-200">
              <div className="flex gap-3">
                <div className="flex items-center border border-beige-300 rounded-lg bg-ivory px-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-charcoal hover:text-bronze font-bold text-sm"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 text-charcoal hover:text-bronze font-bold text-sm"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                
                {/* Primary WhatsApp Order Button */}
                <a
                  href={whatsappOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Order on WhatsApp</span>
                </a>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="text-xs text-warmgrey hover:text-bronze flex items-center gap-1 font-medium"
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-bronze text-bronze' : ''}`} />
                  <span>{isSaved ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                </button>
                <Link
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  className="text-xs font-semibold text-bronze hover:text-bronze-dark flex items-center gap-1"
                >
                  <span>Full Specifications & Measurements</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
