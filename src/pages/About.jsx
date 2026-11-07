import React from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import { businessConfig } from '../data/businessConfig';
import { ShieldCheck, Compass, Sparkles, Check, ArrowRight, Award, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="py-12 sm:py-20 pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-warmgrey mb-6">
          <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">About MNC Lifestyle</span>
        </div>

        {/* Hero Editorial Narrative */}
        <div className="max-w-4xl mx-auto text-center mb-16 sm:mb-24">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-bronze block mb-3">
            Our Heritage & Philosophy
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-charcoal font-normal tracking-tight leading-[1.1] mb-6">
            Furniture Conceived for Quiet Luxury and Contemporary Living.
          </h1>
          <p className="text-base sm:text-xl text-warmgrey font-light leading-relaxed max-w-2xl mx-auto font-sans">
            At MNC Lifestyle, we believe the home is a living canvas for personal calm. We design furniture that balances architectural restraint with tactile warmth.
          </p>
        </div>

        {/* Editorial Photo Spread */}
        <div className="relative rounded-3xl overflow-hidden shadow-elevated mb-24 aspect-[16/9] sm:aspect-[21/9] bg-beige-300">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85"
            alt="MNC Lifestyle Studio & Showroom"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/20" />
        </div>

        {/* Brand Story 2-Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-28">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-bronze font-semibold block">
              The Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-medium leading-tight">
              Bridging Architectural Discipline with Everyday Comfort.
            </h2>
            <p className="text-sm sm:text-base text-warmgrey leading-relaxed font-sans">
              Founded on the belief that everyday living deserves intentional, enduring beauty, MNC Lifestyle originated as an architectural atelier. While mass manufacturing pursued disposable convenience, we chose the disciplined path of solid hardwoods, stone quarrying, and slow craftsmanship.
            </p>
            <p className="text-sm sm:text-base text-warmgrey leading-relaxed font-sans">
              Our designs reject arbitrary ornamentation in favor of unpretentious lines, honest joinery, and tactile surfaces that awaken the senses. Each sofa, credenza, and dining table is crafted to age with dignity, gathering memories alongside the families who live with them.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-beige-200/60 p-8 sm:p-12 rounded-3xl border border-beige-300 space-y-6">
              <h3 className="font-serif text-2xl text-charcoal font-medium">Core Brand Pillars</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-bronze/10 text-bronze flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal uppercase tracking-wider">Uncompromising Materiality</h4>
                    <p className="text-xs text-warmgrey mt-1">
                      Quarter-sawn European white oak, American black walnut, genuine Roman travertine, and heavy Belgian bouclé.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-bronze/10 text-bronze flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal uppercase tracking-wider">Ergonomic Precision</h4>
                    <p className="text-xs text-warmgrey mt-1">
                      Sculpted backrest pitches, multi-density memory cushioning, and seating depths calibrated for effortless comfort.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-bronze/10 text-bronze flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal uppercase tracking-wider">Ethical Stewardship</h4>
                    <p className="text-xs text-warmgrey mt-1">
                      100% FSC-certified renewable timbers, low-VOC natural plant oils, and recyclable packaging on all shipments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Artisan Workshop Section */}
        <div className="bg-espresso text-ivory-100 rounded-3xl p-8 sm:p-16 mb-28 shadow-elevated">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-bronze-light font-semibold block mb-2">
              Our Craftspeople
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-medium mb-4">
              Where Ancient Joinery Meets Contemporary Form
            </h2>
            <p className="text-xs sm:text-sm text-warmgrey-light leading-relaxed">
              Every curve is hand-finished by master woodcrafters using mortise-and-tenon joints, blind miters, and butterfly keys that allow the timber to breathe through seasonal humidity shifts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center border-t border-white/10 pt-10">
            <div>
              <span className="font-serif text-4xl font-light text-bronze-light">100%</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-white mt-1">Kiln-Dried Hardwood</p>
              <p className="text-[11px] text-warmgrey-light mt-1">Prevents warping, splitting, and joint tension over decades</p>
            </div>
            <div>
              <span className="font-serif text-3xl sm:text-4xl font-light text-bronze-light">Assured</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-white mt-1">Structural Guarantee</p>
              <p className="text-[11px] text-warmgrey-light mt-1">Hardwood mortise-and-tenon structural framing policy</p>
            </div>
            <div>
              <span className="font-serif text-4xl font-light text-bronze-light">Zero</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-white mt-1">Particleboard or MDF</p>
              <p className="text-[11px] text-warmgrey-light mt-1">Only authentic structural timbers and honed geological stones</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="font-serif text-3xl text-charcoal font-medium mb-4">
            Experience MNC Lifestyle in Person
          </h3>
          <p className="text-sm text-warmgrey mb-8">
            Schedule a private appointment at one of our design showrooms or speak directly with our interior styling consultants.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-3.5 bg-espresso text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-bronze transition-colors shadow-soft"
            >
              Contact Our Studio
            </Link>
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

