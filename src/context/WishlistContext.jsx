import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { products } from '../data/products';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('mnc_lifestyle_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out any stale non-existent legacy IDs
        return parsed.filter(id => products.some(p => p.id === id));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [wishlistToast, setWishlistToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('mnc_lifestyle_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }, [wishlistIds]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const toggleWishlist = (productId) => {
    const isCurrentlySaved = wishlistIds.includes(productId);
    const product = products.find((p) => p.id === productId);

    if (isCurrentlySaved) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      setWishlistToast({
        title: 'Removed from Wishlist',
        message: `${product?.name || 'Item'} removed from your curated wishlist.`
      });
    } else {
      setWishlistIds((prev) => [...prev, productId]);
      setWishlistToast({
        title: 'Saved to Wishlist',
        message: `${product?.name || 'Item'} saved to your curated wishlist.`
      });
    }

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setWishlistToast(null);
    }, 3500);
  };

  const isInWishlist = (productId) => wishlistIds.includes(productId);

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        wishlistToast,
        setWishlistToast,
        wishlistCount: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

