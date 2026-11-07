import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, Sparkles, User, Mail, Phone } from 'lucide-react';

export default function ShowroomModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    showroom: 'Flagship Design District Gallery',
    date: '2026-11-15',
    timeSlot: '2:30 PM — 4:00 PM',
    consultationType: 'Living Room Architecture & Styling',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const showrooms = [
    { name: 'Flagship Design District Gallery', city: 'Design District Suite 400', leadTime: 'Private viewing by appointment' },
    { name: 'Mayfair Studio & Atelier', city: 'Central Square Pavilions', leadTime: 'Dedicated Senior Designer assigned' },
    { name: 'Beverly Hills Salon', city: 'Wilshire Boulevard Gallery', leadTime: 'Complimentary Valet & Material Concierge' },
  ];

  const timeSlots = [
    '10:30 AM — 12:00 PM',
    '1:00 PM — 2:30 PM',
    '2:30 PM — 4:00 PM',
    '4:30 PM — 6:00 PM',
  ];

  const consultationTypes = [
    'Living Room Architecture & Styling',
    'Complete Residence Curation',
    'Custom Timber & Fabric Specification',
    'Trade / Architect Project Review',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setIsSubmitted(true);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
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
              <span>Private Consultation</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
              Book a Private Showroom Visit
            </h2>
            <p className="text-xs text-warmgrey mt-1">
              Experience the craftsmanship, textures, and scale of MNC Lifestyle furniture with a dedicated design specialist.
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

        {isSubmitted ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-bronze/10 text-bronze flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-3xl text-charcoal font-medium">
              Private Appointment Confirmed
            </h3>
            <p className="text-sm text-warmgrey max-w-md mx-auto leading-relaxed">
              We look forward to welcoming you to the {formData.showroom} on {formData.date} at {formData.timeSlot}.
            </p>
            <div className="bg-white p-5 rounded-2xl border border-beige-300 max-w-md mx-auto text-left text-xs space-y-2 text-charcoal my-6">
              <div className="flex justify-between">
                <span className="text-warmgrey">Guest Name:</span>
                <span className="font-semibold">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warmgrey">Consultation Focus:</span>
                <span className="font-semibold">{formData.consultationType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warmgrey">Concierge Service:</span>
                <span className="text-emerald-700 font-semibold">Complimentary Swatch Presentation Included</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-charcoal text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-bronze transition-colors shadow-xs"
              >
                Return to Website
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Showroom Selection */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal mb-2">
                1. Select Showroom Gallery
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {showrooms.map((s) => {
                  const isSelected = formData.showroom === s.name;
                  return (
                    <div
                      key={s.name}
                      onClick={() => setFormData({ ...formData, showroom: s.name })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-bronze bg-white ring-1 ring-bronze shadow-xs'
                          : 'border-beige-300 bg-white hover:border-charcoal/40'
                      }`}
                    >
                      <MapPin className={`w-4 h-4 mb-2 ${isSelected ? 'text-bronze' : 'text-warmgrey'}`} />
                      <p className="text-xs font-semibold text-charcoal leading-snug">{s.name}</p>
                      <span className="text-[10px] text-warmgrey mt-1 block">{s.city}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal mb-2">
                  2. Preferred Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-warmgrey absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white border border-beige-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-charcoal focus:outline-none focus:border-bronze"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal mb-2">
                  Time Window
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-warmgrey absolute left-3 top-3" />
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full bg-white border border-beige-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-charcoal focus:outline-none focus:border-bronze"
                  >
                    {timeSlots.map((ts) => (
                      <option key={ts} value={ts}>{ts}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Consultation Type */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal mb-2">
                3. Consultation Scope
              </label>
              <select
                value={formData.consultationType}
                onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                className="w-full bg-white border border-beige-300 rounded-lg px-3 py-2.5 text-xs text-charcoal focus:outline-none focus:border-bronze"
              >
                {consultationTypes.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* Guest Details */}
            <div className="space-y-4 pt-4 border-t border-beige-300">
              <span className="text-xs uppercase tracking-wider font-semibold text-charcoal block">
                4. Guest Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white border border-beige-300 rounded-lg p-2.5 text-xs text-charcoal placeholder:text-warmgrey focus:outline-none focus:border-bronze"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white border border-beige-300 rounded-lg p-2.5 text-xs text-charcoal placeholder:text-warmgrey focus:outline-none focus:border-bronze"
                />
              </div>
              <input
                type="tel"
                placeholder="Mobile Telephone (for appointment confirmation SMS)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white border border-beige-300 rounded-lg p-2.5 text-xs text-charcoal placeholder:text-warmgrey focus:outline-none focus:border-bronze"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-espresso text-white rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-bronze transition-colors shadow-soft"
              >
                Confirm Private Appointment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
