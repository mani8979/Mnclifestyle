import React, { useState } from 'react';
import { X, Check, Sparkles, Box, CheckCircle2 } from 'lucide-react';

export default function SwatchModal({ isOpen, onClose }) {
  const [selectedSwatches, setSelectedSwatches] = useState([
    'Textured Oatmeal Bouclé',
    'Solid White Oak',
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '' });

  if (!isOpen) return null;

  const swatchOptions = [
    { id: 'sw-1', name: 'Textured Oatmeal Bouclé', category: 'Textile', hex: '#EDE8E1' },
    { id: 'sw-2', name: 'Belgian Stone-washed Linen', category: 'Textile', hex: '#DED7C8' },
    { id: 'sw-3', name: 'Solid White Oak', category: 'Hardwood', hex: '#D8C3A5' },
    { id: 'sw-4', name: 'American Black Walnut', category: 'Hardwood', hex: '#4A3427' },
    { id: 'sw-5', name: 'Roman Warm Travertine Stone', category: 'Natural Stone', hex: '#E2D9CC' },
    { id: 'sw-6', name: 'Italian Cognac Saddle Leather', category: 'Leather', hex: '#9C5B32' },
    { id: 'sw-7', name: 'Smoked European Ash', category: 'Hardwood', hex: '#312A27' },
    { id: 'sw-8', name: 'Forest Moss Wool', category: 'Textile', hex: '#4B5548' },
  ];

  const toggleSwatch = (name) => {
    if (selectedSwatches.includes(name)) {
      setSelectedSwatches(selectedSwatches.filter((s) => s !== name));
    } else {
      if (selectedSwatches.length < 3) {
        setSelectedSwatches([...selectedSwatches, name]);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSwatches.length > 0 && form.name && form.address) {
      setSubmitted(true);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-charcoal/70 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-ivory-100 rounded-3xl shadow-elevated border border-beige-300 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-beige-300 bg-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-bronze text-xs font-semibold uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complimentary Service</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
              Order Fabric & Timber Swatches
            </h2>
            <p className="text-xs text-warmgrey mt-1">
              Select up to 3 authentic material samples to review in the natural light of your home.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-warmgrey hover:text-charcoal rounded-full hover:bg-ivory transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-bronze/10 text-bronze flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-3xl text-charcoal font-medium">
              Your Swatch Box is Prepared
            </h3>
            <p className="text-sm text-warmgrey max-w-md mx-auto leading-relaxed">
              We have scheduled your curated box containing {selectedSwatches.join(', ')}. In keeping with our brand standards, swatches arrive within 3 business days in a linen-bound presentation case.
            </p>
            <div className="pt-4">
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-charcoal text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-bronze transition-colors"
              >
                Return to Browsing
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Swatches selection grid */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                  1. Choose Up to 3 Finishes:
                </span>
                <span className="text-xs font-semibold text-bronze">
                  {selectedSwatches.length} of 3 selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {swatchOptions.map((sw) => {
                  const isChecked = selectedSwatches.includes(sw.name);
                  const isFull = selectedSwatches.length >= 3 && !isChecked;

                  return (
                    <div
                      key={sw.id}
                      onClick={() => !isFull && toggleSwatch(sw.name)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'border-bronze bg-white ring-1 ring-bronze shadow-xs'
                          : isFull
                          ? 'opacity-40 border-beige-200 cursor-not-allowed bg-ivory/50'
                          : 'border-beige-300 bg-white hover:border-charcoal/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-5 h-5 rounded-full border border-black/20 flex-shrink-0"
                          style={{ backgroundColor: sw.hex }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-charcoal truncate">{sw.name}</p>
                          <span className="text-[10px] text-warmgrey uppercase tracking-wider">
                            {sw.category}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isChecked
                            ? 'bg-bronze border-bronze text-white'
                            : 'border-beige-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Address fields */}
            <div className="space-y-4 pt-4 border-t border-beige-300">
              <span className="text-xs uppercase tracking-wider font-semibold text-charcoal block">
                2. Shipping Address:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-white border border-beige-300 rounded-lg p-2.5 text-xs text-charcoal placeholder:text-warmgrey focus:outline-none focus:border-bronze"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-white border border-beige-300 rounded-lg p-2.5 text-xs text-charcoal placeholder:text-warmgrey focus:outline-none focus:border-bronze"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Street Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="sm:col-span-2 bg-white border border-beige-300 rounded-lg p-2.5 text-xs text-charcoal placeholder:text-warmgrey focus:outline-none focus:border-bronze"
                />
                <input
                  type="text"
                  required
                  placeholder="City / Postal Code"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="bg-white border border-beige-300 rounded-lg p-2.5 text-xs text-charcoal placeholder:text-warmgrey focus:outline-none focus:border-bronze"
                />
              </div>
            </div>

            {/* Action submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={selectedSwatches.length === 0}
                className="w-full py-3.5 bg-espresso text-white rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
              >
                Request Free Swatch Box ({selectedSwatches.length} Selected)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

