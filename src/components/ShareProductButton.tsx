'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Share2, Check, Copy, X, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import WhatsAppIcon from './shared/WhatsAppIcon';
import { formatINR } from '@/utils/currency';
import { slugify } from '@/lib/validations/product';
import { getSafeImageSrc } from '@/utils/image';

interface ShareProductButtonProps {
  product: {
    name: string;
    slug?: string;
    id?: string;
    legacyId?: string;
    price?: number;
    images?: string[];
    shortDescription?: string;
    category?: string;
    categoryLabel?: string;
  };
  variant?: 'button' | 'icon' | 'card';
  className?: string;
  label?: string;
}

export default function ShareProductButton({
  product,
  variant = 'button',
  className = '',
  label = 'Share Product',
}: ShareProductButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Generate canonical production product URL and share data
  const getProductShareData = useCallback(() => {
    const slug = product?.slug || slugify(product?.name || '');
    // Always use official production canonical URL for shared links (never localhost or staging)
    const productionOrigin = 'https://mnclifestyle-liard.vercel.app';
    const url = `${productionOrigin}/product/${slug}`;
    const title = `${product?.name || 'Furniture Piece'} | MNC LifeStyle`;
    const text = `Discover ${product?.name || 'this piece'} at MNC LifeStyle. Explore this luxury furniture piece and enquire directly with us.`;

    return { title, text, url };
  }, [product]);

  // Handle Share click
  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { title, text, url } = getProductShareData();

    // Check for native Web Share API support
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        // Native share succeeded or completed
        return;
      } catch (err: any) {
        // If user cancelled / dismissed the native share sheet, do not show error or popup
        if (err?.name === 'AbortError') {
          return;
        }
        // If native share failed for any other reason, gracefully fall back to popup modal
        setShowModal(true);
      }
    } else {
      // Fallback for browsers / environments without navigator.share (e.g. desktop browsers)
      setShowModal(true);
    }
  };

  // Copy product link to clipboard with fallback
  const handleCopyLink = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const { url } = getProductShareData();
    let copySuccessful = false;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        copySuccessful = true;
      } catch {
        copySuccessful = false;
      }
    }

    // Fallback using textarea for older browsers or restricted iframe permissions
    if (!copySuccessful && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        copySuccessful = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        copySuccessful = false;
      }
    }

    if (copySuccessful) {
      setCopied(true);
      setToastMessage({ type: 'success', text: 'Product link copied successfully.' });
      setTimeout(() => setCopied(false), 2500);
    } else {
      setToastMessage({
        type: 'error',
        text: 'Unable to copy automatically. Please copy the link manually.',
      });
    }

    setTimeout(() => setToastMessage(null), 3000);
  };

  // WhatsApp share URL
  const getWhatsAppShareUrl = () => {
    const { text, url } = getProductShareData();
    const shareMessage = `${text}\n\n${url}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
  };

  // Facebook share URL
  const getFacebookShareUrl = () => {
    const { url } = getProductShareData();
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  };

  // Close modal on Escape key
  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const { url } = getProductShareData();
  const primaryImg = getSafeImageSrc(product?.images?.[0]);

  return (
    <>
      {/* 1. BUTTON VARIANT: Product Detail Page Main Action */}
      {variant === 'button' && (
        <button
          type="button"
          onClick={handleShareClick}
          aria-label={`Share ${product?.name}`}
          className={`h-10 px-4 bg-white hover:bg-[#F8F0E8] border border-[#E9D8C5] text-[#211710] rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all hover:border-[#D69A4B]/60 hover:shadow-xs active:scale-[0.98] cursor-pointer ${className}`}
        >
          <Share2 className="w-3.5 h-3.5 text-[#D69A4B] shrink-0 stroke-[2.2]" />
          <span>{label}</span>
        </button>
      )}

      {/* 2. ICON VARIANT: Compact circular icon button */}
      {variant === 'icon' && (
        <button
          type="button"
          onClick={handleShareClick}
          title={`Share ${product?.name}`}
          aria-label={`Share ${product?.name}`}
          className={`w-9 h-9 rounded-full bg-white hover:bg-[#F8F0E8] border border-[#E9D8C5] text-[#766B61] hover:text-[#D69A4B] flex items-center justify-center transition-all hover:shadow-xs active:scale-95 cursor-pointer ${className}`}
        >
          <Share2 className="w-4 h-4 stroke-[2]" />
        </button>
      )}

      {/* 3. CARD VARIANT: Subtle overlay icon button on product cards */}
      {variant === 'card' && (
        <button
          type="button"
          onClick={handleShareClick}
          title={`Share ${product?.name}`}
          aria-label={`Share ${product?.name}`}
          className={`w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white text-[#766B61] hover:text-[#D69A4B] border border-[#E9D8C5]/80 shadow-2xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-10 ${className}`}
        >
          <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>
      )}

      {/* Fallback Sharing Modal (Opens when Web Share API is unavailable or user clicks fallback) */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white border border-[#E9D8C5] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E9D8C5]/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F8F0E8] border border-[#E9D8C5] flex items-center justify-center text-[#D69A4B]">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="share-dialog-title" className="text-sm font-bold text-[#211710] leading-none">
                    Share Furniture Piece
                  </h3>
                  <span className="text-[11px] text-[#766B61] mt-0.5 block">
                    MNC LifeStyle Atelier
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close share popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Summary Preview */}
            <div className="flex items-center gap-3 p-3 bg-[#F8F0E8]/50 border border-[#E9D8C5]/70 rounded-xl mb-4">
              <div className="w-12 h-12 rounded-lg bg-white border border-[#E9D8C5] overflow-hidden shrink-0 relative">
                <img
                  src={primaryImg}
                  alt={product?.name || 'Product'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <h4 className="font-semibold text-[#211710] truncate">
                  {product?.name}
                </h4>
                <div className="text-[11px] text-[#766B61] mt-0.5">
                  {product?.categoryLabel || product?.category || 'Luxury Living'}
                </div>
              </div>
              {product?.price ? (
                <div className="text-right shrink-0 font-bold text-xs text-[#211710]">
                  {formatINR(product.price)}
                </div>
              ) : null}
            </div>

            {/* Direct Sharing Channels */}
            <div className="space-y-2.5 mb-4">
              {/* WhatsApp Share Button */}
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setToastMessage({ type: 'success', text: 'Opening WhatsApp share...' });
                  setTimeout(() => setShowModal(false), 800);
                }}
                className="w-full h-11 px-4 rounded-xl bg-[#169E49] hover:bg-[#12833C] text-white text-xs font-semibold flex items-center justify-between transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Share on WhatsApp</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              {/* Facebook Share Button */}
              <a
                href={getFacebookShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setToastMessage({ type: 'success', text: 'Opening Facebook share...' });
                  setTimeout(() => setShowModal(false), 800);
                }}
                className="w-full h-11 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold flex items-center justify-between transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Share on Facebook</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>

            {/* Copy Link Input Bar */}
            <div className="space-y-1.5 pt-2 border-t border-[#E9D8C5]/60">
              <label className="block text-[11px] font-semibold text-[#766B61] uppercase tracking-wider">
                Or copy product link
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={url}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono select-all focus:outline-none focus:border-[#D69A4B]"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#211710] hover:bg-[#382619] text-[#D69A4B]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Notification Toast inside Modal */}
            {toastMessage && (
              <div
                className={`mt-3 p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium animate-in fade-in duration-150 ${
                  toastMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                )}
                <span>{toastMessage.text}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Toast for Native Copy outside modal */}
      {toastMessage && !showModal && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 rounded-xl bg-[#211710] text-white border border-[#E9D8C5]/30 shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#D69A4B] shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}
    </>
  );
}
