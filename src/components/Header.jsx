'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { NavLink, Link, useLocation } from '@/lib/router-bridge';
import { Search, Menu, X, ChevronDown, ArrowRight, Phone, MapPin, MessageCircle } from 'lucide-react';
const logoImg = '/logo.png';
import { businessConfig } from '../data/businessConfig';

export default function Header({ onOpenSearch, categories: initialCategories }) {
  const [categoriesList, setCategoriesList] = useState(initialCategories || []);

  useEffect(() => {
    if (Array.isArray(initialCategories) && initialCategories.length > 0) {
      setCategoriesList(initialCategories);
    } else {
      fetch('/api/categories')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data?.categories) && data.categories.length > 0) {
            setCategoriesList(data.categories);
          }
        })
        .catch(() => {});
    }
  }, [initialCategories]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const location = useLocation();

  // Close mobile drawer and dropdown on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileShopOpen(false);
    setIsShopOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle outside click & escape key for Shop mega menu dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsShopOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsShopOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsShopOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsShopOpen(false);
    }, 150);
  };

  const closeShopDropdown = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsShopOpen(false);
  };

  const isHomeActive = location.pathname === '/';
  const isShopActive =
    location.pathname === '/shop' ||
    location.pathname.startsWith('/category') ||
    location.pathname === '/collections';

  // Mega Menu Links derived dynamically from Database (Admin categories)
  const shopCategories = React.useMemo(() => {
    if (Array.isArray(categoriesList) && categoriesList.length > 0) {
      return categoriesList.map((cat) => ({
        label: cat.name,
        path: `/category/${cat.slug || cat.id}`,
        desc: cat.title && cat.title !== cat.name
          ? cat.title
          : (cat.description ? (cat.description.length > 34 ? `${cat.description.substring(0, 32)}...` : cat.description) : `Handcrafted ${cat.name}`),
      }));
    }
    return [
      { label: 'Recliners', path: '/category/recliners', desc: 'Silent Power Recliners' },
      { label: 'Beds', path: '/category/beds', desc: 'Solid Teak Platform Beds' },
      { label: 'Dining Sets', path: '/category/dining-sets', desc: 'Handcrafted Dining Suites' },
      { label: 'Sofas', path: '/category/sectional-sofas', desc: 'Curved Bouclé & Teak Seating' },
      { label: 'Chairs', path: '/category/chairs', desc: 'Sculptural Teak Seating' },
      { label: 'Wardrobes', path: '/category/wardrobes', desc: 'Seasoned Hardwood Armoires' },
      { label: 'Centre Tables', path: '/category/centre-tables', desc: 'Travertine & Teak Tables' },
    ];
  }, [categoriesList]);

  const shopCollections = [
    {
      title: 'Signature Collection',
      path: '/collections',
      desc: 'Bespoke Architectural Teak & Travertine Suites',
      tag: 'Iconic Pieces'
    },
    {
      title: 'Modern Collection',
      path: '/collections#modern-living',
      desc: 'Tactile Bouclé & Organic Minimalist Contours',
      tag: 'Contemporary'
    },
    {
      title: 'Premium Teak Collection',
      path: '/collections#contemporary-bedroom',
      desc: 'Kiln-Dried CP Teakwood Hand-Finished Joinery',
      tag: 'Heritage Solid Wood'
    },
    {
      title: 'New Arrivals',
      path: '/shop',
      desc: 'Latest Handcrafted Pieces for Indian Residences',
      tag: '2026 Season'
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F8F0E8] border-b border-[#E9D8C5] shadow-xs">
      <div className="max-w-[1672px] mx-auto px-3 sm:px-8 lg:px-[50px] h-[72px] sm:h-[80px] lg:h-[109px] flex items-center justify-between gap-2 sm:gap-4 overflow-hidden lg:overflow-visible">
        
        {/* Mobile Menu Button (Left on Mobile) */}
        <div className="flex items-center shrink-0 lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 sm:p-2 -ml-1 text-[#211A15] hover:text-[#D69A4B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D69A4B] rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>

        {/* Left / Center on Mobile: MNC LifeStyle Logo */}
        <div className="shrink min-w-0 flex items-center">
          <Link
            to="/"
            onMouseEnter={closeShopDropdown}
            className="inline-flex items-center group max-w-full"
          >
            <Image
              src="/logo.png"
              alt="MNC LifeStyle — Furniture & Contemporary Living"
              width={366}
              height={68}
              priority
              className="h-8 min-[375px]:h-9 sm:h-11 lg:h-[66px] max-w-[140px] min-[375px]:max-w-[185px] sm:max-w-none w-auto object-contain transition-opacity duration-200 group-hover:opacity-95"
            />
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (HOME, SHOP, ABOUT US, CONTACT) */}
        <nav className="hidden lg:flex items-center space-x-9 xl:space-x-12">
          
          {/* 1. HOME */}
          <NavLink
            to="/"
            onMouseEnter={closeShopDropdown}
            className="relative py-2 text-sm font-semibold tracking-[0.14em] uppercase text-[#211A15] hover:text-[#D69A4B] transition-colors"
          >
            <span>HOME</span>
            {isHomeActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#D69A4B] rounded-full" />
            )}
          </NavLink>

          {/* 2. SHOP with Unified Mega Menu Dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              data-testid="desktop-shop-button"
              onClick={() => setIsShopOpen(!isShopOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsShopOpen(!isShopOpen);
                }
              }}
              aria-expanded={isShopOpen}
              aria-haspopup="true"
              className={`relative flex items-center gap-1.5 py-2 text-sm font-semibold tracking-[0.14em] uppercase transition-colors ${
                isShopActive ? 'text-[#211A15]' : 'text-[#211A15] hover:text-[#D69A4B]'
              }`}
            >
              <span>SHOP</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isShopOpen ? 'rotate-180 text-[#D69A4B]' : 'text-[#211A15]'
                }`}
              />
              {isShopActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#D69A4B] rounded-full" />
              )}
            </button>

            {/* Desktop Mega Menu Dropdown */}
            {isShopOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className="w-[520px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-luxury border border-[#E9D8C5] p-5 sm:p-6 text-left"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* Shop by Category Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-[#E9D8C5]/60">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#855214] font-bold">
                      Shop by Category
                    </span>
                    <Link
                      to="/shop"
                      onClick={() => setIsShopOpen(false)}
                      className="text-xs font-semibold text-[#211A15] hover:text-[#D69A4B] transition-colors inline-flex items-center gap-1"
                    >
                      <span>Explore All Categories</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* 2-Column Category Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {shopCategories.map((item) => (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setIsShopOpen(false)}
                        role="menuitem"
                        className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#211A15] hover:bg-[#F8F0E8] hover:text-[#D69A4B] transition-all group/item block border border-transparent hover:border-[#E9D8C5]/60"
                      >
                        <span className="font-semibold block text-[#211A15] group-hover/item:text-[#D69A4B] transition-colors text-[13px]">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-[#77736D] truncate block mt-0.5 font-sans">
                          {item.desc}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* Mega Menu Bottom Bar */}
                  <div className="mt-4 pt-3.5 border-t border-[#E9D8C5]/60 flex items-center justify-between">
                    <span className="text-[11px] text-[#77736D] font-sans">
                      Handcrafted solid wood & stone furniture tailored for Indian homes.
                    </span>
                    <Link
                      to="/shop"
                      onClick={() => setIsShopOpen(false)}
                      role="menuitem"
                      className="px-4 py-2 bg-[#211710] text-[#F8F0E8] rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-[#D69A4B] hover:text-[#211710] transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
                    >
                      <span>Complete Catalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* 3. ABOUT US */}
          <NavLink
            to="/about"
            onMouseEnter={closeShopDropdown}
            className={({ isActive }) =>
              `relative py-2 text-sm font-semibold tracking-[0.14em] uppercase transition-colors ${
                isActive ? 'text-[#211A15]' : 'text-[#211A15] hover:text-[#D69A4B]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span>ABOUT US</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#D69A4B] rounded-full" />
                )}
              </>
            )}
          </NavLink>

          {/* 4. CONTACT */}
          <NavLink
            to="/contact"
            onMouseEnter={closeShopDropdown}
            className={({ isActive }) =>
              `relative py-2 text-sm font-semibold tracking-[0.14em] uppercase transition-colors ${
                isActive ? 'text-[#211A15]' : 'text-[#211A15] hover:text-[#D69A4B]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span>CONTACT</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#D69A4B] rounded-full" />
                )}
              </>
            )}
          </NavLink>

        </nav>

        {/* Right Actions: Search */}
        <div className="flex items-center gap-0.5 min-[375px]:gap-1 sm:gap-2 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-1.5 sm:p-2 text-[#211A15] hover:text-[#D69A4B] focus-visible:ring-2 focus-visible:ring-[#D69A4B] transition-colors rounded-full hover:bg-black/5"
            title="Search furniture pieces"
            aria-label="Search furniture"
          >
            <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2]" />
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-[80px] lg:top-[109px] z-50 bg-[#211710]/60 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-4/5 max-w-sm h-full bg-[#F8F0E8] shadow-2xl p-6 flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300 border-r border-[#E9D8C5]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 pb-3 border-b border-[#E9D8C5] flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#D69A4B] font-semibold">
                Explore MNC LifeStyle
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-[#77736D] hover:text-[#211A15]"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-2 flex-1">
              
              {/* 1. HOME */}
              <NavLink
                to="/"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsMobileShopOpen(false);
                }}
                className={({ isActive }) =>
                  `min-h-[46px] text-sm font-serif tracking-wide px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                    isActive
                      ? 'text-[#D69A4B] font-semibold bg-[#E9D8C5]/40 border-l-2 border-[#D69A4B]'
                      : 'text-[#211A15] hover:text-[#D69A4B] hover:bg-[#E9D8C5]/20'
                  }`
                }
              >
                <span className="uppercase tracking-wider font-semibold">Home</span>
                <ArrowRight className="w-4 h-4 text-[#77736D]/60" />
              </NavLink>

              {/* 2. SHOP (Accordion Dropdown) */}
              <div className="flex flex-col">
                <button
                  type="button"
                  data-testid="mobile-shop-accordion"
                  onClick={() => setIsMobileShopOpen(!isMobileShopOpen)}
                  className={`min-h-[46px] text-sm font-serif tracking-wide px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                    isShopActive || isMobileShopOpen
                      ? 'text-[#D69A4B] font-semibold bg-[#E9D8C5]/40 border-l-2 border-[#D69A4B]'
                      : 'text-[#211A15] hover:text-[#D69A4B] hover:bg-[#E9D8C5]/20'
                  }`}
                  aria-expanded={isMobileShopOpen}
                >
                  <span className="uppercase tracking-wider font-semibold">Shop</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#D69A4B] transition-transform duration-200 ${
                      isMobileShopOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Mobile Shop Accordion Panel */}
                {isMobileShopOpen && (
                  <div className="mt-1.5 ml-2 pl-3 py-2 border-l-2 border-[#D69A4B]/60 space-y-3 bg-[#E9D8C5]/25 rounded-r-xl animate-in slide-in-from-top-2 duration-200">
                    
                    {/* Section 1: Shop by Category */}
                    <div>
                      <div className="px-3 py-1 mb-1">
                        <span className="text-[10px] uppercase tracking-widest text-[#855214] font-bold">
                          Shop by Category
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {shopCategories.map((item) => (
                          <Link
                            key={item.label}
                            to={item.path}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsMobileShopOpen(false);
                            }}
                            className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium text-[#211A15] hover:bg-white hover:text-[#D69A4B] transition-colors flex items-center justify-between"
                          >
                            <span className="font-semibold">{item.label}</span>
                            <span className="text-[10px] text-[#77736D]">&rarr;</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Section 2: Shop by Collection */}
                    <div className="pt-2 border-t border-[#E9D8C5]/50">
                      <div className="px-3 py-1 mb-1">
                        <span className="text-[10px] uppercase tracking-widest text-[#855214] font-bold">
                          Shop by Collection
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {shopCollections.map((col) => (
                          <Link
                            key={col.title}
                            to={col.path}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsMobileShopOpen(false);
                            }}
                            className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium text-[#211A15] hover:bg-white hover:text-[#D69A4B] transition-colors flex items-center justify-between"
                          >
                            <span className="font-semibold">{col.title}</span>
                            <span className="text-[10px] text-[#77736D]">&rarr;</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E9D8C5]/50 px-2">
                      <Link
                        to="/shop"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMobileShopOpen(false);
                        }}
                        className="block text-center py-2.5 bg-[#211710] text-[#F8F0E8] rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-[#D69A4B] hover:text-[#211710] transition-colors shadow-xs"
                      >
                        View All Furniture Catalog
                      </Link>
                    </div>

                  </div>
                )}
              </div>

              {/* 3. ABOUT US */}
              <NavLink
                to="/about"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsMobileShopOpen(false);
                }}
                className={({ isActive }) =>
                  `min-h-[46px] text-sm font-serif tracking-wide px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                    isActive
                      ? 'text-[#D69A4B] font-semibold bg-[#E9D8C5]/40 border-l-2 border-[#D69A4B]'
                      : 'text-[#211A15] hover:text-[#D69A4B] hover:bg-[#E9D8C5]/20'
                  }`
                }
              >
                <span className="uppercase tracking-wider font-semibold">About Us</span>
                <ArrowRight className="w-4 h-4 text-[#77736D]/60" />
              </NavLink>

              {/* 4. CONTACT */}
              <NavLink
                to="/contact"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsMobileShopOpen(false);
                }}
                className={({ isActive }) =>
                  `min-h-[46px] text-sm font-serif tracking-wide px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                    isActive
                      ? 'text-[#D69A4B] font-semibold bg-[#E9D8C5]/40 border-l-2 border-[#D69A4B]'
                      : 'text-[#211A15] hover:text-[#D69A4B] hover:bg-[#E9D8C5]/20'
                  }`
                }
              >
                <span className="uppercase tracking-wider font-semibold">Contact</span>
                <ArrowRight className="w-4 h-4 text-[#77736D]/60" />
              </NavLink>

              <div className="pt-4 mt-4 border-t border-[#E9D8C5]">
                <Link
                  to="/shop"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsMobileShopOpen(false);
                  }}
                  className="w-full py-3 px-4 bg-[#211710] text-[#F8F0E8] text-xs uppercase tracking-widest text-center rounded-xl block font-semibold hover:bg-[#D69A4B] hover:text-[#211710] transition-colors"
                >
                  View All Furniture
                </Link>
              </div>
            </nav>

            {/* Mobile Concierge Contact Info */}
            <div className="mt-8 pt-6 border-t border-[#E9D8C5] text-xs text-[#77736D] space-y-2.5">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D69A4B]" />
                <a href={`tel:${businessConfig.contact.phoneRaw}`} className="hover:text-[#D69A4B] font-medium text-[#211710]">
                  {businessConfig.contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <a href="https://wa.me/918790943457" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] font-medium text-[#211710]">
                  WhatsApp: {businessConfig.contact.displayPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D69A4B]" />
                <a
                  href={businessConfig.location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D69A4B]"
                >
                  Visakhapatnam, Andhra Pradesh, India
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
