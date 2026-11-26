'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/lib/router-bridge';
import SectionHeading from '../components/SectionHeading';
import ScrollReveal from '../components/ScrollReveal';
import { businessConfig } from '../data/businessConfig';
import { getWhatsAppConsultationUrl } from '../utils/whatsapp';
import { ShieldCheck, Compass, Sparkles, Check, ArrowRight, Award, MessageCircle } from 'lucide-react';

export default function About() {
  const whatsappUrl = getWhatsAppConsultationUrl('About Page Studio Consultation');

  return (
    <div className="py-8 sm:py-14 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[50px]">

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-[#766B61] mb-4 sm:mb-6">
          <Link to="/" className="hover:text-[#211710] transition-colors">Home</Link>
          <span className="text-[#DDD3C4]">/</span>
          <span className="text-[#211710] font-medium">About MNC LifeStyle</span>
        </div>

        {/* Hero Editorial Narrative */}
        <ScrollReveal className="max-w-4xl mx-auto text-center mb-10 sm:mb-14" delay={50}>
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#855214] block mb-2.5">
            Our Heritage & Craftsmanship
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] text-[#211A15] font-normal tracking-tight leading-[1.15] mb-4 sm:mb-5">
            Furniture Conceived for Quiet Luxury and Contemporary Indian Living.
          </h1>
          <p className="text-sm sm:text-base text-[#38302A] font-normal leading-relaxed max-w-2xl mx-auto font-sans">
            At MNC LifeStyle, based in Visakhapatnam, Andhra Pradesh, we believe the home is a living canvas for personal calm. We design furniture that balances architectural restraint with tactile warmth.
          </p>
        </ScrollReveal>

        {/* Editorial Photo Spread */}
        <ScrollReveal className="relative rounded-3xl overflow-hidden shadow-luxury mb-12 sm:mb-16 aspect-[16/9] sm:aspect-[21/9] bg-[#E9D8C5] max-w-5xl mx-auto border border-[#E9D8C5]" delay={100}>
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85"
            alt="MNC LifeStyle Studio & Showroom"
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#211710]/15" />
        </ScrollReveal>

        {/* Brand Story 2-Column */}
        <ScrollReveal className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center mb-14 sm:mb-18 max-w-5xl mx-auto">
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            <span className="text-xs uppercase tracking-[0.25em] text-[#855214] font-semibold block">
              The Journey
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] text-[#211A15] font-medium leading-tight">
              Bridging Architectural Discipline with Everyday Comfort.
            </h2>
            <p className="text-xs sm:text-sm text-[#38302A] leading-relaxed font-sans">
              Founded on the belief that everyday living deserves intentional, enduring beauty, MNC LifeStyle originated as a specialized interior woodcraft atelier. While mass manufacturing pursued disposable particleboard convenience, we chose the disciplined path of seasoned Indian Teakwood, legal Sheesham, Roman travertine stone, and slow craftsmanship.
            </p>
            <p className="text-xs sm:text-sm text-[#38302A] leading-relaxed font-sans">
              Our designs reject arbitrary ornamentation in favor of unpretentious lines, traditional mortise-and-tenon joinery, and tactile surfaces that awaken the senses. Each sofa, credenza, and dining table is crafted to age with dignity, gathering memories alongside the families who live with them.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#E9D8C5]/30 p-6 sm:p-9 rounded-3xl border border-[#E9D8C5] space-y-5">
              <h3 className="font-serif text-xl sm:text-2xl text-[#211A15] font-medium">Core Brand Pillars</h3>

              <div className="space-y-4">
                <div className="flex gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#D69A4B]/20 text-[#D69A4B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#211A15] uppercase tracking-wider">Authentic Solid Timbers</h4>
                    <p className="text-xs text-[#766B61] mt-1 leading-relaxed">
                      Seasoned Central Province Teakwood, Indian Rosewood (Sheesham), Italian Roman travertine stone, and heavy Belgian wool bouclé.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#D69A4B]/20 text-[#D69A4B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#211A15] uppercase tracking-wider">Climate-Tuned Engineering</h4>
                    <p className="text-xs text-[#766B61] mt-1 leading-relaxed">
                      Kiln-dried moisture levels (8–10%) and anti-termite treatments engineered specifically for tropical and coastal Indian climates.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#D69A4B]/20 text-[#D69A4B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#211A15] uppercase tracking-wider">Ethical Stewardship & Warranty</h4>
                    <p className="text-xs text-[#766B61] mt-1 leading-relaxed">
                      Certified government timber depots, zero-VOC plant wax finishes, and an unequivocal 10-Year Craftsmanship Guarantee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Transition Divider */}
        <div className="max-w-5xl mx-auto my-8 sm:my-10">
          <div className="h-px bg-gradient-to-r from-transparent via-[#D69A4B]/40 to-transparent" />
        </div>

        {/* Artisan Workshop Section (Dark Section with Balanced Transition) */}
        <ScrollReveal className="bg-[#211710] text-[#F8F0E8] rounded-3xl p-6 sm:p-12 lg:p-14 mb-14 sm:mb-18 shadow-elevated max-w-5xl mx-auto border border-[#49301F]">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#D69A4B] font-semibold block mb-2">
              Our Master Craftspeople
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-medium mb-3">
              Where Ancient Joinery Meets Contemporary Form
            </h2>
            <p className="text-xs sm:text-sm text-[#E9D8C5]/85 leading-relaxed font-sans">
              Every curve is hand-finished by master woodcrafters using mortise-and-tenon joints, blind miters, and butterfly keys that allow the timber to breathe through seasonal humidity shifts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center border-t border-white/10 pt-8 sm:pt-10">
            <div>
              <span className="font-serif text-3xl sm:text-4xl font-light text-[#D69A4B]">100%</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-white mt-1">Kiln-Dried Hardwood</p>
              <p className="text-[11px] text-[#E9D8C5]/70 mt-1">Prevents warping, splitting, and joint tension over decades</p>
            </div>
            <div>
              <span className="font-serif text-3xl sm:text-4xl font-light text-[#D69A4B]">10-Year</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-white mt-1">Craftsmanship Guarantee</p>
              <p className="text-[11px] text-[#E9D8C5]/70 mt-1">Hardwood mortise-and-tenon structural framing policy</p>
            </div>
            <div>
              <span className="font-serif text-3xl sm:text-4xl font-light text-[#D69A4B]">Zero</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-white mt-1">Particleboard or MDF</p>
              <p className="text-[11px] text-[#E9D8C5]/70 mt-1">Only authentic structural timbers and honed geological stones</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Call to Action */}
        <ScrollReveal className="text-center max-w-2xl mx-auto">
          <h3 className="font-serif text-2xl sm:text-3xl text-[#211A15] font-medium mb-3">
            Experience MNC LifeStyle in Person
          </h3>
          <p className="text-xs sm:text-sm text-[#766B61] mb-6 sm:mb-8 font-sans">
            Visit our Flagship Experience Centre in Visakhapatnam or connect directly with our interior styling consultants on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs uppercase tracking-widest font-bold rounded-xl transition-colors shadow-soft flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat on WhatsApp</span>
            </a>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-[#E9D8C5] text-[#211A15] text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-[#F8F0E8] transition-colors text-center"
            >
              Explore Full Catalog
            </Link>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
