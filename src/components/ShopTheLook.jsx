'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/lib/router-bridge';
import { products, slugify } from '../data/products';
import { formatINR } from '../utils/currency';
import { getWhatsAppInquiryUrl } from '../utils/whatsapp';
import { MessageCircle, ArrowRight } from 'lucide-react';

export default function ShopTheLook() {
  const [activePieceId, setActivePieceId] = useState('mnc-sof-01');

  // Curated pieces featured in this living room setup
  const roomPieces = [
    {
      productId: 'mnc-sof-01',
      label: 'Aura Curved Sofa',
    },
    {
      productId: 'mnc-cen-01',
      label: 'Kanso Travertine Table',
    },
    {
      productId: 'mnc-rec-02',
      label: 'Soren Lounge Chair',
    },
  ];

  const activeProduct = products.find((p) => p.id === activePieceId) || products[0];
  const activeWhatsAppUrl = getWhatsAppInquiryUrl({
    product: activeProduct,
    topic: 'Curated Room Suite Piece'
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-[#D69A4B] font-semibold block mb-2">
          Curated Atmospheres
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal tracking-tight">
          Shop The Living Room Suite
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-warmgrey">
          Explore the individual architectural pieces composing this curated living room space.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-4 sm:p-8 border border-beige-300 shadow-soft">
        
        {/* Curated Living Room Photograph — Clean without Hotspot Dots */}
        <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-beige-200">
          <Image
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85"
            alt="MNC Lifestyle Penthouse Living Room"
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover brightness-95"
          />
        </div>

        {/* Selected Product Card Side Panel (Desktop) */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="bg-[#F8F0E8]/70 rounded-2xl p-6 border border-[#E9D8C5]">
            <span className="text-[10px] uppercase tracking-widest text-bronze font-semibold block mb-1">
              Active Selection
            </span>
            
            <div className="flex gap-4 items-center mb-4">
              <Image
                src={activeProduct.images?.[0] || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'}
                alt={activeProduct.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-xl object-cover bg-beige-200 border border-beige-300 flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-warmgrey">
                  {activeProduct.categoryLabel}
                </span>
                <h4 className="font-serif text-lg font-medium text-charcoal leading-snug truncate">
                  {activeProduct.name}
                </h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-sans font-bold tabular-nums text-base text-charcoal">
                    {formatINR(activeProduct.price)}
                  </span>
                  {activeProduct.originalPrice && (
                    <span className="text-xs text-warmgrey line-through font-sans tabular-nums">
                      {formatINR(activeProduct.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-warmgrey leading-relaxed mb-6 font-sans line-clamp-3">
              {activeProduct.shortDescription}
            </p>

            {/* Quick Actions */}
            <div className="space-y-2">
              <a
                href={activeWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Enquire on WhatsApp</span>
              </a>
              <Link
                to={`/product/${activeProduct.slug || slugify(activeProduct.name)}`}
                className="w-full py-2.5 bg-white border border-[#E9D8C5] text-charcoal rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-[#F8F0E8] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Full Specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Hotspot Selectors */}
          <div className="mt-4 pt-4 border-t border-beige-200">
            <span className="text-[11px] uppercase tracking-wider text-warmgrey block mb-2">
              Pieces in this room:
            </span>
            <div className="flex flex-wrap gap-2">
              {roomPieces.map((piece) => {
                const prod = products.find((p) => p.id === piece.productId);
                const isSelected = activePieceId === piece.productId;
                return (
                  <button
                    key={piece.productId}
                    onClick={() => setActivePieceId(piece.productId)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      isSelected
                        ? 'bg-[#211710] text-[#D69A4B] border-[#211710]'
                        : 'bg-white text-warmgrey border-beige-300 hover:text-charcoal'
                    }`}
                  >
                    {prod?.name || piece.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
