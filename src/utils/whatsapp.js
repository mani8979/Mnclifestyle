/**
 * WhatsApp Integration Utility for MNC LifeStyle
 * Generates pre-filled, professional WhatsApp links for direct ordering and customer enquiries.
 * Target Business Phone: +91 87909 43457 (Raw: 918790943457 / Display: 8790943457)
 */

import { formatINR } from './currency';

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
 * Pre-filled message when a customer clicks "Order Through WhatsApp"
 */
export const getWhatsAppOrderUrl = ({ product, selectedColor, quantity = 1 }) => {
  if (!product) return `https://wa.me/${WHATSAPP_PHONE_NUMBER}`;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://mnclifestyle.in/product/${product.id}`;
  const price = formatINR(product.price);
  const sku = product.sku || `MNC-${product.category?.slice(0, 3)?.toUpperCase() || 'FURN'}-${product.id.slice(-2)}`;
  const variant = selectedColor || 'Standard';

  const message = `Hello MNC LifeStyle,

I am interested in ordering the following furniture:

Product: ${product.name}
SKU: ${sku}
Price: ${price}
Quantity: ${quantity}
Finish/Fabric: ${variant}
Product Link: ${currentUrl}

Please share availability and delivery details.`;

  return buildWhatsAppUrl(message);
};

/**
 * Pre-filled message when a customer clicks "Ask About This Product" or "Enquire on WhatsApp"
 */
export const getWhatsAppInquiryUrl = ({ product, topic = 'Product Enquiry' }) => {
  if (!product) return `https://wa.me/${WHATSAPP_PHONE_NUMBER}`;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://mnclifestyle.in/product/${product.id}`;
  const price = formatINR(product.price);

  const message = `Hello MNC LifeStyle Team,

I have an enquiry regarding ${product.name} (${product.sku || product.id}):
• Price: ${price}
• Topic: ${topic}
• Product Link: ${currentUrl}

Could you please share more information regarding wood finish, fabric samples, custom dimensions, and delivery lead time?

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

