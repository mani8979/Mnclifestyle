'use client';
import React, { useState, useEffect } from 'react';
import AnnouncementBar from '../AnnouncementBar';
import Header from '../Header';
import Footer from '../Footer';
import SearchModal from '../SearchModal';
import ProductQuickViewModal from '../ProductQuickViewModal';
import WhatsAppFloatingButton from '../WhatsAppFloatingButton';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../lib/router-bridge';

export default function StoreLayoutClient({
  children,
  categories,
}: {
  children: React.ReactNode;
  categories?: any[];
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { quickViewProduct, closeQuickView } = useCart();
  const { pathname, hash } = useLocation();

  // Scroll to top on route change or to hash anchor
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      let attempts = 0;
      const interval = setInterval(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          clearInterval(interval);
        } else if (++attempts >= 20) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F0E8] text-[#211A15]">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Header Navigation */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} categories={categories} />

      {/* 3. Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* 4. Footer */}
      <Footer categories={categories} />

      {/* 5. Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={closeQuickView}
      />

      {/* 6. WhatsApp Floating Quick Order / Chat Button */}
      <WhatsAppFloatingButton />
    </div>
  );
}
