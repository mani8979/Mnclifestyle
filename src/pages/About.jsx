import React from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import { businessConfig } from '../data/businessConfig';
import { getWhatsAppConsultationUrl } from '../utils/whatsapp';
import { ShieldCheck, Compass, Sparkles, Check, ArrowRight, Award, Heart, MessageCircle } from 'lucide-react';

export default function About() {
  const whatsappUrl = getWhatsAppConsultationUrl('About Page Studio Consultation');

  return (
    <div className="py-12 sm:py-20 pb-28">
      <div className="max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-[50px]">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-warmgrey mb-6">
          <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">About MNC LifeStyle</span>
        </div>

        {/* Hero Editorial Narrative */}
        <div className="max-w-4xl mx-auto text-center mb-16 sm:mb-24">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D69A4B] block mb-3">
            Our Heritage & Craftsmanship
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#211A15] font-normal tracking-tight leading-[1.1] mb-6">
            Furniture Conceived for Quiet Luxury and Contemporary Indian Living.
          </h1>
          <p className="text-base sm:text-lg text-[#38302A] font-normal leading-relaxed max-w-2xl mx-auto font-sans">
            At MNC LifeStyle, based in Visakhapatnam, Andhra Pradesh, we believe the home is a living canvas for personal calm. We design furniture that balances architectural restraint with tactile warmth.
          </p>
        </div>

        {/* Editorial Photo Spread */}
        <div className="relative rounded-3xl overflow-hidden shadow-elevated mb-24 aspect-[16/9] sm:aspect-[21/9] bg-beige-300 max-w-6xl mx-auto">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85"
            alt="MNC LifeStyle Studio & Showroom"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#211710]/20" />
        </div>

        {/* Brand Story 2-Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-28 max-w-6xl mx-auto">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D69A4B] font-semibold block">
              The Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#211A15] font-medium leading-tight">
              Bridging Architectural Discipline with Everyday Comfort.
            </h2>
            <p className="text-[15px] sm:text-base text-[#38302A] leading-relaxed font-sans">
              Founded on the belief that everyday living deserves intentional, enduring beauty, MNC LifeStyle originated as a specialized interior woodcraft atelier. While mass manufacturing pursued disposable particleboard convenience, we chose the disciplined path of seasoned Indian Teakwood, legal Sheesham, Roman travertine stone, and slow craftsmanship.
            </p>
            <p className="text-[15px] sm:text-base text-[#38302A] leading-relaxed font-sans">
              Our designs reject arbitrary ornamentation in favor of unpretentious lines, traditional mortise-and-tenon joinery, and tactile surfaces that awaken the senses. Each sofa, credenza, and dining table is crafted to age with dignity, gathering memories alongside the families who live with them.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#E9D8C5]/30 p-8 sm:p-12 rounded-3xl border border-[#E9D8C5] space-y-6">
              <h3 className="font-serif text-2xl text-[#211A15] font-medium">Core Brand Pillars</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#D69A4B]/20 text-[#D69A4B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#211A15] uppercase tracking-wider">Authentic Solid Timbers</h4>
                    <p className="text-xs text-[#77736D] mt-1">
                      Seasoned Central Province Teakwood, Indian Rosewood (Sheesham), Italian Roman travertine stone, and heavy Belgian wool bouclé.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#D69A4B]/20 text-[#D69A4B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#211A15] uppercase tracking-wider">Climate-Tuned Engineering</h4>
                    <p className="text-xs text-[#77736D] mt-1">
                      Kiln-dried moisture levels (8–10%) and anti-termite treatments engineered specifically for tropical and coastal Indian climates.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#D69A4B]/20 text-[#D69A4B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#211A15] uppercase tracking-wider">Ethical Stewardship & Warranty</h4>
                    <p className="text-xs text-[#77736D] mt-1">
                      Certified government timber depots, zero-VOC plant wax finishes, and an unequivocal 10-Year Craftsmanship Guarantee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Artisan Workshop Section */}
        <div className="bg-[#211710] text-[#F8F0E8] rounded-3xl p-8 sm:p-16 mb-28 shadow-elevated max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D69A4B] font-semibold block mb-2">
              Our Master Craftspeople
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-medium mb-4">
              Where Ancient Joinery Meets Contemporary Form
            </h2>
            <p className="text-xs sm:text-sm text-[#E9D8C5]/80 leading-relaxed">
              Every curve is hand-finished by master woodcrafters using mortise-and-tenon joints, blind miters, and butterfly keys that allow the timber to breathe through seasonal humidity shifts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center border-t border-white/10 pt-10">
            <div>
              <span className="font-serif text-4xl font-light text-[#D69A4B]">100%</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-white mt-1">Kiln-Dried Hardwood</p>
              <p className="text-[11px] text-[#E9D8C5]/70 mt-1">Prevents warping, splitting, and joint tension over decades</p>
            </div>
            <div>
              <span className="font-serif text-3xl sm:text-4xl font-light text-[#D69A4B]">10-Year</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-white mt-1">Craftsmanship Guarantee</p>
              <p className="text-[11px] text-[#E9D8C5]/70 mt-1">Hardwood mortise-and-tenon structural framing policy</p>
            </div>
            <div>
              <span className="font-serif text-4xl font-light text-[#D69A4B]">Zero</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-white mt-1">Particleboard or MDF</p>
              <p className="text-[11px] text-[#E9D8C5]/70 mt-1">Only authentic structural timbers and honed geological stones</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="font-serif text-3xl text-charcoal font-medium mb-4">
            Experience MNC LifeStyle in Person
          </h3>
          <p className="text-sm text-warmgrey mb-8">
            Visit our Flagship Experience Centre in Visakhapatnam or connect directly with our interior styling consultants on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs uppercase tracking-widest font-bold rounded-lg transition-colors shadow-soft flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat on WhatsApp</span>
            </a>
            <Link
              to="/shop"
              className="px-8 py-3.5 bg-white border border-beige-300 text-charcoal text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-beige-100 transition-colors"
            >
              Explore Full Collection
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
