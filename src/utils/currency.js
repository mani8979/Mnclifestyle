/**
 * Currency Utility for MNC LifeStyle
 * Formats prices in Indian Rupees (INR) using Indian numbering system (Lakhs / Crores).
 */

/**
 * Cached Intl.NumberFormat singleton for high-performance currency formatting
 */
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }

  return inrFormatter.format(amount);
};

export const calculateDiscount = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= price) return null;
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  return `${discount}% OFF`;
};

