'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/lib/router-bridge';
import { categories } from '../data/categories';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { getSafeImageSrc, shouldUnoptimizeImage } from '../utils/image';
import FormattedTitle from './shared/FormattedTitle';

export default function CategoryGrid({ categories: customCategories }) {
  const allCategories = customCategories && customCategories.length > 0 ? customCategories : categories;
  return (
    <section className="max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-[50px] pt-6 sm:pt-8 pb-4 sm:pb-6">
      {/* Section Header */}
      <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 pb-3 border-b border-[#E9D8C5]">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#855214] font-bold block mb-2">
            Curated For Indian Homes
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#211A15] font-normal tracking-tight">
            Shop by Category
          </h2>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#211A15] hover:text-[#D69A4B] transition-colors pb-0.5 border-b border-[#211A15]/40 hover:border-[#D69A4B]"
        >
          <span>Explore All Collections</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </ScrollReveal>

      {/* 12-Category Grid: 6 cols on desktop, 3-4 cols on tablet, 2 cols on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {allCategories.map((cat, idx) => {
          const catImageSrc = getSafeImageSrc(cat.image);
          return (
            <ScrollReveal
              key={cat.id || cat.slug || idx}
              staggerIndex={idx}
              className="h-full"
            >
              <Link
                to={`/category/${cat.slug || cat.id}`}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E9D8C5]/80 shadow-2xs hover:shadow-luxury hover:border-[#D69A4B]/60 transition-all duration-300 h-full"
              >
                {/* Edge-to-Edge Category Image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#F8F0E8] border-b border-[#E9D8C5]/60">
                  <Image
                    src={catImageSrc}
                    alt={cat.name}
                    fill
                    unoptimized={shouldUnoptimizeImage(catImageSrc)}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                </div>

                {/* Category Name */}
                <div className="px-2.5 py-2.5 sm:px-3 sm:py-3 flex-1 flex items-center justify-center">
                  <h3 className="font-serif text-sm sm:text-[15px] font-semibold text-[#211A15] text-center group-hover:text-[#D69A4B] transition-colors leading-tight">
                    <FormattedTitle text={cat.name} />
                  </h3>
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
