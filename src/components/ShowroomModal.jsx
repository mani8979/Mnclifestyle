import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, Sparkles, User, Mail, Phone, MessageCircle } from 'lucide-react';
import { businessConfig } from '../data/businessConfig';
import { buildWhatsAppUrl } from '../utils/whatsapp';

export default function ShowroomModal({ isOpen, onClose }) {
  const showrooms = businessConfig.concierge.showrooms;

  const [formData, setFormData] = useState({
    showroom: showrooms[0]?.name || 'Visakhapatnam Flagship Experience Centre',
    date: '2026-11-16',
    timeSlot: '2:30 PM — 4:00 PM',
    consultationType: 'Living Room Architecture & Styling',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const timeSlots = [
    '10:30 AM — 12:00 PM',
    '1:00 PM — 2:30 PM',
    '2:30 PM — 4:00 PM',
    '4:30 PM — 6:00 PM',
    '6:30 PM — 8:00 PM',
  ];

  const consultationTypes = [
    'Living Room Architecture & Styling',
    'Complete Residence Curation',
    'Custom Teakwood & Fabric Specification',
    'Trade / Architect Project Review',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && (formData.email || formData.phone)) {
      setIsSubmitted(true);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  const whatsappConfirmUrl = buildWhatsAppUrl(`Hello MNC LifeStyle Concierge,

I would like to book a private showroom visit:
• Location: ${formData.showroom}
• Preferred Date: ${formData.date}
• Time Slot: ${formData.timeSlot}
• Consultation Type: ${formData.consultationType}
• Name: ${formData.name}
• Phone: ${formData.phone || 'N/A'}
• Email: ${formData.email || 'N/A'}

Please confirm my appointment. Thank you!`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#211710]/70 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#F8F0E8] rounded-3xl shadow-elevated border border-[#E9D8C5] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-[#E9D8C5] bg-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#D69A4B] text-xs font-semibold uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Private Consultation</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
              Book a Private Experience Centre Visit
            </h2>
            <p className="text-xs text-warmgrey mt-1">
              Experience the craftsmanship, textures, and scale of MNC LifeStyle furniture at our Visakhapatnam centre with a dedicated design specialist.
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
            <div className="w-16 h-16 rounded-full bg-[#D69A4B]/20 text-[#D69A4B] flex items-center justify-center mx-auto mb-2">
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
                <span className="text-warmgrey">Centre Location:</span>
                <span className="font-semibold">{formData.showroom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warmgrey">Service:</span>
                <span className="font-semibold">{formData.consultationType}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={whatsappConfirmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-[#25D366] text-white rounded-lg text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Confirm on WhatsApp</span>
              </a>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3 bg-[#211710] text-white rounded-lg text-xs uppercase tracking-widest font-semibold hover:bg-bronze transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Showroom Selection */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-2">
                1. Select Experience Centre
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {showrooms.map((sh) => (
                  <button
                    key={sh.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, showroom: sh.name })}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.showroom === sh.name
                        ? 'border-[#D69A4B] bg-white ring-2 ring-[#D69A4B]/20 shadow-sm'
                        : 'border-[#E9D8C5] bg-[#F8F0E8]/50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[#D69A4B] text-xs font-semibold mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{sh.name}</span>
                    </div>
                    <p className="text-[11px] text-[#77736D] leading-tight">{sh.location}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="showroom-date" className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                  2. Select Date
                </label>
                <input
                  id="showroom-date"
                  name="showroomDate"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white border border-[#E9D8C5] rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-[#D69A4B]"
                />
              </div>

              <div>
                <label htmlFor="showroom-timeslot" className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                  3. Select Time Window
                </label>
                <select
                  id="showroom-timeslot"
                  name="showroomTimeSlot"
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full bg-white border border-[#E9D8C5] rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-[#D69A4B]"
                >
                  {timeSlots.map((ts) => (
                    <option key={ts} value={ts}>{ts}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Consultation Type */}
            <div>
              <label htmlFor="showroom-consultation-type" className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                4. Focus of Consultation
              </label>
              <select
                id="showroom-consultation-type"
                name="showroomConsultationType"
                value={formData.consultationType}
                onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                className="w-full bg-white border border-[#E9D8C5] rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-[#D69A4B]"
              >
                {consultationTypes.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* Guest Details */}
            <div className="space-y-3 pt-2 border-t border-[#E9D8C5]">
              <span className="block text-xs uppercase tracking-wider text-charcoal font-semibold">
                5. Guest Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="showroom-name" className="sr-only">Full Name</label>
                  <input
                    id="showroom-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Full Name *"
                    aria-label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-[#E9D8C5] rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-[#D69A4B]"
                  />
                </div>
                <div>
                  <label htmlFor="showroom-phone" className="sr-only">WhatsApp Mobile Number</label>
                  <input
                    id="showroom-phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="WhatsApp Mobile Number *"
                    aria-label="WhatsApp Mobile Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-[#E9D8C5] rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-[#D69A4B]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="showroom-email" className="sr-only">Email Address</label>
                <input
                  id="showroom-email"
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  aria-label="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white border border-[#E9D8C5] rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-[#D69A4B]"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-[#211710] text-[#F8F0E8] text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-[#D69A4B] hover:text-[#211710] transition-colors shadow-soft"
              >
                Confirm Private Appointment
              </button>
              <p className="text-[11px] text-warmgrey text-center mt-2">
                Our Visakhapatnam concierge will contact you on WhatsApp to confirm parking and design materials.
              </p>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
