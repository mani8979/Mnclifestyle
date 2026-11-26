'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/lib/router-bridge';
import { X, Star, ArrowRight } from 'lucide-react';
import WhatsAppIcon from './shared/WhatsAppIcon';
import { formatINR, calculateDiscount } from '../utils/currency';
import { getWhatsAppInquiryUrl } from '../utils/whatsapp';
import { getSafeImageSrc, shouldUnoptimizeImage } from '../utils/image';
import { getProductPrimaryColor, buildSingleProductSwatchVariants } from '../utils/colors';
import ColorVariantSelector from './ColorVariantSelector';
import FormattedTitle from './shared/FormattedTitle';
import { slugify } from '../data/products';

export default function ProductQuickViewModal({ product, isOpen, onClose }) {
  const [trackedPropProduct, setTrackedPropProduct] = useState(product);
  const [displayedProduct, setDisplayedProduct] = useState(product);
  const [isLoadingVariant, setIsLoadingVariant] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [swatchImageOverride, setSwatchImageOverride] = useState('');
  const [selectedColor, setSelectedColor] = useState(
    getProductPrimaryColor(product)?.name || product?.colors?.[0]?.name || 'Standard'
  );

  if (trackedPropProduct !== product) {
    setTrackedPropProduct(product);
    setDisplayedProduct(product);
    setActiveImage(0);
    setSwatchImageOverride('');
    setSelectedColor(
      getProductPrimaryColor(product)?.name || product?.colors?.[0]?.name || 'Standard'
    );
    setIsLoadingVariant(false);
  }

  if (!isOpen || !displayedProduct) return null;

  const activeProduct = displayedProduct;
  const hasMappedVariants =
    Array.isArray(activeProduct.colorVariants) && activeProduct.colorVariants.length > 1;
  const singleProductSwatchVariants = !hasMappedVariants
    ? buildSingleProductSwatchVariants(activeProduct, 'qv-swatch')
    : [];

  const activeSwatch = singleProductSwatchVariants.find(
    (s) => s.colorName.trim().toLowerCase() === (selectedColor || '').trim().toLowerCase()
  );
  const effectivePrice = activeSwatch ? activeSwatch.price : Number(activeProduct.price) || 0;
  const effectiveOriginalPrice = activeSwatch
    ? activeSwatch.originalPrice
    : Number(activeProduct.originalPrice) || 0;
  const productForInquiry =
    effectivePrice !== Number(activeProduct.price) || swatchImageOverride
      ? {
          ...activeProduct,
          price: effectivePrice,
          originalPrice: effectiveOriginalPrice,
          ...(swatchImageOverride
            ? { images: [swatchImageOverride, ...(activeProduct.images || [])] }
            : {}),
        }
      : activeProduct;

  const handleSelectColorVariant = async (variant) => {
    if (!variant?.slug || isLoadingVariant) return;
    setIsLoadingVariant(true);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(variant.slug)}`);
      const data = await res.json();
      if (res.ok && data?.success && data.product) {
        setDisplayedProduct(data.product);
        setActiveImage(0);
        setSwatchImageOverride('');
        setSelectedColor(
          getProductPrimaryColor(data.product)?.name ||
            variant.colorName ||
            data.product.colors?.[0]?.name ||
            'Standard'
        );
      }
    } catch (err) {
      console.error('Failed to switch Quick View color variant:', err);
    } finally {
      setIsLoadingVariant(false);
    }
  };

  const handleSelectSwatchVariant = (variant, idx) => {
    setSelectedColor(variant.colorName);
    if (variant.image) {
      const matchIdx = Array.isArray(activeProduct.images)
        ? activeProduct.images.findIndex((img) => img === variant.image)
        : -1;
      if (matchIdx >= 0) {
        setSwatchImageOverride('');
        setActiveImage(matchIdx);
      } else {
        setSwatchImageOverride(variant.image);
      }
    } else if (Array.isArray(activeProduct.images) && activeProduct.images[idx]) {
      setSwatchImageOverride('');
      setActiveImage(idx);
    } else {
      setSwatchImageOverride('');
    }
  };

  const imagesList = Array.isArray(activeProduct.images) ? activeProduct.images : [];
  const mainImageSrc = getSafeImageSrc(swatchImageOverride || imagesList[activeImage] || imagesList[0]);

  const discount = calculateDiscount(effectivePrice, effectiveOriginalPrice);
  const isOutOfStock =
    activeProduct.inStock === false ||
    (Boolean(activeProduct.trackInventory) &&
      !activeProduct.allowBackorders &&
      typeof activeProduct.availableQuantity === 'number' &&
      activeProduct.availableQuantity <= 0) ||
    Boolean(activeSwatch && activeSwatch.inStock === false);

  const whatsappInquiryUrl = getWhatsAppInquiryUrl({
    product: productForInquiry,
    selectedColor,
    topic: isOutOfStock ? 'Restock & Lead Time Enquiry' : 'Product Enquiry',
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
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-white border border-beige-300 shadow-soft mb-4">
              <Image
                src={mainImageSrc}
                alt={activeProduct.name}
                fill
                unoptimized={shouldUnoptimizeImage(mainImageSrc)}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {activeProduct.badge && (
                  <span className="bg-[#211710]/85 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded">
                    {activeProduct.badge}
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
            {imagesList.length > 1 && (
              <div className="flex gap-2.5">
                {imagesList.map((img, idx) => {
                  const thumbSrc = getSafeImageSrc(img);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSwatchImageOverride('');
                        setActiveImage(idx);
                      }}
                      className={`relative w-16 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        !swatchImageOverride && activeImage === idx
                          ? 'border-bronze scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={thumbSrc}
                        alt=""
                        fill
                        unoptimized={shouldUnoptimizeImage(thumbSrc)}
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-bronze font-semibold">
                  {activeProduct.categoryLabel} — {activeProduct.subCategory}
                </span>
                <div className="flex items-center gap-1 text-xs text-warmgrey">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{activeProduct.rating}</span>
                </div>
              </div>

              <h3 className="font-serif text-2xl font-medium text-charcoal mb-2">
                <FormattedTitle text={activeProduct.name} />
              </h3>

              <div className="flex flex-wrap items-baseline gap-2.5 mb-3">
                <span className="font-sans font-bold tabular-nums text-2xl text-charcoal">
                  {formatINR(effectivePrice)}
                </span>
                {effectiveOriginalPrice > effectivePrice && (
                  <span className="text-xs text-warmgrey line-through font-sans tabular-nums">
                    {formatINR(effectiveOriginalPrice)}
                  </span>
                )}
                <span className="text-[11px] text-[#49301F] font-medium ml-1">
                  (Incl. In-Home Assembly)
                </span>
              </div>

              {isOutOfStock && (
                <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  <span>Currently Out of Stock in {selectedColor}</span>
                </div>
              )}

              <p className="text-xs text-warmgrey leading-relaxed mb-5 font-sans">
                {activeProduct.shortDescription}
              </p>

              {/* Mapped Colour Cards OR Single-Product Swatch Cards */}
              {hasMappedVariants ? (
                <ColorVariantSelector
                  variants={activeProduct.colorVariants.map((v) => ({ ...v, isProductVariant: true }))}
                  currentProduct={activeProduct}
                  onVariantSelect={handleSelectColorVariant}
                  compact={true}
                  isLoadingVariant={isLoadingVariant}
                  mode="link"
                />
              ) : (
                singleProductSwatchVariants.length > 0 && (
                  <ColorVariantSelector
                    variants={singleProductSwatchVariants}
                    currentProduct={activeProduct}
                    selectedColorName={selectedColor}
                    onVariantSelect={handleSelectSwatchVariant}
                    compact={true}
                    mode="swatch"
                  />
                )
              )}
            </div>

            {/* Actions: Direct WhatsApp Enquiry & Full Specifications */}
            <div className="space-y-2.5 pt-4 border-t border-beige-200">
              <div className="flex gap-2.5">
                {/* Primary WhatsApp Enquiry Button */}
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-[#169E49] hover:bg-[#12833C] text-white rounded-lg text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>{isOutOfStock ? 'Enquire Restock on WhatsApp' : 'WhatsApp Enquiry'}</span>
                </a>
              </div>

              <div className="flex items-center justify-end pt-1">
                <Link
                  to={`/product/${activeProduct.slug || slugify(activeProduct.name)}`}
                  onClick={onClose}
                  className="text-xs font-semibold text-bronze hover:text-bronze-dark flex items-center gap-1"
                >
                  <span>View Details & Measurements</span>
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
