import React, { createContext, useContext, useState, useEffect } from 'react';
import { products } from '../data/products';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('mnc_lifestyle_wishlist');
      return saved ? JSON.parse(saved) : ['mnc-liv-01', 'mnc-cof-01'];
    } catch {
      return ['mnc-liv-01', 'mnc-cof-01'];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [wishlistToast, setWishlistToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('mnc_lifestyle_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }, [wishlistIds]);

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

    setTimeout(() => {
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

