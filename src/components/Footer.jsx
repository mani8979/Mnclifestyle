import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Check, ArrowRight, ShieldCheck, Clock, Compass, Phone } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-espresso text-ivory-100 pt-16 pb-12 border-t border-espresso-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Proposition Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-white/10 mb-12">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-full bg-white/5 border border-white/10 text-bronze-light flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base text-white font-medium">Bespoke Architectural Quality</h4>
              <p className="text-xs text-warmgrey-light mt-1 leading-relaxed">
                FSC-certified timber, Roman travertine, and Belgian bouclé crafted by multi-generational artisans.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-full bg-white/5 border border-white/10 text-bronze-light flex-shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base text-white font-medium">Complimentary In-Home Placement</h4>
              <p className="text-xs text-warmgrey-light mt-1 leading-relaxed">
                White-glove uncrating, room-of-choice positioning, and eco-conscious packaging removal on every order.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-full bg-white/5 border border-white/10 text-bronze-light flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base text-white font-medium">Ten-Year Structural Warranty</h4>
              <p className="text-xs text-warmgrey-light mt-1 leading-relaxed">
                Comprehensive long-term structural guarantees designed for enduring domestic tranquility.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Bio */}
          <div className="lg:col-span-2 pr-0 lg:pr-8">
            <div className="mb-4">
              <span className="font-serif text-2xl tracking-[0.16em] font-medium text-white uppercase">
                MNC <span className="font-light italic text-bronze-light">Lifestyle</span>
              </span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-warmgrey-light font-sans mt-0.5">
                Furniture & Contemporary Living
              </p>
            </div>
            <p className="text-xs text-warmgrey-light leading-relaxed mb-6 max-w-sm">
              MNC Lifestyle curates thoughtful, minimal, and enduring furniture collections for homes that value quiet elegance. We balance the architectural beauty of raw natural materials with comfortable, lived-in warmth.
            </p>
            <div className="text-xs text-warmgrey-light space-y-1">
              <p><strong className="text-white">Design Concierge:</strong> Available for residential & commercial specifications.</p>
              <p><strong className="text-white">Showrooms:</strong> Viewing by appointment in flagship design capitals.</p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-bronze-light mb-4 font-sans">
              Furniture Collections
            </h5>
            <ul className="space-y-2.5 text-xs text-warmgrey-light">
              <li>
                <Link to="/category/living-room" className="hover:text-white transition-colors">
                  Living Room
                </Link>
              </li>
              <li>
                <Link to="/category/bedroom" className="hover:text-white transition-colors">
                  Bedroom Suites
                </Link>
              </li>
              <li>
                <Link to="/category/dining" className="hover:text-white transition-colors">
                  Dining Tables & Chairs
                </Link>
              </li>
              <li>
                <Link to="/category/office" className="hover:text-white transition-colors">
                  Executive Workspaces
                </Link>
              </li>
              <li>
                <Link to="/category/coffee-tables" className="hover:text-white transition-colors">
                  Coffee Tables
                </Link>
              </li>
              <li>
                <Link to="/category/storage" className="hover:text-white transition-colors">
                  Storage & Credenzas
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-bronze-light hover:underline font-medium">
                  View Full Catalog &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Brand & Services */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-bronze-light mb-4 font-sans">
              About & Studio
            </h5>
            <ul className="space-y-2.5 text-xs text-warmgrey-light">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-white transition-colors">
                  Curated Collections
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Artisan Woodcraft
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Interior Design Consultation
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Private Showroom Visits
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Trade & Architect Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-bronze-light mb-4 font-sans">
              The MNC Lifestyle Circle
            </h5>
            <p className="text-xs text-warmgrey-light mb-3 leading-relaxed">
              Receive private lookbooks, new material previews, and invitations to showroom exhibitions.
            </p>
            {subscribed ? (
              <div className="p-3 bg-white/10 rounded border border-bronze text-xs text-white flex items-center gap-2">
                <Check className="w-4 h-4 text-bronze-light flex-shrink-0" />
                <span>Thank you for joining our private circle.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:relative sm:block gap-2 sm:gap-0">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2.5 sm:py-2 text-xs text-white placeholder:text-warmgrey-light focus:outline-none focus:border-bronze sm:pr-20"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto sm:absolute sm:right-1 sm:top-1 sm:bottom-1 px-4 py-2 sm:py-0 bg-bronze text-white text-[11px] uppercase tracking-wider rounded-lg font-medium hover:bg-bronze-light transition-colors min-h-[38px] sm:min-h-0 flex items-center justify-center"
                  >
                    Join
                  </button>
                </div>
                <span className="text-[10px] text-warmgrey-light block">
                  We respect your privacy. Unsubscribe anytime.
                </span>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-warmgrey-light gap-4">
          <p>© 2026 MNC LIFESTYLE. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-xs">
            <Link to="/contact" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/20">|</span>
            <Link to="/contact" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-white/20">|</span>
            <Link to="/contact" className="hover:text-white transition-colors">
              Care & Maintenance
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

