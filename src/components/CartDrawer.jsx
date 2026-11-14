import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, CheckCircle2, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import { getWhatsAppCartOrderUrl } from '../utils/whatsapp';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();
  const [checkoutRequested, setCheckoutRequested] = useState(false);
  const navigate = useNavigate();

  const whatsappCartOrderUrl = getWhatsAppCartOrderUrl(items, subtotal);

  if (!isCartOpen) return null;

  const handleCheckoutDemo = () => {
    setCheckoutRequested(true);
    setTimeout(() => {
      // Keep state for viewing confirmation
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          setIsCartOpen(false);
          setCheckoutRequested(false);
        }}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-ivory-100 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-beige-300">
        {/* Header */}
        <div className="p-6 border-b border-beige-300 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-serif font-medium text-charcoal">Your Selection</h2>
            <p className="text-xs text-warmgrey uppercase tracking-wider mt-0.5">
              {items.length} {items.length === 1 ? 'Design' : 'Designs'} Curated
            </p>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setCheckoutRequested(false);
            }}
            className="p-2 text-warmgrey hover:text-charcoal rounded-full hover:bg-ivory transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {checkoutRequested ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-bronze/10 text-bronze flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-semibold text-charcoal mb-2">
              Concierge Inquiry Prepared
            </h3>
            <p className="text-sm text-warmgrey max-w-xs mb-6">
              Thank you for exploring MNC Lifestyle. In keeping with our bespoke service, an interior concierge specialist coordinates order fulfillment, custom fabrics, and white-glove scheduling directly.
            </p>
            <div className="bg-white p-4 rounded-xl border border-beige-300 w-full mb-6 text-left text-xs space-y-1.5 text-charcoal-700">
              <div className="flex justify-between font-medium">
                <span>Estimated Valuation:</span>
                <span className="font-sans font-bold tabular-nums">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-warmgrey">
                <span>Complimentary Delivery:</span>
                <span className="text-emerald-700 font-medium">Included</span>
              </div>
              <div className="flex justify-between text-warmgrey">
                <span>Showroom Consultation:</span>
                <span>Available Upon Request</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <a
                href={whatsappCartOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs uppercase tracking-widest font-bold hover:shadow-md transition-all rounded-xl flex items-center justify-center gap-2 text-center"
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>Send Order via WhatsApp</span>
              </a>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setCheckoutRequested(false);
                  navigate('/contact');
                }}
                className="w-full py-2.5 bg-[#211710] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#D69A4B] hover:text-[#211710] transition-colors rounded-xl"
              >
                Connect With a Design Specialist
              </button>
              <button
                onClick={() => setCheckoutRequested(false)}
                className="w-full py-2 text-xs text-warmgrey hover:text-charcoal font-medium"
              >
                Back to Selection
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-beige-200/70 flex items-center justify-center text-warmgrey mb-4">
              <Truck className="w-8 h-8 text-bronze" />
            </div>
            <h3 className="text-xl font-serif text-charcoal mb-1">Your bag is empty</h3>
            <p className="text-xs text-warmgrey max-w-xs mb-6">
              Explore our curated living, bedroom, dining, and office collections to furnish your sanctuary.
            </p>
            <button
              onClick={() => {
                setIsCartOpen(false);
                navigate('/shop');
              }}
              className="px-6 py-3 bg-charcoal text-white text-xs uppercase tracking-widest font-medium hover:bg-bronze transition-colors rounded-lg"
            >
              Discover Furniture
            </button>
          </div>
        ) : (
          <>
            {/* Free Shipping Tier */}
            <div className="bg-beige-100/60 px-6 py-2.5 border-b border-beige-300 flex items-center gap-2 text-xs text-charcoal">
              <ShieldCheck className="w-4 h-4 text-bronze flex-shrink-0" />
              <span>Includes <strong>White-Glove Placement</strong> & Inspection</span>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-beige-200">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.selectedColor}`} className="pt-4 first:pt-0 flex gap-4">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg bg-beige-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate(`/product/${item.product.id}`);
                        }}
                        className="text-sm font-serif font-medium text-charcoal hover:text-bronze cursor-pointer truncate"
                      >
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                        className="p-1 text-warmgrey hover:text-red-700 transition-colors ml-2"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-warmgrey mt-0.5">Finish: {item.selectedColor}</p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-beige-300 rounded bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedColor, -1)}
                          className="p-1 text-charcoal hover:bg-beige-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-medium text-charcoal">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedColor, 1)}
                          className="p-1 text-charcoal hover:bg-beige-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-sans font-bold tabular-nums text-charcoal">
                        {formatINR(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / Summary */}
            <div className="p-6 border-t border-beige-300 bg-white space-y-4">
              <div className="space-y-1.5 text-xs text-warmgrey">
                <div className="flex justify-between text-sm text-charcoal font-medium">
                  <span>Subtotal</span>
                  <span className="text-base font-sans font-bold tabular-nums text-charcoal">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>White Glove Delivery</span>
                  <span className="text-emerald-700 font-medium">Complimentary</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax & In-Home Assembly</span>
                  <span>Calculated upon confirmation</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={whatsappCartOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99] text-center"
                  title="Order Selection on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                  <span>ORDER VIA WHATSAPP ({formatINR(subtotal)})</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/contact');
                  }}
                  className="w-full py-2.5 bg-white hover:bg-[#F8F0E8] text-[#211710] border border-[#E9D8C5] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-center"
                >
                  Request Showroom Consultation
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="w-full py-1 text-center text-xs text-warmgrey hover:text-charcoal font-medium"
                >
                  Continue Browsing Collections
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

