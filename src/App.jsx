import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import MainLayout from './layouts/MainLayout';

// Lazy-loaded Pages for Route Code Splitting
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Category = lazy(() => import('./pages/Category'));
const Collections = lazy(() => import('./pages/Collections'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-24">
      <div className="w-9 h-9 border-2 border-[#E9D8C5] border-t-[#D69A4B] rounded-full animate-spin mb-3.5" />
      <span className="text-[10px] uppercase tracking-[0.25em] text-[#77736D] font-sans font-medium">
        Loading Collection...
      </span>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route
                index
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Home />
                  </Suspense>
                }
              />
              <Route
                path="shop"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Shop />
                  </Suspense>
                }
              />
              <Route
                path="category/:categoryId"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Category />
                  </Suspense>
                }
              />
              <Route
                path="collections"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Collections />
                  </Suspense>
                }
              />
              <Route
                path="product/:id"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProductDetails />
                  </Suspense>
                }
              />
              <Route
                path="about"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <About />
                  </Suspense>
                }
              />
              <Route
                path="contact"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Contact />
                  </Suspense>
                }
              />
              <Route
                path="*"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <NotFound />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  );
}
