import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import { collections } from '../data/collections';
import { products } from '../data/products';
import { getWhatsAppConsultationUrl } from '../utils/whatsapp';
import { ArrowRight, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';

export default function Collections() {
  const whatsappUrl = getWhatsAppConsultationUrl('Custom Tailored Whole-Home Suite');

  return (
    <div className="py-12 sm:py-20 pb-28">
      <div className="max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-[50px]">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-warmgrey mb-6">
          <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">Curated Collections</span>
        </div>

        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16 sm:mb-24" delay={50}>
          <span className="text-xs uppercase tracking-[0.25em] text-[#855214] font-semibold block mb-2">
            Harmonious Living
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#211A15] font-normal tracking-tight mb-4">
            Curated Collections
          </h1>
          <p className="text-sm sm:text-base text-warmgrey leading-relaxed">
            Thoughtfully assembled furniture suites engineered to eliminate spatial friction. Each collection combines shared architectural proportions, seasoned solid hardwoods, and refined silhouettes.
          </p>
        </ScrollReveal>

        {/* Collections Stack */}
        <div className="space-y-24 sm:space-y-36 max-w-7xl mx-auto">
          {collections.map((col, index) => {
            const featuredItems = products.filter((p) =>
              col.featuredProductIds?.includes(p.id)
            );

            const isReversed = index % 2 === 1;

            return (
              <ScrollReveal as="section" key={col.id} className="scroll-mt-20" id={col.id} delay={index === 0 ? 80 : 0}>
                {/* Hero Feature */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12">
                  
                  {/* Photo Column */}
                  <div className={`lg:col-span-7 ${isReversed ? 'lg:order-2' : ''}`}>
                    <div className="relative rounded-3xl overflow-hidden shadow-luxury group aspect-[16/10] bg-beige-200">
                      <img
                        src={col.image}
                        alt={col.title}
                        className="w-full h-full object-cover luxury-image-zoom"
                      />
                      <div className="absolute top-4 left-4 bg-[#211710]/85 backdrop-blur-sm text-[#F8F0E8] text-xs uppercase tracking-widest px-3 py-1 rounded">
                        {col.piecesCount}
                      </div>
                    </div>
                  </div>

                  {/* Text Description Column */}
                  <div className={`lg:col-span-5 ${isReversed ? 'lg:order-1' : ''}`}>
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D69A4B] block mb-2">
                      {col.subtitle}
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl text-[#211A15] font-medium leading-tight mb-4">
                      {col.title}
                    </h2>
                    <p className="text-xs font-serif italic text-[#49301F] mb-4">
                      "{col.tagline}"
                    </p>
                    <p className="text-xs sm:text-sm text-warmgrey leading-relaxed mb-6 font-sans">
                      {col.description}
                    </p>

                    {/* Materials pill badge */}
                    <div className="mb-6 pt-4 border-t border-[#E9D8C5]">
                      <span className="text-[11px] uppercase tracking-wider text-[#211A15] font-semibold block mb-2">
                        Harmonized Finishes:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {col.materials.map((m) => (
                          <span
                            key={m}
                            className="text-xs bg-white text-[#211A15] px-3 py-1 rounded-full border border-[#E9D8C5] shadow-2xs font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={`/category/${col.category}`}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#211A15] hover:text-[#D69A4B] transition-colors pb-1 border-b border-[#211A15]/40 hover:border-[#D69A4B]"
                    >
                      <span>Explore Entire {col.category.replace('-', ' ')} Catalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Featured pieces in this collection */}
                {featuredItems.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-beige-300">
                      <h3 className="font-serif text-xl text-charcoal font-medium">
                        Featured Pieces from {col.title}
                      </h3>
                      <span className="text-xs text-warmgrey">Handcrafted & Coordinated</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredItems.map((prod, idx) => (
                        <ProductCard key={prod.id} product={prod} index={idx} />
                      ))}
                    </div>
                  </div>
                )}
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bespoke Collection Consultation Banner */}
        <ScrollReveal className="mt-28 bg-[#211710] text-[#F8F0E8] rounded-3xl p-8 sm:p-14 text-center shadow-elevated max-w-4xl mx-auto" delay={100}>
          <div className="max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-[0.25em] text-[#855214] font-semibold block mb-2">
              Private Specification
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-white font-normal mb-4">
              Need a Tailored Whole-Home Suite?
            </h3>
            <p className="text-xs sm:text-sm text-[#E9D8C5]/80 leading-relaxed mb-8">
              Collaborate directly with our senior design team via WhatsApp to create customized dimensions, match timber stains across multiple rooms, or review fabric swatches sent directly to your home.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs uppercase tracking-widest font-bold rounded-lg transition-colors shadow-soft"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Discuss Custom Suite on WhatsApp</span>
            </a>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
