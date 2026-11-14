import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CategoryGrid() {
  return (
    <section className="max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-[50px] pt-6 sm:pt-8 pb-4 sm:pb-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 pb-3 border-b border-[#E9D8C5]">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#D69A4B] font-bold block mb-2">
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
      </div>

      {/* 12-Category Grid: 6 cols on desktop, 3-4 cols on tablet, 2 cols on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className="group flex flex-col items-center bg-white rounded-2xl p-3 sm:p-4 border border-[#E9D8C5]/80 shadow-2xs hover:shadow-luxury hover:border-[#D69A4B]/60 transition-all duration-300"
          >
            {/* Image Circle / Rounded Container */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#F8F0E8] mb-3">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
            </div>

            {/* Category Name */}
            <h3 className="font-serif text-sm sm:text-base font-semibold text-[#211A15] text-center group-hover:text-[#D69A4B] transition-colors leading-tight">
              {cat.name}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

