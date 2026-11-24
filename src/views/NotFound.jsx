'use client';
import React from 'react';
import { Link } from '@/lib/router-bridge';
import { Compass, ArrowRight, Home } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

export default function NotFound() {
  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center min-h-[60vh] flex items-center justify-center">
      <ScrollReveal className="max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#E9D8C5]/60 text-[#855214] flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 stroke-[1.5]" />
        </div>

        <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#855214] font-semibold block mb-2">
          Page Not Located
        </span>

        <h1 className="font-serif text-4xl sm:text-5xl text-[#211A15] font-normal tracking-tight mb-4">
          404 — Design Not Found
        </h1>

        <p className="text-sm sm:text-base text-[#77736D] leading-relaxed mb-8 font-sans">
          The furniture piece or page you are looking for may have been moved, renamed, or is temporarily unavailable in our current Visakhapatnam curation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/shop"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#211710] hover:bg-[#D69A4B] text-[#F8F0E8] hover:text-[#211710] text-xs uppercase tracking-wider font-semibold rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Explore All 12 Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#F8F0E8] text-[#211710] border border-[#E9D8C5] text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-[#855214]" />
            <span>Return to Home</span>
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
