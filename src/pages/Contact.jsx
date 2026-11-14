import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, CheckCircle2, ChevronDown, ChevronUp, Send, Sparkles, Calendar, MessageCircle, ArrowRight, Navigation } from 'lucide-react';
import { businessConfig } from '../data/businessConfig';
import ShowroomModal from '../components/ShowroomModal';
import { getWhatsAppConsultationUrl, buildWhatsAppUrl, WHATSAPP_DISPLAY_PHONE } from '../utils/whatsapp';

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    inquiryType: 'Showroom Visit',
    projectScope: 'Living Room',
    message: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [isShowroomModalOpen, setIsShowroomModalOpen] = useState(false);
  const whatsappUrl = getWhatsAppConsultationUrl('General Concierge Inquiry');

  const validate = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }
    if (!formData.phone.trim() && !formData.email.trim()) {
      errors.phone = 'Please provide a contact phone or WhatsApp number.';
    }
    if (!formData.message.trim()) {
      errors.message = 'Please share your room dimensions or piece requirements.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
      setFormErrors({});
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormErrors({});
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
      q: 'How does the White-Glove delivery and installation process work in Andhra Pradesh?',
      a: 'All MNC LifeStyle furniture suites include complimentary scheduled white-glove service across Visakhapatnam, Vijayawada, and surrounding Andhra Pradesh. Our two-person logistics team brings each piece into your designated room of choice, unboxes, levels, performs complete assembly, and removes all packaging materials.'
    },
    {
      q: 'How does ordering through WhatsApp work?',
      a: 'Browse our collection, select your desired piece and finishes, and click "Order Through WhatsApp". You will be connected immediately with our senior Visakhapatnam furniture concierge. We confirm timber stock, verify your pin code delivery, share fabric photos if requested, and coordinate dispatch.'
    },
    {
      q: 'Can furniture pieces be customized with bespoke dimensions or fabrics?',
      a: 'Yes. Most of our solid Teakwood dining tables, modular sectionals, and wardrobes can be customized to match your floor plan dimensions. Our interior concierge can provide wood finish samples and Belgian bouclé swatches directly to your doorstep.'
    },
    {
      q: 'What is covered under the MNC LifeStyle 10-Year Craftsmanship Warranty?',
      a: businessConfig.warranty.framing + ' ' + businessConfig.warranty.details
    },
    {
      q: 'How do I arrange a private Experience Centre visit in Visakhapatnam?',
      a: 'Our Visakhapatnam Flagship Experience Centre on VIP Road, Siripuram is open for walk-ins and private appointments. Click "Book Private Experience Centre Visit" above or message us on WhatsApp.'
    }
  ];

  const whatsappDirectFormUrl = buildWhatsAppUrl(`Hello MNC LifeStyle Concierge,

I am submitting an enquiry from your website contact page:
• Name: ${formData.fullName}
• Phone: ${formData.phone || 'N/A'}
• Email: ${formData.email || 'N/A'}
• Enquiry Type: ${formData.inquiryType}
• Project Room: ${formData.projectScope}
• Message: ${formData.message}

Please get in touch with me.`);

  return (
    <div className="py-12 sm:py-20 pb-28">
      <div className="max-w-[1672px] mx-auto px-4 sm:px-8 lg:px-[50px]">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-warmgrey mb-6">
          <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">Contact & Concierge</span>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#D69A4B] font-semibold block mb-2">
            Client Concierge & Experience Centre
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal font-normal tracking-tight mb-4">
            Connect With Our Design Studio
          </h1>
          <p className="text-sm sm:text-base text-warmgrey leading-relaxed">
            Whether you are furnishing a new apartment, requesting timber swatches, or ordering furniture pieces via WhatsApp, our dedicated Visakhapatnam advisors are here to assist.
          </p>
        </div>

        {/* 2-Column: Left Contact Info & Hours / Right Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-24 max-w-7xl mx-auto">
          
          {/* Left Column: Studio & Showroom Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-[#E9D8C5] shadow-soft space-y-6">
              <h2 className="font-serif text-2xl text-charcoal font-medium border-b border-[#E9D8C5]/60 pb-4">
                Visakhapatnam Experience Centre
              </h2>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-[#F8F0E8] text-[#D69A4B] flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                    MNC LifeStyle Furniture
                  </h4>
                  <p className="text-xs text-warmgrey mt-1 leading-relaxed">
                    Visakhapatnam, Andhra Pradesh, India<br />
                    (Walk-ins & Private Appointments Welcome)
                  </p>
                  
                  {/* Google Maps Quick Links */}
                  <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs">
                    <a
                      href="https://www.google.com/maps?q=17.80386734008789,83.2098159790039&z=17&hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D69A4B] hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <span>View on Google Maps</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                    <span className="text-[#E9D8C5]">•</span>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=17.80386734008789,83.2098159790039"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#211710] hover:text-[#D69A4B] font-semibold inline-flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3 text-[#D69A4B]" />
                      <span>Get Directions</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsShowroomModalOpen(true)}
                    className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 bg-[#211710] text-white text-xs uppercase tracking-wider font-semibold rounded-lg hover:bg-[#D69A4B] hover:text-[#211710] transition-colors shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#D69A4B]" />
                    <span>Book Private Viewing</span>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-[#F8F0E8] text-[#25D366] flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                    Instant WhatsApp Support
                  </h4>
                  <p className="text-xs text-warmgrey mt-1 leading-relaxed">
                    Chat directly with our senior furniture consultants for immediate quotes and wood samples.<br />
                    <a
                      href="https://wa.me/918790943457"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] font-bold hover:underline inline-block mt-1"
                    >
                      Chat on WhatsApp: {businessConfig.contact.displayPhone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-[#F8F0E8] text-[#D69A4B] flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                    Studio & Concierge Hours
                  </h4>
                  <p className="text-xs text-warmgrey mt-1">
                    Monday – Saturday: 9:30 AM – 8:00 PM<br />
                    Sunday: 10:30 AM – 6:00 PM (Showroom Open)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-[#F8F0E8] text-[#D69A4B] flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                    Direct Telephone
                  </h4>
                  <p className="text-xs text-warmgrey mt-1">
                    <a href={`tel:${businessConfig.contact.phoneRaw}`} className="text-charcoal font-medium hover:text-[#D69A4B]">
                      {businessConfig.contact.phone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-[#F8F0E8] text-[#D69A4B] flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                    Email Inquiries
                  </h4>
                  <p className="text-xs text-warmgrey mt-1">
                    <a href={`mailto:${businessConfig.contact.email}`} className="text-charcoal font-medium hover:text-[#D69A4B]">
                      {businessConfig.contact.email}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Trade & Architect Note */}
            <div className="bg-[#211710] text-[#F8F0E8] p-8 rounded-3xl shadow-soft">
              <span className="text-[11px] uppercase tracking-widest text-[#D69A4B] font-semibold block mb-1">
                For Interior Designers & Architects in AP & Telangana
              </span>
              <h3 className="font-serif text-xl text-white font-medium mb-2">
                The MNC Trade Program
              </h3>
              <p className="text-xs text-[#E9D8C5]/80 leading-relaxed mb-4">
                Enjoy trade pricing, custom wood finishing, 3D CAD models, and dedicated production tracking for your residential and commercial projects.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#D69A4B] font-bold hover:underline"
              >
                <span>Register via WhatsApp Concierge &rarr;</span>
              </a>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E9D8C5] shadow-soft">
              
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#D69A4B]/20 text-[#D69A4B] flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-3xl text-charcoal font-medium">
                    Thank You for Reaching Out
                  </h3>
                  <p className="text-sm text-warmgrey max-w-md mx-auto leading-relaxed">
                    Your inquiry has been received. Our senior furniture concierge typically responds within 2 hours during studio hours.
                  </p>
                  
                  <div className="bg-[#F8F0E8] p-4 rounded-xl border border-[#E9D8C5] max-w-sm mx-auto text-left text-xs space-y-1 text-charcoal my-6">
                    <div><strong>Name:</strong> {formData.fullName}</div>
                    <div><strong>Contact:</strong> {formData.phone || formData.email}</div>
                    <div><strong>Interest:</strong> {formData.inquiryType} ({formData.projectScope})</div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={whatsappDirectFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-[#25D366] text-white text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-[#20ba5a] transition-colors flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Send to WhatsApp Now</span>
                    </a>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 bg-[#211710] text-white text-xs uppercase tracking-widest rounded-lg hover:bg-bronze transition-colors"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
                  <div className="pb-1 border-b border-[#E9D8C5]/60">
                    <h2 className="font-serif text-2xl text-charcoal font-medium">
                      Send a Message to Our Visakhapatnam Studio
                    </h2>
                    <p className="text-xs text-warmgrey mt-1">
                      Fill out the details below. Our client advisory team will respond promptly.
                    </p>
                  </div>

                  {/* Name and Mobile Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                        Your Full Name <span className="text-[#D69A4B] font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value });
                          if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: null });
                        }}
                        placeholder="e.g. Rajesh Sharma"
                        className={`w-full h-11 sm:h-12 bg-white/80 border rounded-xl px-4 text-xs sm:text-sm text-charcoal placeholder:text-warmgrey focus:outline-none focus:ring-2 focus:ring-[#D69A4B]/30 focus:border-[#D69A4B] transition-all ${
                          formErrors.fullName ? 'border-red-400 bg-red-50/20' : 'border-[#E9D8C5]'
                        }`}
                      />
                      {formErrors.fullName && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.fullName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                        WhatsApp Mobile Number <span className="text-[#D69A4B] font-bold">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (formErrors.phone) setFormErrors({ ...formErrors, phone: null });
                        }}
                        placeholder="e.g. +91 87909 43457"
                        className={`w-full h-11 sm:h-12 bg-white/80 border rounded-xl px-4 text-xs sm:text-sm text-charcoal placeholder:text-warmgrey focus:outline-none focus:ring-2 focus:ring-[#D69A4B]/30 focus:border-[#D69A4B] transition-all ${
                          formErrors.phone ? 'border-red-400 bg-red-50/20' : 'border-[#E9D8C5]'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Email & Inquiry Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. rajesh@example.com"
                        className="w-full h-11 sm:h-12 bg-white/80 border border-[#E9D8C5] rounded-xl px-4 text-xs sm:text-sm text-charcoal placeholder:text-warmgrey focus:outline-none focus:ring-2 focus:ring-[#D69A4B]/30 focus:border-[#D69A4B] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                        Inquiry Nature
                      </label>
                      <select
                        value={formData.inquiryType}
                        onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                        className="w-full h-11 sm:h-12 bg-white/80 border border-[#E9D8C5] rounded-xl px-4 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-[#D69A4B]/30 focus:border-[#D69A4B] transition-all cursor-pointer"
                      >
                        <option value="WhatsApp Order Inquiry">WhatsApp Order Inquiry</option>
                        <option value="Showroom Visit">Private Showroom Visit</option>
                        <option value="Custom Dimensions">Custom Dimensions & Wood Selection</option>
                        <option value="Trade / Architect Inquiry">Trade / Architect Partnership</option>
                      </select>
                    </div>
                  </div>

                  {/* Project Scope */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                      Room / Furniture Category
                    </label>
                    <select
                      value={formData.projectScope}
                      onChange={(e) => setFormData({ ...formData, projectScope: e.target.value })}
                      className="w-full h-11 sm:h-12 bg-white/80 border border-[#E9D8C5] rounded-xl px-4 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-[#D69A4B]/30 focus:border-[#D69A4B] transition-all cursor-pointer"
                    >
                      <option value="Living Room / Sofas">Living Room (Sofas, Sectionals, Centre Tables)</option>
                      <option value="Dining Room">Dining Room (Dining Sets, Sideboards)</option>
                      <option value="Bedroom Suites">Bedroom Suites & Beds</option>
                      <option value="Study & Office">Home Office & Study Tables</option>
                      <option value="Complete Home Curation">Complete Home / Multi-Room Package</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                      Your Requirements or Questions <span className="text-[#D69A4B] font-bold">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (formErrors.message) setFormErrors({ ...formErrors, message: null });
                      }}
                      placeholder="Tell us about your room dimensions, preferred wood species, or pieces you are interested in..."
                      className={`w-full bg-white/80 border rounded-xl p-4 text-xs sm:text-sm text-charcoal placeholder:text-warmgrey focus:outline-none focus:ring-2 focus:ring-[#D69A4B]/30 focus:border-[#D69A4B] transition-all min-h-[110px] ${
                        formErrors.message ? 'border-red-400 bg-red-50/20' : 'border-[#E9D8C5]'
                      }`}
                    />
                    {formErrors.message && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.message}</p>
                    )}
                  </div>

                  {/* Submit Button — Prominent Luxury CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full h-12 sm:h-13 bg-[#211710] hover:bg-[#D69A4B] text-[#F8F0E8] hover:text-[#211710] text-xs sm:text-sm uppercase tracking-[0.16em] font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <Send className="w-4 h-4 shrink-0" />
                      <span>Submit Consultation Request</span>
                    </button>
                    <p className="text-[11px] text-warmgrey text-center mt-2.5 font-sans">
                      We respect your privacy. No marketing spam.
                    </p>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

        {/* Google Maps Experience Centre Section */}
        <section className="mb-20 sm:mb-24 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-[#E9D8C5] overflow-hidden shadow-soft">
            
            {/* Location Heading & Action Buttons */}
            <div className="p-6 sm:p-8 lg:p-10 border-b border-[#E9D8C5] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#F8F0E8]/40">
              <div>
                <div className="flex items-center gap-2 text-[#D69A4B] text-xs uppercase tracking-[0.2em] font-bold mb-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>Showroom & Experience Centre</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#211710] font-normal tracking-tight">
                  MNC LifeStyle Furniture
                </h2>
                <p className="text-xs sm:text-sm text-[#766B61] mt-1 font-sans">
                  Visakhapatnam, Andhra Pradesh, India
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://www.google.com/maps?q=17.80386734008789,83.2098159790039&z=17&hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl border border-[#211710] text-[#211710] hover:bg-[#211710] hover:text-white text-xs uppercase tracking-wider font-semibold transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span>View on Google Maps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=17.80386734008789,83.2098159790039"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-[#211710] hover:bg-[#D69A4B] hover:text-[#211710] text-white text-xs uppercase tracking-widest font-bold transition-all duration-200 inline-flex items-center gap-2 shadow-xs"
                >
                  <Navigation className="w-4 h-4 text-[#D69A4B]" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>

            {/* Responsive Map Container */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[350px] sm:min-h-[440px] bg-[#E9D8C5]/20">
              <iframe
                title="MNC LifeStyle Google Maps Location"
                src="https://www.google.com/maps?q=17.80386734008789,83.2098159790039&z=17&output=embed"
                className="w-full h-full border-0 absolute inset-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D69A4B] font-semibold block mb-2">
              Frequently Asked Questions
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal tracking-tight">
              White-Glove Service & Ordering
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#E9D8C5] overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-serif text-lg text-charcoal hover:text-[#D69A4B] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#D69A4B] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-warmgrey flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-sm sm:text-[15px] text-[#38302A] leading-relaxed border-t border-[#E9D8C5]/40 pt-4 font-sans">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Showroom Booking Modal */}
      <ShowroomModal
        isOpen={isShowroomModalOpen}
        onClose={() => setIsShowroomModalOpen(false)}
      />
    </div>
  );
}
