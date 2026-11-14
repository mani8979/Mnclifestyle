import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WishlistDrawer from '../components/WishlistDrawer';
import CartDrawer from '../components/CartDrawer';
import SearchModal from '../components/SearchModal';
import WhatsAppFloatingButton from '../components/WhatsAppFloatingButton';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingBag } from 'lucide-react';

export default function MainLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { wishlistToast } = useWishlist();
  const { notification } = useCart();
  const { pathname, hash } = useLocation();

  // Scroll to top on route change or to hash anchor (with retry for lazy-loaded route chunks)
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
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* 3. Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 4. Footer */}
      <Footer />

      {/* 5. Modals & Drawers */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <WishlistDrawer />
      <CartDrawer />

      {/* 6. WhatsApp Floating Quick Order / Chat Button */}
      <WhatsAppFloatingButton />

      {/* 7. Cart Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-50 bg-white text-charcoal p-4 rounded-xl shadow-elevated border border-[#E9D8C5] max-w-sm flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F8F0E8] shrink-0 border border-[#E9D8C5]">
            {notification.image ? (
              <img src={notification.image} alt="Cart item" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#211710]">
                <ShoppingBag className="w-4 h-4" />
              </div>
            )}
          </div>
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
              {notification.title}
            </h5>
            <p className="text-xs text-warmgrey">{notification.message}</p>
          </div>
        </div>
      )}

      {/* 8. Wishlist Toast Notification */}
      {wishlistToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-white text-charcoal p-4 rounded-xl shadow-elevated border border-[#E9D8C5] max-w-sm flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="w-9 h-9 rounded-full bg-[#F8F0E8] flex items-center justify-center flex-shrink-0 text-[#D69A4B]">
            <Heart className="w-4 h-4 fill-[#D69A4B]" />
          </div>
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
              {wishlistToast.title}
            </h5>
            <p className="text-xs text-warmgrey">{wishlistToast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
