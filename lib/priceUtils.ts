/**
 * Simple price utilities for handling currency formatting and conversion
 */

/**
 * Format a number to PKR currency string
 */
export function formatPrice(
  price: number | string,
  options?: { currency?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  // Handle null, undefined, empty string cases
  if (price === null || price === undefined || price === '') {
    return 'Rs.0';
  }

  try {
    // Parse price to a number
    const numPrice =
      typeof price === 'string' ? parseInt(price.replace(/[^0-9.]/g, ''), 10) : price;

    // If price is zero or NaN, return default format
    if (isNaN(numPrice) || numPrice === 0) {
      return 'Rs.0';
    }

    // Format with locale string
    return `Rs.${numPrice.toLocaleString()}`;
  } catch (error) {
    console.error('Error formatting price:', error);
    return 'Rs.0';
  }
}

/**
 * Convert a price string to a number
 */
export function priceToNumber(price: string | number): number {
  if (price === null || price === undefined || price === '') {
    return 0;
  }

  if (typeof price === 'number') return price;
  try {
    return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
  } catch (error) {
    console.error('Error converting price to number:', error);
    return 0;
  }
}

/**
 * Parse a price string to a number
 */
export function parsePrice(price: string | number): number {
  return priceToNumber(price);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(
  regularPrice: number | string,
  salePrice: number | string
): number {
  const regular = priceToNumber(regularPrice);
  const sale = priceToNumber(salePrice);

  if (regular === 0) return 0;
  const discount = ((regular - sale) / regular) * 100;
  return Math.round(discount);
}

/**
 * Ensures a product has a valid numeric sellingPrice by extracting it from salePrice if needed
 */
export function ensureProductPrice<T extends { salePrice: string; sellingPrice?: number }>(
  product: T
): T & { sellingPrice: number } {
  // Clone the product to avoid modifying the original
  const result = { ...product } as T & { sellingPrice: number };

  // Check if sellingPrice already exists and is valid
  if (
    typeof result.sellingPrice === 'number' &&
    !isNaN(result.sellingPrice) &&
    result.sellingPrice > 0
  ) {
    return result;
  }

  // Extract numeric price from salePrice string
  result.sellingPrice = priceToNumber(result.salePrice);
  return result;
}
