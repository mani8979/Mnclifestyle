import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, CheckCircle2, ChevronDown, ChevronUp, Send, Sparkles, Calendar } from 'lucide-react';
import { businessConfig } from '../data/businessConfig';
import ShowroomModal from '../components/ShowroomModal';

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    inquiryType: 'Showroom Visit',
    projectScope: 'Living Room',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [isShowroomModalOpen, setIsShowroomModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.fullName && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      inquiryType: 'Showroom Visit',
      projectScope: 'Living Room',
      message: ''
    });
  };

  const faqs = [
    {
      q: 'How does the White-Glove delivery and installation process work?',
      a: 'All MNC Lifestyle orders include coordinated white-glove service. Our team coordinates a delivery window, brings the piece to your designated room of choice, assembles any components, inspects the finishes, and removes all protective packaging.'
    },
    {
      q: 'Can furniture pieces be customized with bespoke dimensions or fabrics?',
      a: 'Yes. Many of our solid wood dining tables, sofas, and media consoles can be customized to match your architectural requirements. Our interior concierge can provide wood finish samples and Belgian fabric swatches directly to your doorstep.'
    },
    {
      q: 'What is covered under the MNC Lifestyle Structural Warranty?',
      a: businessConfig.warranty.details
    },
    {
      q: 'How do I arrange a private showroom visit?',
      a: 'Our showroom salons are open for private consultations by appointment to give each client dedicated time with a Senior Interior Designer. Simply select "Showroom Visit" on this form, click the Book Showroom Visit button, or contact our concierge.'
    }
  ];

  return (
    <div className="py-12 sm:py-20 pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-warmgrey mb-6">
          <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">Contact & Concierge</span>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-bronze font-semibold block mb-2">
            Client Concierge
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal font-normal tracking-tight mb-4">
            Connect With Our Design Studio
          </h1>
          <p className="text-sm sm:text-base text-warmgrey leading-relaxed">
            Whether you are furnishing a new residence, requesting material swatches, or booking a private showroom viewing, our dedicated advisors are here to guide your vision.
          </p>
        </div>

        {/* 2-Column: Left Contact Info & Hours / Right Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-24">
          
          {/* Left Column: Studio & Showroom Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-beige-300 shadow-soft space-y-6">
              <h2 className="font-serif text-2xl text-charcoal font-medium border-b border-beige-200 pb-4">
                Studio Information
              </h2>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-beige-100 text-bronze flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                    Flagship Showroom & Studio
                  </h4>
                  <p className="text-xs text-warmgrey mt-1 leading-relaxed">
                    MNC Lifestyle Design Gallery<br />
                    Premier Design District, Suite 400<br />
                    (Viewing by Private Appointment)
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsShowroomModalOpen(true)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-espresso text-white text-xs uppercase tracking-wider font-semibold rounded-lg hover:bg-bronze transition-colors shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5 text-bronze-light" />
                    <span>Book Private Showroom Visit</span>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-beige-100 text-bronze flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                    Concierge Hours
                  </h4>
                  <p className="text-xs text-warmgrey mt-1">
                    Monday – Friday: 9:00 AM – 6:00 PM<br />
                    Saturday: 10:00 AM – 5:00 PM<br />
                    Sunday: Closed for private studio maintenance
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-beige-100 text-bronze flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                    Telephone Concierge
                  </h4>
                  <p className="text-xs text-warmgrey mt-1">
                    Direct Client Advisory Desk<br />
                    <span className="text-charcoal font-medium">Inquiry line: Mon – Sat during studio hours</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-beige-100 text-bronze flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                    Written Specifications
                  </h4>
                  <p className="text-xs text-warmgrey mt-1">
                    concierge@mnclifestyle.com<br />
                    trade@mnclifestyle.com (Architect & Designer Portal)
                  </p>
                </div>
              </div>
            </div>

            {/* Trade & Architect Note */}
            <div className="bg-espresso text-ivory-100 p-8 rounded-3xl shadow-soft">
              <span className="text-[11px] uppercase tracking-widest text-bronze-light font-semibold block mb-1">
                For Interior Architects & Designers
              </span>
              <h3 className="font-serif text-xl text-white font-medium mb-2">
                The MNC Trade Program
              </h3>
              <p className="text-xs text-warmgrey-light leading-relaxed mb-4">
                Enjoy tiered trade pricing, 3D CAD models, reserved showroom slots, and dedicated production tracking for your residential and hospitality projects.
              </p>
              <span className="text-xs text-bronze-light font-semibold">
                Select "Trade Inquiry" in the form to register.
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-beige-300 shadow-soft">
              
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-bronze/10 text-bronze flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-3xl text-charcoal font-medium">
                    Thank You for Reaching Out
                  </h3>
                  <p className="text-sm text-warmgrey max-w-md mx-auto leading-relaxed">
                    Your inquiry has been received in our front-end demonstration system. A dedicated MNC Lifestyle client concierge specialist typically responds within one business day.
                  </p>
                  
                  <div className="bg-ivory p-4 rounded-xl border border-beige-300 max-w-sm mx-auto text-left text-xs space-y-1 text-charcoal-700 my-6">
                    <div><strong>Name:</strong> {formData.fullName}</div>
                    <div><strong>Email:</strong> {formData.email}</div>
                    <div><strong>Interest:</strong> {formData.inquiryType} ({formData.projectScope})</div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-charcoal text-white text-xs uppercase tracking-widest rounded-lg hover:bg-bronze transition-colors"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl text-charcoal font-medium">
                      Send a Message to Our Studio
                    </h2>
                    <p className="text-xs text-warmgrey mt-1">
                      Fill out the details below. Our client advisory team will respond promptly.
                    </p>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Eleanor Vance"
                        className="w-full bg-ivory/60 border border-beige-300 rounded-lg px-3.5 py-2.5 text-xs text-charcoal placeholder:text-warmgrey focus:outline-none focus:border-bronze"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. eleanor@residence.com"
                        className="w-full bg-ivory/60 border border-beige-300 rounded-lg px-3.5 py-2.5 text-xs text-charcoal placeholder:text-warmgrey focus:outline-none focus:border-bronze"
                      />
                    </div>
                  </div>

                  {/* Phone & Inquiry Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-ivory/60 border border-beige-300 rounded-lg px-3.5 py-2.5 text-xs text-charcoal placeholder:text-warmgrey focus:outline-none focus:border-bronze"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                        Inquiry Nature
                      </label>
                      <select
                        value={formData.inquiryType}
                        onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                        className="w-full bg-ivory/60 border border-beige-300 rounded-lg px-3 py-2.5 text-xs text-charcoal focus:outline-none focus:border-bronze"
                      >
                        <option value="Showroom Visit">Private Showroom Appointment</option>
                        <option value="General Question">Product Specifications & Pricing</option>
                        <option value="Swatch Kit">Complimentary Fabric & Wood Swatches</option>
                        <option value="Trade Inquiry">Trade & Interior Architecture Partnership</option>
                        <option value="Custom Dimensions">Bespoke Dimension Request</option>
                      </select>
                    </div>
                  </div>

                  {/* Room / Scope */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                      Room or Category of Interest
                    </label>
                    <select
                      value={formData.projectScope}
                      onChange={(e) => setFormData({ ...formData, projectScope: e.target.value })}
                      className="w-full bg-ivory/60 border border-beige-300 rounded-lg px-3 py-2.5 text-xs text-charcoal focus:outline-none focus:border-bronze"
                    >
                      <option value="Living Room">Living Room Furniture (Sofas, Loungers, Coffee Tables)</option>
                      <option value="Bedroom">Bedroom Suites & Beds</option>
                      <option value="Dining Room">Dining Room (Monolithic Tables, Chairs, Buffets)</option>
                      <option value="Executive Office">Executive Workspaces & Desks</option>
                      <option value="Whole Residence">Comprehensive Whole-Home Curation</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                      Your Message or Project Details *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Share your timeline, room layout dimensions, or any specific finish requests..."
                      className="w-full bg-ivory/60 border border-beige-300 rounded-lg p-3.5 text-xs text-charcoal placeholder:text-warmgrey focus:outline-none focus:border-bronze"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 bg-espresso text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-bronze transition-colors flex items-center justify-center gap-2 shadow-soft"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry to Client Concierge</span>
                    </button>
                    <p className="text-[11px] text-warmgrey text-center mt-3">
                      Demonstration frontend mode: Validates and shows confirmation locally without remote server dispatch.
                    </p>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>

        {/* Interactive FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[0.25em] text-bronze font-semibold block mb-2">
              Common Questions
            </span>
            <h3 className="font-serif text-3xl text-charcoal font-medium">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-beige-300 overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-base sm:text-lg text-charcoal hover:text-bronze transition-colors"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-bronze flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-warmgrey flex-shrink-0" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-warmgrey leading-relaxed border-t border-beige-200 pt-3 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Showroom Booking Modal Dialog */}
        <ShowroomModal 
          isOpen={isShowroomModalOpen} 
          onClose={() => setIsShowroomModalOpen(false)} 
        />

      </div>
    </div>
  );
}

