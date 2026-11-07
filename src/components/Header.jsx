import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, ArrowRight, Phone, MapPin, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { categories } from '../data/categories';

export default function Header({ onOpenSearch }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoomsOpen, setIsRoomsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer and dropdown on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsRoomsOpen(false);
  }, [location.pathname]);

  // Handle outside click & escape key for Rooms dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRoomsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsRoomsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/collections' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const mobileNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Living Room', path: '/category/living-room' },
    { name: 'Bedroom', path: '/category/bedroom' },
    { name: 'Dining', path: '/category/dining' },
    { name: 'Office Furniture', path: '/category/office' },
    { name: 'Coffee Tables', path: '/category/coffee-tables' },
    { name: 'Storage & Cabinets', path: '/category/storage' },
    { name: 'Curated Collections', path: '/collections' },
    { name: 'About MNC Lifestyle', path: '/about' },
    { name: 'Contact & Concierge', path: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-ivory/95 backdrop-blur-md shadow-sm border-b border-beige-300 py-3.5'
          : 'bg-ivory/90 backdrop-blur-sm border-b border-beige-200/60 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-charcoal hover:text-bronze focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={onOpenSearch}
              className="p-2 text-charcoal hover:text-bronze focus:outline-none ml-1"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="text-center lg:text-left flex-shrink-0">
            <Link to="/" className="inline-block group">
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-serif text-xl sm:text-2xl lg:text-3xl tracking-[0.18em] font-medium text-charcoal uppercase group-hover:text-bronze transition-colors">
                  MNC <span className="font-light italic">Lifestyle</span>
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.35em] text-warmgrey font-sans -mt-1 group-hover:text-charcoal transition-colors">
                  Furniture & Contemporary Living
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 xl:space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-xs tracking-wider uppercase transition-colors duration-200 py-1 border-b-2 font-medium ${
                  isActive
                    ? 'text-charcoal border-bronze font-semibold'
                    : 'text-charcoal/80 border-transparent hover:text-bronze hover:border-bronze/40'
                }`
              }
            >
              Home
            </NavLink>

            {/* Furniture & Rooms Dropdown */}
            <div
              ref={dropdownRef}
              className="relative group"
              onMouseEnter={() => setIsRoomsOpen(true)}
              onMouseLeave={() => setIsRoomsOpen(false)}
            >
              <button
                onClick={() => setIsRoomsOpen(!isRoomsOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsRoomsOpen(!isRoomsOpen);
                  }
                }}
                aria-expanded={isRoomsOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 text-xs tracking-wider uppercase transition-colors duration-200 py-1 border-b-2 font-medium ${
                  location.pathname.startsWith('/category') || location.pathname === '/shop'
                    ? 'text-charcoal border-bronze font-semibold'
                    : 'text-charcoal/80 border-transparent hover:text-bronze hover:border-bronze/40'
                }`}
              >
                <span>Rooms</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isRoomsOpen ? 'rotate-180 text-bronze' : ''}`} />
              </button>

              {/* Luxury Dropdown Menu */}
              {isRoomsOpen && (
                <div 
                  className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-luxury border border-beige-300 p-4 mt-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-3 py-2 border-b border-beige-200 mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-bronze font-semibold">
                      Explore By Room
                    </span>
                  </div>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.id}`}
                        onClick={() => setIsRoomsOpen(false)}
                        role="menuitem"
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-charcoal hover:bg-beige-100 hover:text-bronze transition-colors group/item"
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-warmgrey group-hover/item:text-bronze transition-colors">
                          {cat.itemCount} Designs &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-beige-200">
                    <Link
                      to="/shop"
                      onClick={() => setIsRoomsOpen(false)}
                      role="menuitem"
                      className="block text-center py-2 bg-espresso text-white rounded text-[11px] uppercase tracking-wider font-semibold hover:bg-bronze transition-colors"
                    >
                      View All Furniture
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/collections"
              className={({ isActive }) =>
                `text-xs tracking-wider uppercase transition-colors duration-200 py-1 border-b-2 font-medium ${
                  isActive
                    ? 'text-charcoal border-bronze font-semibold'
                    : 'text-charcoal/80 border-transparent hover:text-bronze hover:border-bronze/40'
                }`
              }
            >
              Collections
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-xs tracking-wider uppercase transition-colors duration-200 py-1 border-b-2 font-medium ${
                  isActive
                    ? 'text-charcoal border-bronze font-semibold'
                    : 'text-charcoal/80 border-transparent hover:text-bronze hover:border-bronze/40'
                }`
              }
            >
              About Us
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `text-xs tracking-wider uppercase transition-colors duration-200 py-1 border-b-2 font-medium ${
                  isActive
                    ? 'text-charcoal border-bronze font-semibold'
                    : 'text-charcoal/80 border-transparent hover:text-bronze hover:border-bronze/40'
                }`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {/* Desktop Search Button */}
            <button
              onClick={onOpenSearch}
              className="hidden lg:flex items-center text-charcoal/80 hover:text-bronze transition-colors p-2 rounded-full hover:bg-beige-100/60"
              title="Search furniture pieces"
              aria-label="Search furniture"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 text-charcoal/80 hover:text-bronze transition-colors rounded-full hover:bg-beige-100/60"
              title="View Wishlist"
              aria-label="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-bronze text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-charcoal/80 hover:text-bronze transition-colors rounded-full hover:bg-beige-100/60 flex items-center gap-1.5"
              title="View Shopping Bag"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-espresso text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[65px] z-50 bg-charcoal/50 lg:hidden">
          <div className="w-4/5 max-w-sm h-full bg-ivory shadow-2xl p-6 flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300 border-r border-beige-300">
            <div className="mb-6 pb-4 border-b border-beige-200">
              <span className="text-xs uppercase tracking-widest text-bronze font-semibold">
                Explore Collections
              </span>
            </div>

            <nav className="flex flex-col space-y-3.5 flex-1">
              {mobileNavLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `min-h-[44px] text-sm font-serif tracking-wide px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      isActive
                        ? 'text-bronze font-semibold border-l-2 border-bronze bg-beige-100/60 pl-3.5 shadow-2xs'
                        : 'text-charcoal hover:text-bronze hover:bg-beige-100/30'
                    }`
                  }
                >
                  <span>{link.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-warmgrey/50" />
                </NavLink>
              ))}

              <div className="pt-4 mt-4 border-t border-beige-200">
                <Link
                  to="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 bg-espresso text-white text-xs uppercase tracking-widest text-center rounded block font-medium hover:bg-bronze transition-colors"
                >
                  View All Furniture
                </Link>
              </div>
            </nav>

            {/* Mobile Concierge Contact Info */}
            <div className="mt-8 pt-6 border-t border-beige-200 text-xs text-warmgrey space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-bronze" />
                <span>Client Concierge: Mon – Sat</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-bronze" />
                <span>Private Showrooms by Appointment</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


