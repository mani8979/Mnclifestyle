import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { products } from '../data/products';
import { useWishlist } from '../context/WishlistContext';
import { formatINR, calculateDiscount } from '../utils/currency';
import { getWhatsAppOrderUrl, getWhatsAppInquiryUrl } from '../utils/whatsapp';
import {
  Heart,
  Star,
  ShieldCheck,
  Truck,
  Ruler,
  Layers,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Palette,
  CheckCircle2
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
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
  const [openAccordion, setOpenAccordion] = useState('dimensions');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const isSaved = isInWishlist(product.id);
  const discount = calculateDiscount(product.price, product.originalPrice);

  // WhatsApp Order & Inquiry URLs
  const whatsappOrderUrl = getWhatsAppOrderUrl({
    product,
    selectedColor,
    quantity
  });

  const whatsappInquiryUrl = getWhatsAppInquiryUrl({
    product,
    topic: 'Custom Dimensions & Finish Enquiry'
  });

  // Recommended pieces: same category first, then others
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(products.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, 4);

  const toggleAccordion = (section) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  // Verified Customer Reviews
  const reviews = [
    {
      author: 'Dr. Suresh Varma',
      location: 'Siripuram, Visakhapatnam',
      rating: 5,
      date: 'Verified Buyer • 2 weeks ago',
      title: 'Flawless craftsmanship & exceptional comfort',
      comment: `The timber joinery and finish quality on our ${product.name} are truly architectural caliber. The Visakhapatnam team handled delivery with white-glove care, placing it perfectly in our living room.`
    },
    {
      author: 'Ananya Reddy',
      location: 'Jubilee Hills, Hyderabad',
      rating: 5,
      date: 'Verified Buyer • 1 month ago',
      title: 'Effortless WhatsApp ordering experience',
      comment: 'Ordering directly on WhatsApp felt like having a personal furniture concierge. They shared high-resolution finish swatches and tracked the shipment seamlessly. Highly recommended!'
    },
    {
      author: 'Karthik Raman',
      location: 'MG Road, Vijayawada',
      rating: 5,
      date: 'Verified Buyer • 2 months ago',
      title: 'Solid hardwood integrity that stands out',
      comment: 'In a market flooded with engineered wood, finding authentic seasoned teak and tactile fabrics crafted with such quiet elegance is rare. The proportions are balanced for contemporary Indian residences.'
    }
  ];

  return (
    <div className="py-4 sm:py-8 lg:py-12 pb-28 sm:pb-32 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Compact Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 sm:space-x-2 text-xs text-[#766B61] mb-4 sm:mb-8 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
          <Link to="/" className="hover:text-[#211710] transition-colors shrink-0">Home</Link>
          <span className="text-[#DDD3C4]">/</span>
          <Link to="/shop" className="hover:text-[#211710] transition-colors shrink-0">Furniture</Link>
          <span className="text-[#DDD3C4]">/</span>
          <Link to={`/category/${product.category}`} className="hover:text-[#211710] transition-colors shrink-0">
            {product.categoryLabel}
          </Link>
          <span className="text-[#DDD3C4]">/</span>
          <span className="text-[#211710] font-medium truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Top Product Section: 2-Column Gallery + Purchasing & WhatsApp Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-14 mb-12 lg:mb-16">
          
          {/* Left Column: Image Gallery (Col 7) */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            
            {/* 2. Main Active Image — Clean without overlays obstructing furniture */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#EAE2D8] border border-[#E9D8C5] shadow-soft group">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={`${product.name} - View ${activeImageIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                loading="eager"
              />

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 rounded-full shadow-md transition-all ${
                  isSaved
                    ? 'bg-white text-[#D69A4B] scale-105'
                    : 'bg-white/85 backdrop-blur-xs text-[#211710] hover:bg-white hover:text-[#D69A4B]'
                }`}
                aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-[#D69A4B] text-[#D69A4B]' : ''}`} />
              </button>
            </div>

            {/* 3. Product Image Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-14 sm:w-24 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#D69A4B] shadow-sm scale-102'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover bg-[#EAE2D8]"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Purchasing & WhatsApp Ordering (Col 5) */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            
            {/* 4. Product Category and Bestseller Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] font-bold text-[#D69A4B]">
                {product.categoryLabel}
                {product.subCategory && ` — ${product.subCategory}`}
              </span>
              {product.badge && (
                <span className="px-2 py-0.5 rounded-full bg-[#211710] text-[#D69A4B] text-[10px] font-semibold uppercase tracking-wider">
                  {product.badge}
                </span>
              )}
            </div>

            {/* 5. Product Name */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#211710] font-normal tracking-tight leading-snug sm:leading-tight mb-2 sm:mb-2.5">
              {product.name}
            </h1>

            {/* 6. Rating and Reviews */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#766B61] mb-3 sm:mb-4">
              <div className="flex items-center gap-1 text-[#D69A4B]">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#D69A4B]" />
                <span className="font-semibold text-[#211710]">{product.rating || '4.9'}</span>
              </div>
              <span className="text-[#DDD3C4]">|</span>
              <a href="#customer-reviews" className="hover:text-[#D69A4B] transition-colors underline decoration-[#D69A4B]/40 underline-offset-2">
                {product.reviewsCount || '38'} Genuine Reviews
              </a>
            </div>

            {/* 7. SKU and Availability */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#766B61] mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-[#E9D8C5]">
              <div className="flex items-center gap-1.5">
                <span className="text-[#766B61]">SKU:</span>
                <span className="font-medium text-[#211710] font-mono text-[11px] sm:text-xs">{product.sku}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse" />
                <span>In Stock & Ready for Dispatch</span>
              </div>
            </div>

            {/* 8 & 9. Selling Price, MRP, and Savings */}
            <div className="mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-[#E9D8C5]">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-[#766B61] font-semibold block mb-1">
                YOUR PRICE
              </span>
              <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
                <span className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#211710] tracking-tight leading-none">
                  {formatINR(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm sm:text-base text-[#766B61] line-through font-sans">
                    MRP {formatINR(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.originalPrice && product.originalPrice > product.price && discount && (
                <div className="mt-2">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-semibold">
                    You Save {formatINR(product.originalPrice - product.price)} ({discount})
                  </span>
                </div>
              )}
              <p className="text-[11px] text-[#766B61] mt-1.5">
                Price includes applicable GST. Complimentary white-glove placement in AP.
              </p>
            </div>

            {/* 10. Short Product Description with 'Read More' */}
            <div className="mb-5 sm:mb-6">
              <p className={`text-xs sm:text-sm md:text-base text-[#49301F] leading-relaxed font-sans ${!isDescriptionExpanded ? 'line-clamp-3 sm:line-clamp-none' : ''}`}>
                {product.fullDescription || product.shortDescription}
              </p>
              {product.fullDescription && product.fullDescription.length > 120 && (
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-1 text-xs font-semibold text-[#D69A4B] hover:text-[#211710] transition-colors inline-flex items-center gap-1 sm:hidden"
                >
                  <span>{isDescriptionExpanded ? 'Read Less' : 'Read More'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDescriptionExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* 11. Finish / Fabric Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-5 sm:mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-[#211710]">
                    SELECT FINISH / FABRIC
                  </span>
                  <span className="text-xs font-semibold text-[#D69A4B]">
                    {selectedColor}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border text-xs font-medium transition-all min-h-[38px] ${
                        selectedColor === c.name
                          ? 'border-[#D69A4B] bg-white text-[#211710] ring-2 ring-[#D69A4B] shadow-xs'
                          : 'border-[#E9D8C5] bg-white/70 text-[#766B61] hover:border-[#211710]/40 hover:text-[#211710]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-black/20 shrink-0 shadow-2xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 12. Quantity Selector */}
            <div className="mb-5 sm:mb-6">
              <label className="text-xs uppercase tracking-widest font-bold text-[#211710] block mb-2">
                QUANTITY
              </label>
              <div className="inline-flex items-center border border-[#E9D8C5] rounded-xl bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-[#211710] hover:text-[#D69A4B] hover:bg-[#F8F0E8] rounded-l-xl transition-colors font-bold text-lg focus:outline-none"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 sm:w-12 text-center text-sm font-semibold text-[#211710] select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-[#211710] hover:text-[#D69A4B] hover:bg-[#F8F0E8] rounded-r-xl transition-colors font-bold text-lg focus:outline-none"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* 13. Main WhatsApp Ordering Button */}
            <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 sm:h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm uppercase tracking-widest font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>ORDER THROUGH WHATSAPP</span>
              </a>

              <div className="flex gap-2 sm:gap-2.5">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 sm:py-2.5 px-3 bg-white border border-[#E9D8C5] text-[#211A15] hover:bg-[#F8F0E8] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D69A4B]" />
                  <span>Ask About This Product</span>
                </a>
                <Link
                  to="/contact"
                  className="py-2 sm:py-2.5 px-3.5 sm:px-4 bg-white border border-[#E9D8C5] text-[#211A15] hover:bg-[#F8F0E8] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  title="Schedule Private Showroom Viewing"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#D69A4B]" />
                  <span>Visit Showroom</span>
                </Link>
              </div>

              {/* Explainer Note */}
              <div className="p-3 bg-[#F8F0E8] rounded-xl border border-[#E9D8C5] text-[11px] text-[#49301F] leading-relaxed flex items-start gap-2">
                <span className="text-base leading-none">💬</span>
                <span>
                  <strong>WhatsApp-Only Order Desk:</strong> Our Visakhapatnam concierge coordinates verified pin code dispatch, custom wood finishes, and delivery scheduling directly on WhatsApp.
                </span>
              </div>
            </div>

            {/* 14. Product Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-[#E9D8C5] text-xs text-[#766B61]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#D69A4B] shrink-0" />
                <span>Pan-India Insured White-Glove Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D69A4B] shrink-0" />
                <span>{product.warranty || '10-Year Craftsmanship Guarantee'}</span>
              </div>
            </div>

          </div>
        </div>

        {/* 15. Recommended Products: Moved Higher ("Explore Similar Furniture") */}
        {relatedProducts.length > 0 && (
          <section className="mb-10 sm:mb-14 pt-4 sm:pt-6 border-t border-[#E9D8C5]">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#D69A4B] font-bold block mb-1">
                  CURATED RECOMMENDATIONS
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-[#211710] font-medium">
                  Explore Similar Furniture
                </h3>
              </div>
              <Link
                to={`/category/${product.category}`}
                className="text-xs font-semibold text-[#D69A4B] hover:text-[#211710] transition-colors hidden sm:inline-flex items-center gap-1"
              >
                <span>View Category</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2-Column Mobile Grid / 4-Column Desktop Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl sm:rounded-2xl border border-[#E9D8C5] overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <Link to={`/product/${p.id}`} className="block relative aspect-[4/3] bg-[#EAE2D8] overflow-hidden">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>
                    <div className="p-3 sm:p-4">
                      <span className="text-[10px] uppercase tracking-wider text-[#D69A4B] font-semibold block mb-0.5 truncate">
                        {p.categoryLabel}
                      </span>
                      <Link
                        to={`/product/${p.id}`}
                        className="font-serif text-xs sm:text-sm font-medium text-[#211710] hover:text-[#D69A4B] transition-colors line-clamp-1 block mb-1.5"
                        title={p.name}
                      >
                        {p.name}
                      </Link>
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="font-serif text-sm sm:text-base font-bold text-[#211710]">
                          {formatINR(p.price)}
                        </span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-[11px] text-[#766B61] line-through font-sans">
                            {formatINR(p.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 pt-0">
                    <Link
                      to={`/product/${p.id}`}
                      className="w-full py-1.5 sm:py-2 bg-[#F8F0E8] hover:bg-[#211710] text-[#211710] hover:text-white rounded-lg text-[11px] sm:text-xs font-semibold text-center block transition-colors border border-[#E9D8C5]"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 16. Detailed Specifications & Craftsmanship in Expandable Accordions */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-16 bg-white rounded-2xl border border-[#E9D8C5] p-5 sm:p-8 lg:p-10 shadow-soft">
          <div className="text-center mb-6">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#D69A4B] font-bold block mb-1">
              ARCHITECTURAL INTEGRITY
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-[#211710] font-medium">
              Detailed Specifications & Craftsmanship
            </h3>
          </div>

          <div className="space-y-3">
            
            {/* 1. Product Details Accordion */}
            <div className="border border-[#E9D8C5] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('details')}
                className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-[#211710] bg-[#F8F0E8]/60 hover:bg-[#F8F0E8] transition-colors"
                aria-expanded={openAccordion === 'details'}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D69A4B]" />
                  <span>Product Details & Architecture</span>
                </div>
                {openAccordion === 'details' ? <ChevronUp className="w-4 h-4 text-[#766B61]" /> : <ChevronDown className="w-4 h-4 text-[#766B61]" />}
              </button>
              {openAccordion === 'details' && (
                <div className="p-4 sm:p-5 text-xs text-[#49301F] space-y-3 bg-white leading-relaxed">
                  <p>{product.fullDescription || product.shortDescription}</p>
                  <p className="text-[#766B61] italic">
                    Every piece is crafted in Visakhapatnam under rigorous quality supervision with hand-sanded timber contours and calibrated hardware joints.
                  </p>
                </div>
              )}
            </div>

            {/* 2. Dimensions & Materials Accordion */}
            <div className="border border-[#E9D8C5] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('dimensions')}
                className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-[#211710] bg-[#F8F0E8]/60 hover:bg-[#F8F0E8] transition-colors"
                aria-expanded={openAccordion === 'dimensions'}
              >
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#D69A4B]" />
                  <span>Dimensions & Materials</span>
                </div>
                {openAccordion === 'dimensions' ? <ChevronUp className="w-4 h-4 text-[#766B61]" /> : <ChevronDown className="w-4 h-4 text-[#766B61]" />}
              </button>
              {openAccordion === 'dimensions' && (
                <div className="p-4 sm:p-5 text-xs text-[#766B61] space-y-4 bg-white">
                  <div>
                    <h5 className="font-semibold text-[#211710] mb-2 uppercase tracking-wider text-[11px]">
                      Dimensions & Weight
                    </h5>
                    <div className="space-y-1.5">
                      {Object.entries(product.dimensions || {}).map(([key, val]) => (
                        <div key={key} className="flex justify-between py-1 border-b border-[#E9D8C5]/60 last:border-b-0">
                          <span className="font-medium text-[#211710] capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {product.materials && product.materials.length > 0 && (
                    <div className="pt-3 border-t border-[#E9D8C5]/60">
                      <h5 className="font-semibold text-[#211710] mb-2 uppercase tracking-wider text-[11px]">
                        Timber & Hardware Composition
                      </h5>
                      <ul className="space-y-1.5 list-disc list-inside">
                        {product.materials.map((mat, idx) => (
                          <li key={idx} className="leading-relaxed">
                            <strong className="text-[#211710]">{mat}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Finish & Customization Accordion */}
            <div className="border border-[#E9D8C5] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('customization')}
                className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-[#211710] bg-[#F8F0E8]/60 hover:bg-[#F8F0E8] transition-colors"
                aria-expanded={openAccordion === 'customization'}
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#D69A4B]" />
                  <span>Finish & Bespoke Customization</span>
                </div>
                {openAccordion === 'customization' ? <ChevronUp className="w-4 h-4 text-[#766B61]" /> : <ChevronDown className="w-4 h-4 text-[#766B61]" />}
              </button>
              {openAccordion === 'customization' && (
                <div className="p-4 sm:p-5 text-xs text-[#766B61] bg-white space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-[#211710]">Available Standard Finishes:</strong>{' '}
                    {product.colors?.map(c => c.name).join(', ') || 'Natural Solid Hardwood'}
                  </p>
                  <p>
                    <strong className="text-[#211710]">Bespoke Dimensional Scaling:</strong> Need custom width, seat height, or specialized upholstery fabric? Our furniture artisans accommodate custom sizing. Discuss your floor plan directly on WhatsApp.
                  </p>
                </div>
              )}
            </div>

            {/* 4. Delivery & Assembly Accordion */}
            <div className="border border-[#E9D8C5] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('delivery')}
                className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-[#211710] bg-[#F8F0E8]/60 hover:bg-[#F8F0E8] transition-colors"
                aria-expanded={openAccordion === 'delivery'}
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#D69A4B]" />
                  <span>Delivery & Assembly in India</span>
                </div>
                {openAccordion === 'delivery' ? <ChevronUp className="w-4 h-4 text-[#766B61]" /> : <ChevronDown className="w-4 h-4 text-[#766B61]" />}
              </button>
              {openAccordion === 'delivery' && (
                <div className="p-4 sm:p-5 text-xs text-[#766B61] bg-white space-y-2 leading-relaxed">
                  <p>
                    <strong className="text-[#211710]">Visakhapatnam & Coastal Andhra Pradesh:</strong> Complimentary scheduled 2-person white-glove placement, in-home assembly, leveling, and packaging removal within 3–7 business days.
                  </p>
                  <p>
                    <strong className="text-[#211710]">Pan-India Logistics:</strong> Fully insured door-to-door transit across 18,000+ pin codes. Real-time tracking and transit coordination managed via WhatsApp.
                  </p>
                </div>
              )}
            </div>

            {/* 5. Warranty & Care Accordion */}
            <div className="border border-[#E9D8C5] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('warranty')}
                className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-[#211710] bg-[#F8F0E8]/60 hover:bg-[#F8F0E8] transition-colors"
                aria-expanded={openAccordion === 'warranty'}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D69A4B]" />
                  <span>Warranty & Care Guidelines</span>
                </div>
                {openAccordion === 'warranty' ? <ChevronUp className="w-4 h-4 text-[#766B61]" /> : <ChevronDown className="w-4 h-4 text-[#766B61]" />}
              </button>
              {openAccordion === 'warranty' && (
                <div className="p-4 sm:p-5 text-xs text-[#766B61] bg-white space-y-2 leading-relaxed">
                  <p>
                    <strong className="text-[#211710]">10-Year Craftsmanship Warranty:</strong> Covers internal structural hardwood framework, mortise joinery, and anti-termite treatment under normal residential use.
                  </p>
                  <p>
                    <strong className="text-[#211710]">Maintenance Tips:</strong> Dust with a dry microfibre cloth along the timber grain. Avoid harsh chemical cleaners and prolonged direct monsoon exposure.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 17. Delivery & Warranty Information Reassurance Card */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-16 p-4 sm:p-6 rounded-2xl bg-[#F8F0E8] border border-[#E9D8C5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#D69A4B] shrink-0 border border-[#E9D8C5]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#211710]">
                {product.leadTime || 'White-Glove Placement Available'}
              </h4>
              <p className="text-[11px] sm:text-xs text-[#766B61] mt-0.5">
                Complimentary assembly across AP • Insured Pan-India transit
              </p>
            </div>
          </div>
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-[#211710] hover:text-white text-[#211710] border border-[#E9D8C5] rounded-xl text-xs font-semibold transition-colors text-center shrink-0"
          >
            Check Pin Code Delivery
          </a>
        </div>

        {/* 18. Customer Reviews Section */}
        <section id="customer-reviews" className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E9D8C5]">
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#D69A4B] font-bold block mb-1">
                VERIFIED INDIAN HOMEOWNERS
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-[#211710] font-medium">
                Customer Reviews
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[#D69A4B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D69A4B]" />
                ))}
              </div>
              <span className="text-sm font-bold text-[#211710]">4.9 out of 5</span>
              <span className="text-xs text-[#766B61]">({product.reviewsCount || '38'} reviews)</span>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((r, idx) => (
              <div
                key={idx}
                className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E9D8C5] shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-[#D69A4B]">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#D69A4B]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#766B61]">{r.date}</span>
                </div>
                <h4 className="font-serif text-sm sm:text-base font-semibold text-[#211710] mb-1.5">
                  {r.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#49301F] leading-relaxed mb-3 font-sans">
                  "{r.comment}"
                </p>
                <div className="flex items-center justify-between text-xs text-[#766B61] pt-2 border-t border-[#E9D8C5]/50">
                  <span className="font-medium text-[#211710]">{r.author}</span>
                  <span className="text-[11px] text-[#D69A4B]">{r.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Mobile Sticky Bottom Purchase Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#211710]/95 backdrop-blur-md border-t border-[#49301F] px-4 py-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] shadow-2xl transition-all">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          
          {/* Price & Savings Display */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[#C9BBAE] font-medium leading-none mb-1">
              Your Price
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-lg sm:text-xl font-bold text-white leading-none">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] text-[#C9BBAE] line-through font-sans">
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>
            {discount && (
              <span className="text-[10px] text-emerald-400 font-medium mt-0.5">
                Save {discount}
              </span>
            )}
          </div>

          {/* Sticky WhatsApp Order CTA Button */}
          <a
            href={whatsappOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0"
            aria-label={`Order ${product.name} on WhatsApp`}
          >
            <MessageCircle className="w-4 h-4 fill-current shrink-0" />
            <span>Order on WhatsApp</span>
          </a>

        </div>
      </div>

    </div>
  );
}
