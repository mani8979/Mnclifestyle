'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/lib/router-bridge';
import { Home, ArrowRight, Sparkles, ShieldCheck, Truck, Sofa, Headphones } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
const heroBg = '/hero-bg.webp';

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* 1. Main Hero Desktop Section (Height approx 650px on desktop) */}
      <div className="relative min-h-[520px] sm:min-h-[580px] lg:h-[650px] flex items-center justify-start overflow-hidden">

        {/* Full-width Realistic Interior Photograph Background */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={heroBg}
            alt="MNC Lifestyle luxurious modern living room featuring beige sectional sofa, marble coffee table and gold accents"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_center] sm:object-[72%_center] lg:object-center select-none"
          />

          {/* Desktop Left Split Subtle Gradient Overlay for Text Readability */}
          <div
            className="absolute inset-y-0 left-0 w-full lg:w-[46%] bg-gradient-to-r from-[#211710]/80 via-[#211710]/35 to-transparent pointer-events-none hidden md:block"
            aria-hidden="true"
          />

          {/* Mobile Dark Gradient Overlay for Maximum Text Readability */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#18100A]/95 via-[#211710]/85 via-[58%] to-[#211710]/25 md:hidden pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-black/40 via-black/20 to-transparent md:hidden pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {/* Hero Editorial Content (max width approx 650px, aligned left, vertically centered) */}
        <div className="relative z-10 max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-[50px] w-full flex items-center">
          <div className="max-w-xl lg:max-w-[650px] py-8 sm:py-10 lg:py-0 w-full">
            {/* Small Outlined Gold Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full border border-[#D99B45] text-[#D99B45] bg-[#211710]/70 backdrop-blur-xs mb-3.5 sm:mb-7 shadow-xs">
              <Home className="w-3.5 h-3.5 text-[#D99B45] stroke-[2] shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-[#D99B45]">
                DESIGNED FOR THE WAY YOU LIVE
              </span>
            </div>

            {/* Main Editorial Serif Heading */}
            <h1 className="font-serif text-[32px] min-[375px]:text-[34px] min-[390px]:text-[36px] min-[414px]:text-[38px] sm:text-5xl lg:text-[62px] xl:text-[66px] font-normal text-white leading-[1.12] sm:leading-[1.08] tracking-tight mb-3 sm:mb-5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
              <span className="block text-white">
                Elevate Your Space.
              </span>
              <span className="block italic text-[#D99B45] font-light mt-0.5 sm:mt-0">
                Define Your Lifestyle.
              </span>
            </h1>

            {/* Description: 14-16px on mobile, readable, comfortable max-w */}
            <p className="text-[14px] min-[390px]:text-[15px] sm:text-base lg:text-[17px] text-[#F8F0E8] font-light leading-relaxed mb-6 sm:mb-9 max-w-lg font-sans drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
              Discover thoughtfully designed furniture that brings comfort, elegance and character into every corner of your home.
            </p>

            {/* Action Buttons: Stacked nicely on mobile without overflowing */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-sm sm:max-w-none">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#D99B45] hover:bg-[#e2ac65] text-[#211710] text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl group text-center"
              >
                <span>Explore Furniture</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Three Small Trust Indicators Under Buttons with Gold Outline Icons */}
            <div className="mt-6 sm:mt-10 pt-1 sm:pt-2 flex flex-wrap items-center gap-4 sm:gap-8 text-[#F8F0E8]/90 text-[11px] sm:text-xs font-sans drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              <div className="inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D99B45] shrink-0 stroke-[1.75]" />
                <span className="tracking-wide">Premium Quality</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D99B45] shrink-0 stroke-[1.75]" />
                <span className="tracking-wide">Trusted Choice</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D99B45] shrink-0 stroke-[1.75]" />
                <span className="tracking-wide">Pan India Delivery</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Bottom Benefits Strip Directly Below Hero */}
      <ScrollReveal
        as="div"
        className="bg-[#F8F0E8] border-b border-[#E9D8C5] min-h-[90px] lg:h-[109px] flex items-center py-5 lg:py-0"
        delay={180}
        duration={750}
      >
        <div className="max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-[50px] w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 lg:gap-0 items-center">

            {/* Column 1: Premium Quality Furniture */}
            <div className="col-span-1 lg:pr-8 flex items-center gap-3.5">
              <div className="shrink-0">
                <Sofa className="w-7 h-7 sm:w-8 sm:h-8 text-[#211A15] stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-[13px] font-semibold text-[#211A15] leading-tight">
                  Premium Quality
                </h4>
                <p className="text-[11px] sm:text-xs text-[#77736D] mt-0.5">
                  Furniture
                </p>
              </div>
            </div>

            {/* Column 2: Trusted Choice Across India */}
            <div className="col-span-1 lg:px-8 lg:border-l lg:border-[#DDD3C4] flex items-center gap-3.5">
              <div className="shrink-0">
                <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#211A15] stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-[13px] font-semibold text-[#211A15] leading-tight">
                  Trusted Choice
                </h4>
                <p className="text-[11px] sm:text-xs text-[#77736D] mt-0.5">
                  Across India
                </p>
              </div>
            </div>

            {/* Column 3: Pan India Delivery */}
            <div className="col-span-1 lg:px-8 lg:border-l lg:border-[#DDD3C4] flex items-center gap-3.5">
              <div className="shrink-0">
                <Truck className="w-7 h-7 sm:w-8 sm:h-8 text-[#211A15] stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-[13px] font-semibold text-[#211A15] leading-tight">
                  Pan India
                </h4>
                <p className="text-[11px] sm:text-xs text-[#77736D] mt-0.5">
                  Delivery
                </p>
              </div>
            </div>

            {/* Column 4: Dedicated Support Always Here */}
            <div className="col-span-1 lg:pl-8 lg:border-l lg:border-[#DDD3C4] flex items-center gap-3.5">
              <div className="shrink-0">
                <Headphones className="w-7 h-7 sm:w-8 sm:h-8 text-[#211A15] stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-[13px] font-semibold text-[#211A15] leading-tight">
                  Dedicated Support
                </h4>
                <p className="text-[11px] sm:text-xs text-[#77736D] mt-0.5">
                  Always Here
                </p>
              </div>
            </div>

          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
