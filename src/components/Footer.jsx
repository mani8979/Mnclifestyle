'use client';
import React from 'react';
import { Link } from '@/lib/router-bridge';
import {
  ShieldCheck,
  Compass,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ArrowRight,
  Navigation
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { businessConfig } from '../data/businessConfig';
import { WHATSAPP_RAW_NUMBER } from '../utils/whatsapp';

/**
 * @param {{ categories?: any[] }} props
 */
export default function Footer({ categories: initialCategories = [] }) {
  const activeFooterCategories = (
    Array.isArray(initialCategories) && initialCategories.length > 0
      ? initialCategories
      : [
          { slug: 'sectional-sofas', name: 'Sofas' },
          { slug: 'beds', name: 'Beds' },
          { slug: 'dining-sets', name: 'Dining Sets' },
          { slug: 'centre-tables', name: 'Centre Tables' },
          { slug: 'recliners', name: 'Recliners' },
          { slug: 'wardrobes', name: 'Wardrobes' },
          { slug: 'chairs', name: 'Chairs' },
          { slug: 'office-tables', name: 'Office Tables' },
        ]
  );
  const leftFooterCategories = activeFooterCategories.slice(0, Math.ceil(activeFooterCategories.length / 2));
  const rightFooterCategories = activeFooterCategories.slice(Math.ceil(activeFooterCategories.length / 2));
  const whatsappDirectUrl = `https://wa.me/${businessConfig.contact.phoneRaw}?text=${encodeURIComponent(
    'Hello MNC LifeStyle, I would like to enquire about your furniture collections.'
  )}`;

  return (
    <footer className="bg-[#211710] text-[#F8F0E8] pt-14 lg:pt-16 pb-10 border-t border-[#49301F]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* 1. TOP TRUST FEATURES STRIP */}
        <ScrollReveal className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/12 pb-10 mb-12 border-b border-white/12" delay={50}>
          
          {/* Feature 1: Bespoke Architectural Quality */}
          <div className="flex items-start gap-4 py-4 md:py-0 md:pr-8">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-[#D69A4B]/40 flex items-center justify-center text-[#D69A4B] shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif text-sm sm:text-base text-white font-medium">
                Bespoke Architectural Quality
              </h4>
              <p className="text-xs text-[#C9BBAE] mt-1.5 leading-relaxed font-sans">
                Kiln-dried solid Teakwood, Indian Sheesham, Roman travertine, and Belgian bouclé crafted by master artisans.
              </p>
            </div>
          </div>

          {/* Feature 2: White-Glove Placement in AP */}
          <div className="flex items-start gap-4 py-4 md:py-0 md:px-8">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-[#D69A4B]/40 flex items-center justify-center text-[#D69A4B] shrink-0">
              <Compass className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif text-sm sm:text-base text-white font-medium">
                White-Glove Placement in AP
              </h4>
              <p className="text-xs text-[#C9BBAE] mt-1.5 leading-relaxed font-sans">
                Complimentary room-of-choice positioning, leveling, assembly, and packaging removal across Andhra Pradesh.
              </p>
            </div>
          </div>

          {/* Feature 3: Ten-Year Structural Warranty */}
          <div className="flex items-start gap-4 py-4 md:py-0 md:pl-8">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-[#D69A4B]/40 flex items-center justify-center text-[#D69A4B] shrink-0">
              <Clock className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif text-sm sm:text-base text-white font-medium">
                Ten-Year Structural Warranty
              </h4>
              <p className="text-xs text-[#C9BBAE] mt-1.5 leading-relaxed font-sans">
                Comprehensive long-term structural and termite guarantees designed for enduring domestic tranquility.
              </p>
            </div>
          </div>

        </ScrollReveal>

        {/* 2. MAIN FOOTER LAYOUT — 3 BALANCED COLUMNS */}
        <ScrollReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 pb-12" delay={100}>
          
          {/* COLUMN 1 – BRAND & SHOWROOM CONTACT (5 COLS) */}
          <div className="lg:col-span-5 pr-0 lg:pr-8">
            <div className="mb-4">
              <span className="font-serif text-2xl tracking-[0.16em] font-medium text-white uppercase block">
                MNC <span className="font-light italic text-[#D69A4B]">LifeStyle</span>
              </span>
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#E9D8C5] font-sans block mt-1">
                FURNITURE & CONTEMPORARY LIVING
              </span>
            </div>
            
            <p className="text-xs sm:text-[13px] text-[#E9D8C5]/90 leading-relaxed mb-6 font-sans max-w-md">
              MNC LifeStyle curates thoughtful, minimal and enduring furniture collections for Indian homes that value quiet elegance. We balance the architectural beauty of natural materials with comfort and lived-in warmth.
            </p>

            <div className="space-y-4 text-xs sm:text-[13px] text-[#E9D8C5] font-sans">
              {/* Location Card & Maps Links */}
              <div className="flex items-start gap-3 bg-white/5 p-3.5 sm:p-4 rounded-xl border border-white/10">
                <MapPin className="w-4 h-4 text-[#D69A4B] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-white text-[13px] sm:text-sm leading-snug">
                    MNC LifeStyle Furniture
                  </div>
                  <div className="text-xs sm:text-[13px] text-[#E9D8C5]/90">
                    Visakhapatnam, Andhra Pradesh, India.
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    <a
                      href="https://www.google.com/maps?q=17.80386734008789,83.2098159790039&z=17&hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D69A4B] hover:text-white font-medium inline-flex items-center gap-1 transition-colors"
                      title="View showroom on Google Maps"
                    >
                      <span>View on Google Maps</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                    <span className="text-white/20">•</span>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=17.80386734008789,83.2098159790039"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D69A4B] hover:text-white font-medium inline-flex items-center gap-1 transition-colors"
                      title="Get directions to showroom"
                    >
                      <Navigation className="w-3 h-3 text-[#D69A4B]" />
                      <span>Get Directions</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Direct Telephone */}
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D69A4B] shrink-0" />
                <a
                  href={`tel:${businessConfig.contact.phoneRaw}`}
                  className="hover:text-[#D69A4B] transition-colors font-medium text-white"
                  title="Call MNC LifeStyle"
                >
                  {businessConfig.contact.phone}
                </a>
              </div>

              {/* WhatsApp Enquiry */}
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <a
                  href="https://wa.me/918790943457"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors font-medium text-white"
                  title="Message on WhatsApp"
                >
                  WhatsApp Enquiry:{' '}
                  <span className="text-[#25D366] font-bold">{businessConfig.contact.displayPhone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* COLUMN 2 – FURNITURE CATEGORIES (4 COLS) */}
          <div className="lg:col-span-4">
            <h5 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D69A4B] mb-5 font-sans">
              FURNITURE CATEGORIES
            </h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:text-[13px] text-[#E9D8C5] font-sans">
              <div className="space-y-1">
                {leftFooterCategories.map((cat) => (
                  <div key={cat.slug || cat.id}>
                    <Link
                      to={`/category/${cat.slug || cat.id}`}
                      className="hover:text-[#D69A4B] transition-colors py-1 block"
                    >
                      {cat.name}
                    </Link>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {rightFooterCategories.map((cat) => (
                  <div key={cat.slug || cat.id}>
                    <Link
                      to={`/category/${cat.slug || cat.id}`}
                      className="hover:text-[#D69A4B] transition-colors py-1 block"
                    >
                      {cat.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3">
              <Link
                to="/shop"
                className="text-[#D69A4B] hover:text-white transition-colors text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <span>View All Categories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* COLUMN 3 – ABOUT & SERVICES (3 COLS) */}
          <div className="lg:col-span-3">
            <h5 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D69A4B] mb-5 font-sans">
              ABOUT & SERVICES
            </h5>
            <ul className="space-y-2 text-xs sm:text-[13px] text-[#E9D8C5] font-sans">
              <li>
                <Link to="/about" className="hover:text-[#D69A4B] transition-colors py-0.5 block">
                  About MNC LifeStyle
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#D69A4B] transition-colors py-0.5 block">
                  Our Heritage & Timber
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-[#D69A4B] transition-colors py-0.5 block">
                  Curated Collections
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#D69A4B] transition-colors py-0.5 block">
                  Visakhapatnam Experience Centre
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#D69A4B] transition-colors py-0.5 block">
                  Interior Consultation
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#D69A4B] transition-colors py-0.5 block">
                  Bespoke Sizing & Customization
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#D69A4B] transition-colors py-0.5 block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

        </ScrollReveal>

        {/* 3. COPYRIGHT AND LEGAL FOOTER */}
        <div className="pt-8 border-t border-white/12 flex flex-col sm:flex-row items-center justify-between text-xs text-[#C9BBAE] gap-4 font-sans">
          <p>© 2026 MNC LifeStyle Furniture. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-xs">
            <Link to="/contact" className="hover:text-[#D69A4B] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/20">|</span>
            <Link to="/contact" className="hover:text-[#D69A4B] transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-white/20">|</span>
            <Link to="/contact" className="hover:text-[#D69A4B] transition-colors">
              Care & Maintenance
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
