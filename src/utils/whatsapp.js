/**
 * WhatsApp Integration Utility for MNC LifeStyle
 * Generates pre-filled, professional WhatsApp links for direct product and concierge enquiries.
 * Target Business Phone: +91 87909 43457 (Raw: 918790943457 / Display: 8790943457)
 */

import { formatINR } from './currency';
import { slugify } from '../data/products';

export const WHATSAPP_PHONE_NUMBER = '918790943457';
export const WHATSAPP_DISPLAY_PHONE = '+91 87909 43457';
export const WHATSAPP_RAW_NUMBER = '8790943457';

/**
 * Builds a direct wa.me link with encoded text message
 */
export const buildWhatsAppUrl = (message) => {
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encoded}`;
};

/**
 * Pre-filled message when a customer clicks "Enquire Now" or "WhatsApp Enquiry"
 */
export const getWhatsAppInquiryUrl = ({ product, selectedColor, topic = 'Product Enquiry' }) => {
  if (!product) return `https://wa.me/${WHATSAPP_PHONE_NUMBER}`;

  const currentUrl = `https://mnclifestyle.in/product/${product.slug || slugify(product.name)}`;
  const price = formatINR(product.price);
  const variant =
    selectedColor ||
    (typeof product.colorName === 'string' && product.colorName.trim()) ||
    product.colors?.[0]?.name ||
    '';

  const message = `Hello MNC LifeStyle Team,

I have an enquiry regarding ${product.name}:
• Price: ${price}${variant ? `\n• Finish/Colour: ${variant}` : ''}
• Topic: ${topic}
• Product Link: ${currentUrl}

Could you please share more information regarding wood finish, fabric samples, custom dimensions, availability, and delivery lead time?

Looking forward to your assistance.`;

  return buildWhatsAppUrl(message);
};

/**
 * General consultation WhatsApp link (e.g., from top contact bar or consultation buttons)
 */
export const getWhatsAppConsultationUrl = (topic = 'Interior & Furniture Consultation') => {
  const message = `Hello MNC LifeStyle,

I would like to request a free design consultation for my home / office.
• Topic: ${topic}
• Location: Visakhapatnam / Andhra Pradesh / Pan-India

Please connect me with a senior interior & furniture specialist.

Thank you!`;

  return buildWhatsAppUrl(message);
};

