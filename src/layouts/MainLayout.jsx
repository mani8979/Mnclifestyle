import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import WishlistDrawer from '../components/WishlistDrawer';
import SearchModal from '../components/SearchModal';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { CheckCircle2, Heart } from 'lucide-react';

export default function MainLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { notification } = useCart();
  const { wishlistToast } = useWishlist();
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Main Header Navigation */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals & Drawers */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer />
      <WishlistDrawer />

      {/* Cart Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-espresso text-ivory-100 p-4 rounded-xl shadow-elevated border border-bronze/40 max-w-sm flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          {notification.image ? (
            <img
              src={notification.image}
              alt=""
              className="w-12 h-12 rounded object-cover flex-shrink-0 bg-white/10"
            />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-bronze-light flex-shrink-0" />
          )}
          <div className="min-w-0">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-bronze-light">
              {notification.title}
            </h5>
            <p className="text-xs text-white/90 truncate">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Wishlist Toast Notification */}
      {wishlistToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-white text-charcoal p-4 rounded-xl shadow-elevated border border-beige-300 max-w-sm flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="w-9 h-9 rounded-full bg-beige-100 flex items-center justify-center flex-shrink-0 text-bronze">
            <Heart className="w-4 h-4 fill-bronze" />
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

