'use client';
import React from 'react';
import { Link } from '@/lib/router-bridge';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { businessConfig } from '../data/businessConfig';

export default function AnnouncementBar() {
  const { contact } = businessConfig;

  return (
    <div className="hidden lg:block bg-[#211710] text-[#F8F0E8] border-b border-white/10 select-none">
      <div className="max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-[52px] h-[49px] flex items-center justify-between gap-4">
        
        {/* Left Side: Real Business Contact Details */}
        <div className="flex items-center flex-wrap gap-x-5 text-xs text-[#F8F0E8] font-sans">
          
          {/* Location */}
          <div className="inline-flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-white/90 shrink-0" />
            <span className="font-medium tracking-wide">{contact.location}</span>
          </div>

          <span className="hidden sm:inline text-white/30" aria-hidden="true">|</span>

          {/* Phone */}
          <a
            href={`tel:${contact.phoneRaw}`}
            className="inline-flex items-center gap-2 hover:text-[#D69A4B] transition-colors"
            title="Call MNC LifeStyle"
          >
            <Phone className="w-3.5 h-3.5 text-white/90 shrink-0" />
            <span className="font-medium tracking-wide">{contact.phone}</span>
          </a>

          <span className="hidden md:inline text-white/30" aria-hidden="true">|</span>

          {/* Email */}
          <a
            href={`mailto:${contact.email}`}
            className="hidden md:inline-flex items-center gap-2 hover:text-[#D69A4B] transition-colors"
            title="Email MNC LifeStyle"
          >
            <Mail className="w-3.5 h-3.5 text-white/90 shrink-0" />
            <span className="font-medium tracking-wide">{contact.email}</span>
          </a>
        </div>

        {/* Right Side: Gold Pill Consultation Button */}
        <div className="shrink-0 ml-auto">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#D69A4B] hover:bg-[#e2ac65] text-[#211710] text-xs font-semibold rounded-full transition-all duration-200 shadow-xs group whitespace-nowrap"
          >
            <span>{contact.consultationCta}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
}
