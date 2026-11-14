/**
 * Currency Utility for MNC LifeStyle
 * Formats prices in Indian Rupees (INR) using Indian numbering system (Lakhs / Crores).
 */

export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }

  // Format using Indian locale (en-IN)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  return formatter.format(amount);
};

export const calculateDiscount = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= price) return null;
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  return `${discount}% OFF`;
};

