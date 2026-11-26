'use client';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getProductPrimaryColor } from '../utils/colors';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      if (typeof window === 'undefined') return [];
      const saved = localStorage.getItem('mnc_lifestyle_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [notification, setNotification] = useState(null);
  const toastTimerRef = useRef(null);

  const openQuickView = (product) => {
    setQuickViewProduct(product || null);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  useEffect(() => {
    try {
      localStorage.setItem('mnc_lifestyle_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const addToCart = (product, quantity = 1, selectedColor = null) => {
    const color =
      selectedColor ||
      getProductPrimaryColor(product)?.name ||
      product.colors?.[0]?.name ||
      'Standard';
    const productId = product.id || product._id || product.slug;
    const normalizedProduct = { ...product, id: productId };
    
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          (item.product.id || item.product._id) === productId &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          product: normalizedProduct,
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      } else {
        return [...prevItems, { product: normalizedProduct, quantity, selectedColor: color }];
      }
    });

    // Show luxury toast notification
    setNotification({
      title: 'Added to Your Selection',
      message: `${product.name} (${color}) added to your shopping bag.`,
      image: product.images?.[0]
    });

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const removeFromCart = (productId, selectedColor) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedColor === selectedColor)
      )
    );
  };

  const updateQuantity = (productId, selectedColor, delta) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.selectedColor === selectedColor) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        notification,
        setNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

