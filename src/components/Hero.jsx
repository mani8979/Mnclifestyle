import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Compass, Gem } from 'lucide-react';
import { businessConfig } from '../data/businessConfig';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Full-width Hero Container */}
      <div className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center">
        {/* Background Interior Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85"
            alt="MNC Lifestyle contemporary living room featuring bespoke sofa and travertine table"
            className="w-full h-full object-cover object-center scale-105 animate-in fade-in zoom-in-105 duration-1000"
            priority="true"
          />
          {/* Subtle Dual Editorial Overlay for Text Contrast & Luxury Warmth */}
          <div className="absolute inset-0 bg-charcoal/50 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-black/20" />
        </div>

        {/* Hero Editorial Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
          <div className="max-w-2xl lg:max-w-3xl">
            
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-bronze-light mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em]">
                Designed For The Way You Live
              </span>
            </div>

            {/* Main Editorial Heading */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-white leading-[1.08] tracking-tight mb-6">
              Elevate Your Space.{' '}
              <span className="block font-light italic text-ivory-100">
                Define Your Lifestyle.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg lg:text-xl text-ivory-100/90 font-light leading-relaxed mb-10 max-w-xl font-sans">
              Discover thoughtfully designed furniture that brings comfort, elegance and character into every corner of your home.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/shop"
                className="px-8 py-4 bg-bronze text-white text-xs sm:text-sm uppercase tracking-widest font-semibold rounded-lg hover:bg-bronze-dark transition-all duration-300 shadow-luxury flex items-center justify-center gap-3 group text-center"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>

              <Link
                to="/collections"
                className="px-8 py-4 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs sm:text-sm uppercase tracking-widest font-medium rounded-lg border border-white/40 transition-all duration-300 text-center"
              >
                Discover More
              </Link>
            </div>

            {/* Quick Micro Credentials (Config-driven & non-misleading) */}
            <div className="mt-12 pt-8 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-6 text-white/90 text-xs">
              <div>
                <span className="font-serif text-2xl font-light text-white block">Solid</span>
                <span className="text-ivory-200/80 text-[11px] uppercase tracking-wider">European Hardwoods</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-light text-white block">Verified</span>
                <span className="text-ivory-200/80 text-[11px] uppercase tracking-wider">{businessConfig.warranty.durationLabel}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="font-serif text-2xl font-light text-white block">White-Glove</span>
                <span className="text-ivory-200/80 text-[11px] uppercase tracking-wider">Placement Available</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Trust & Craftsmanship Strip */}
      <div className="bg-espresso text-ivory-100 py-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-bronze-light flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white">Artisan Craft</p>
                <p className="text-[11px] text-warmgrey-light">Mortise & tenon joinery</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-bronze-light flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white">Custom Specification</p>
                <p className="text-[11px] text-warmgrey-light">Finishes tailored to space</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gem className="w-5 h-5 text-bronze-light flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white">Natural Materials</p>
                <p className="text-[11px] text-warmgrey-light">Roman stone & Belgian wool</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-bronze-light flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white">Private Showrooms</p>
                <p className="text-[11px] text-warmgrey-light">Curated studio walkthroughs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

