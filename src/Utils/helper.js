/**
 * 1. Price Formatting (Indian Rupee - INR)
 * Example: 12500 -> ₹12,500
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0, // Decimal hatane ke liye (e.g. ₹12,500.00 nahi dikhega)
  }).format(amount);
};

/**
 * 2. Date Formatting
 * Example: "2025-12-03T14:18:00.000Z" -> "03 Dec, 2025"
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * 3. Text Truncate (Lambi text ko chota karna)
 * Example: "This is a very long description..." -> "This is a very..."
 * Default maxLength is 50 characters.
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};

/**
 * 4. Discount Percentage Calculator
 * Agar Original Price aur Selling Price hai, to % OFF nikalne ke liye
 * Example: Original: 1000, Selling: 800 -> Returns 20
 */
export const getDiscount = (originalPrice, sellingPrice) => {
  if (!originalPrice || !sellingPrice) return 0;
  const discount = ((originalPrice - sellingPrice) / originalPrice) * 100;
  return Math.round(discount);
};