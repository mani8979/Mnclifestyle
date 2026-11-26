'use client';
import React, { useState, useEffect } from 'react';
import { Link } from '@/lib/router-bridge';
import Hero from '../components/Hero';
import CategoryGrid from '../components/CategoryGrid';
import SectionHeading from '../components/SectionHeading';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { businessConfig } from '../data/businessConfig';
import { getWhatsAppConsultationUrl } from '../utils/whatsapp';
import {
  ArrowRight,
  Compass,
  ShieldCheck,
  Sparkles,
  Feather,
  LayoutGrid,
  Hourglass,
  Sliders,
  Star,
  Quote,
  MessageCircle,
  Truck,
  CheckCircle2
} from 'lucide-react';

export default function Home({ initialProducts, initialCategories }) {
  const [liveProducts, setLiveProducts] = useState(
    initialProducts && initialProducts.length > 0 ? initialProducts : products
  );
  const [liveCategories, setLiveCategories] = useState(
    initialCategories && initialCategories.length > 0 ? initialCategories : categories
  );

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setLiveProducts(initialProducts);
    }
  }, [initialProducts]);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setLiveCategories(initialCategories);
    }
  }, [initialCategories]);

  useEffect(() => {
    fetch('/api/products?limit=20')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.products) && d.products.length > 0) {
          setLiveProducts(d.products);
        }
      })
      .catch(() => {});

    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.categories) && d.categories.length > 0) {
          setLiveCategories(d.categories);
        }
      })
      .catch(() => {});
  }, []);

  const bestsellers = liveProducts.filter((p) => Boolean(p.isBestseller)).slice(0, 4);
  const featuredPieces = liveProducts.filter((p) => p.isFeatured).slice(0, 4);
  const whatsappConsultationUrl = getWhatsAppConsultationUrl('Custom Living Room Consultation');

  const testimonials = [
    {
      name: 'Dr. Suresh & Radhika Varma',
      location: 'Siripuram, Visakhapatnam',
      comment: 'We furnished our new sea-facing apartment in Vizag with MNC LifeStyle. The solid teakwood craftsmanship and Belgian bouclé fabric on our curved sofa are breathtaking. The white-glove delivery team arrived on time, assembled everything, and removed all packaging.',
      rating: 5,
      piece: 'Aura Curved Bouclé Sofa & Kanso Travertine Table'
    },
    {
      name: 'Ananya & Karthik Reddy',
      location: 'Jubilee Hills, Hyderabad',
      comment: 'Ordering through WhatsApp was extraordinarily convenient. The design concierge shared video swatches of teak finishes and coordinated transit directly to Hyderabad. Zero hassle, impeccable quality.',
      rating: 5,
      piece: 'Valen Teak Dining Suite (6-Seater)'
    },
    {
      name: 'Rohan Mehra',
      location: 'Indiranagar, Bengaluru',
      comment: 'Finding genuine solid hardwood furniture with modern Scandinavian proportions in India is rare. The Kyoto bed frame and fluted credenza have transformed my bedroom sanctuary.',
      rating: 5,
      piece: 'Kyoto Platform Bed & Paloma Credenza'
    }
  ];

  return (
    <div className="pb-16 sm:pb-20">
      {/* 1. Hero Section (Includes the 49px top bar, 109px nav, 674px split hero with clean living room photo, and 109px benefits strip) */}
      <Hero />

      {/* 2. Shop by Categories (Immediately below hero benefits strip with clean spacing) */}
      <CategoryGrid categories={liveCategories} />

      <div className="space-y-10 sm:space-y-14 mt-8 sm:mt-12">
        {/* 3. Bestselling Furniture */}
        <section className="max-w-[1672px] mx-auto px-3 sm:px-8 lg:px-[50px]">
        <SectionHeading
          subtitle="Celebrated Works"
          title="Bestselling Furniture"
          description="Explore our most cherished pieces, refined through continuous dialogue with Indian homeowners and handcrafted with timeless integrity."
          linkText="View Complete Catalog"
          linkTo="/shop"
          align="left"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {bestsellers.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>

        {/* View More Products Button */}
        <div className="mt-8 sm:mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#211710] hover:bg-[#D69A4B] text-[#F8F0E8] hover:text-[#211710] text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
          >
            <span>View More</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        </div>
      </section>

      {/* Why Choose MNC LifeStyle? */}
      <section className="max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-[50px]">
        <SectionHeading
          subtitle="Distinction in Detail"
          title="Why Choose MNC LifeStyle?"
          description="Every piece we create is anchored in thoughtful principles designed to stand apart from mass-produced trends."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <ScrollReveal staggerIndex={0} className="h-full">
            <div className="bg-white p-8 rounded-2xl border border-[#E9D8C5] shadow-soft hover:shadow-luxury hover:border-[#D69A4B]/60 transition-all duration-300 h-full">
              <div className="w-12 h-12 rounded-xl bg-[#F8F0E8] flex items-center justify-center text-[#D69A4B] mb-5">
                <Compass className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#211A15] mb-2.5">
                Thoughtful Proportion
              </h3>
              <p className="text-xs sm:text-sm text-[#38302A] leading-relaxed font-sans">
                Every curve, bevel, and dimension is tuned for Indian homes, creating harmonious spaces that feel open, welcoming, and uncluttered.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal staggerIndex={1} className="h-full">
            <div className="bg-white p-8 rounded-2xl border border-[#E9D8C5] shadow-soft hover:shadow-luxury hover:border-[#D69A4B]/60 transition-all duration-300 h-full">
              <div className="w-12 h-12 rounded-xl bg-[#F8F0E8] flex items-center justify-center text-[#D69A4B] mb-5">
                <LayoutGrid className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#211A15] mb-2.5">
                Solid Hardwood Integrity
              </h3>
              <p className="text-xs sm:text-sm text-[#38302A] leading-relaxed font-sans">
                Seasoned CP Teakwood, Indian Sheesham, and European White Oak treated against coastal humidity and termites for decades of durability.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal staggerIndex={2} className="h-full">
            <div className="bg-white p-8 rounded-2xl border border-[#E9D8C5] shadow-soft hover:shadow-luxury hover:border-[#D69A4B]/60 transition-all duration-300 h-full">
              <div className="w-12 h-12 rounded-xl bg-[#F8F0E8] flex items-center justify-center text-[#D69A4B] mb-5">
                <Truck className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#211A15] mb-2.5">
                White-Glove In-Home Placement
              </h3>
              <p className="text-xs sm:text-sm text-[#38302A] leading-relaxed font-sans">
                Complimentary scheduled delivery across Andhra Pradesh & Telangana with two-person placement, leveling, and packaging removal.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal staggerIndex={3} className="h-full">
            <div className="bg-white p-8 rounded-2xl border border-[#E9D8C5] shadow-soft hover:shadow-luxury hover:border-[#D69A4B]/60 transition-all duration-300 h-full">
              <div className="w-12 h-12 rounded-xl bg-[#F8F0E8] flex items-center justify-center text-[#D69A4B] mb-5">
                <Hourglass className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#211A15] mb-2.5">
                Timeless Aesthetics
              </h3>
              <p className="text-xs sm:text-sm text-[#38302A] leading-relaxed font-sans">
                We reject fast furniture fads. Our pieces age with grace, acquiring a warm, rich patina that enriches your home for generations.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal staggerIndex={4} className="h-full">
            <div className="bg-white p-8 rounded-2xl border border-[#E9D8C5] shadow-soft hover:shadow-luxury hover:border-[#D69A4B]/60 transition-all duration-300 h-full">
              <div className="w-12 h-12 rounded-xl bg-[#F8F0E8] flex items-center justify-center text-[#D69A4B] mb-5">
                <Sliders className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#211A15] mb-2.5">
                WhatsApp Concierge Service
              </h3>
              <p className="text-xs sm:text-sm text-[#38302A] leading-relaxed font-sans">
                Order directly via WhatsApp with a senior design consultant to verify pin code delivery, customize fabric options, or scale dimensions.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal staggerIndex={5} className="h-full">
            <div className="bg-white p-8 rounded-2xl border border-[#E9D8C5] shadow-soft hover:shadow-luxury hover:border-[#D69A4B]/60 transition-all duration-300 h-full">
              <div className="w-12 h-12 rounded-xl bg-[#F8F0E8] flex items-center justify-center text-[#D69A4B] mb-5">
                <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#211A15] mb-2.5">
                10-Year Craftsmanship Guarantee
              </h3>
              <p className="text-xs sm:text-sm text-[#38302A] leading-relaxed font-sans">
                Covers traditional mortise-and-tenon structural joints, termite protection, and internal suspension under normal residential use.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 8. Customer Testimonials */}
      <section className="bg-[#F8F0E8] py-10 sm:py-14 border-y border-[#E9D8C5]">
        <div className="max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-[50px]">
          <SectionHeading
            subtitle="Voices of Distinction"
            title="What Indian Homeowners Say"
            description="Hear from families who have elevated their residences with MNC LifeStyle bespoke furniture."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((t, idx) => (
              <ScrollReveal
                key={idx}
                staggerIndex={idx}
                className="h-full"
              >
                <div className="bg-white p-8 rounded-2xl border border-[#E9D8C5] shadow-soft hover:shadow-luxury hover:border-[#D69A4B]/60 transition-all duration-300 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-1 text-[#D69A4B] mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D69A4B]" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-[#211A15] leading-relaxed mb-6 font-sans italic">
                      "{t.comment}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E9D8C5]/60">
                    <h4 className="font-serif text-base font-semibold text-[#211A15]">{t.name}</h4>
                    <p className="text-xs text-[#D69A4B] font-medium">{t.location}</p>
                    <p className="text-[11px] text-[#77736D] mt-1">Purchased: {t.piece}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Direct Call to Action with WhatsApp Consultation */}
      <ScrollReveal as="section" className="max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-[50px]">
        <div className="relative rounded-3xl overflow-hidden bg-[#211710] text-[#F8F0E8] p-8 sm:p-14 lg:p-20 text-center shadow-luxury">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D69A4B] mb-3 block">
              Start Your Living Room Project
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-normal tracking-tight mb-4 leading-tight">
              Let's Create a Space You'll Love.
            </h2>
            <p className="text-sm sm:text-base text-[#E9D8C5] mb-8 font-sans leading-relaxed">
              Find furniture that reflects your taste and transforms everyday living. Our Visakhapatnam design consultants are available on WhatsApp for personalized space styling, fabric swatches, and custom dimensions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={whatsappConsultationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs uppercase tracking-widest font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp (+91 87909 43457)</span>
              </a>
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest font-semibold rounded-lg transition-colors border border-white/20"
              >
                Browse All 12 Categories
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>
      </div>
    </div>
  );
}
