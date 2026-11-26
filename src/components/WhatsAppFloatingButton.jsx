'use client';
import React, { useState } from 'react';
import { useLocation } from '@/lib/router-bridge';
import { getWhatsAppConsultationUrl, WHATSAPP_DISPLAY_PHONE } from '../utils/whatsapp';
import WhatsAppIcon from './shared/WhatsAppIcon';

export default function WhatsAppFloatingButton() {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const whatsappUrl = getWhatsAppConsultationUrl('Floating Concierge Button');
  const isProductPage = location.pathname.startsWith('/product/');

  return (
    <aside
      aria-label="WhatsApp quick contact"
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 items-center gap-3 ${
        isProductPage ? 'hidden lg:flex' : 'flex'
      }`}
    >
      {/* Tooltip on hover (Desktop) */}
      <div
        className={`hidden sm:flex items-center gap-2 bg-[#211710] text-[#F8F0E8] text-xs px-3.5 py-2 rounded-xl shadow-luxury border border-[#E9D8C5]/30 transition-all duration-300 font-sans ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] inline-block" />
        <span className="font-medium">Chat with our Furniture Concierge</span>
      </div>

      {/* Floating Button — Real WhatsApp Official Style & Color */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
        title="Chat with MNC LifeStyle on WhatsApp"
        aria-label={`Chat with us on WhatsApp at ${WHATSAPP_DISPLAY_PHONE}`}
      >
        {/* Subtle Ping Pulse Effect */}
        <span className="absolute -inset-0.5 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />

        {/* Real WhatsApp Official Icon */}
        <WhatsAppIcon className="w-6 h-6 sm:w-8 sm:h-8 fill-white transition-transform duration-300 group-hover:scale-105 relative z-10" />
      </a>
    </aside>
  );
}
