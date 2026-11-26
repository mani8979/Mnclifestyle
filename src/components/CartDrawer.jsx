'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/lib/router-bridge';
import { X, ShoppingBag, Trash2, Minus, Plus } from 'lucide-react';
import WhatsAppIcon from './shared/WhatsAppIcon';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import { getWhatsAppCartOrderUrl } from '../utils/whatsapp';
import { getSafeImageSrc, shouldUnoptimizeImage } from '../utils/image';

export default function CartDrawer() {
  const {
    items,
    totalItems,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    notification,
    setNotification,
  } = useCart();

  return (
    <>
      {/* Subtle Cart Toast Notification */}
      {notification && !isCartOpen && (
        <div
          data-testid="cart-toast"
          className="fixed bottom-20 right-4 z-50 max-w-sm bg-[#211710] text-white rounded-2xl p-3.5 shadow-2xl border border-[#49301F] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {notification.image && (
            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-white/10 shrink-0">
              <Image
                src={getSafeImageSrc(notification.image)}
                alt={notification.title}
                fill
                unoptimized={shouldUnoptimizeImage(getSafeImageSrc(notification.image))}
                sizes="44px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#D69A4B] truncate">{notification.title}</p>
            <p className="text-[11px] text-[#E9D8C5] line-clamp-2">{notification.message}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setNotification(null);
                setIsCartOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#D69A4B] text-[#211710] text-[11px] font-bold cursor-pointer"
            >
              View Bag
            </button>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="p-1 text-[#C9BBAE] hover:text-white cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Slide-over Bag Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#211710]/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-[#E9D8C5]"
            data-testid="cart-drawer"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#E9D8C5] bg-[#F8F0E8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#D69A4B]" />
                <h2 className="font-serif text-lg font-medium text-[#211710]">
                  Your Selection ({totalItems})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-[#766B61] hover:text-[#211710] hover:bg-black/5 cursor-pointer"
                aria-label="Close bag drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 text-[#C9BBAE] mx-auto" />
                  <p className="font-serif text-lg text-[#211710]">Your selection bag is empty</p>
                  <p className="text-xs text-[#766B61]">
                    Explore our handcrafted pieces and select your preferred colour finishes.
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const pid = item.product.id || item.product._id;
                  const imgSrc = getSafeImageSrc(item.product.images?.[0]);
                  return (
                    <div
                      key={`${pid}-${item.selectedColor}`}
                      data-testid="cart-item"
                      data-product-id={pid}
                      data-color={item.selectedColor}
                      className="flex gap-3.5 p-3 rounded-2xl border border-[#E9D8C5] bg-[#F8F0E8]/35"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-[#E9D8C5] shrink-0">
                        <Image
                          src={imgSrc}
                          alt={item.product.name}
                          fill
                          unoptimized={shouldUnoptimizeImage(imgSrc)}
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-xs font-semibold text-[#211710] hover:text-[#D69A4B] line-clamp-1 block"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-[11px] text-[#766B61] mt-0.5">
                          Colour: <strong className="text-[#211710]">{item.selectedColor}</strong>
                        </p>
                        <p className="text-xs font-bold text-[#211710] font-sans tabular-nums mt-1">
                          {formatINR(item.product.price)}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="inline-flex items-center border border-[#E9D8C5] rounded-lg bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(pid, item.selectedColor, -1)}
                              className="p-1 text-[#211710] hover:text-[#D69A4B] cursor-pointer"
                              aria-label="Decrease cart quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-semibold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(pid, item.selectedColor, 1)}
                              className="p-1 text-[#211710] hover:text-[#D69A4B] cursor-pointer"
                              aria-label="Increase cart quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(pid, item.selectedColor)}
                            className="p-1.5 text-[#766B61] hover:text-red-600 cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-[#E9D8C5] bg-[#F8F0E8]/60 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#766B61] font-medium">Estimated Subtotal</span>
                  <span className="font-bold text-[#211710] font-sans tabular-nums text-base">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E9D8C5] bg-white text-xs font-semibold text-[#766B61] hover:text-[#211710] cursor-pointer"
                  >
                    Clear
                  </button>
                  <a
                    href={getWhatsAppCartOrderUrl(items, subtotal)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#169E49] hover:bg-[#12833C] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs whitespace-nowrap"
                  >
                    <WhatsAppIcon className="w-4 h-4 shrink-0" />
                    <span>Order via WhatsApp</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
