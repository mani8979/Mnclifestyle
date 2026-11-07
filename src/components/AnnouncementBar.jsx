import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-espresso text-ivory-100 text-xs py-2 px-4 border-b border-white/10 tracking-widest uppercase transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] sm:text-xs">
        <div className="hidden sm:flex items-center gap-2 text-bronze-light">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Handcrafted Luxury Furniture</span>
        </div>
        <div className="mx-auto sm:mx-0 text-center font-medium">
          Discover Furniture That Defines Your Lifestyle
          <span className="hidden md:inline text-warmgrey-light ml-2 font-normal">
            — Complimentary White-Glove In-Home Delivery
          </span>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-ivory-200 hover:text-bronze-light transition-colors cursor-pointer">
            Explore 2026 Lookbook
          </span>
        </div>
      </div>
    </div>
  );
}

