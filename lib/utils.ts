/**
 * Utility functions for the application
 */

import {
  formatPrice as formatPriceNew,
  priceToNumber,
  parsePrice,
  calculateDiscountPercentage,
} from './priceUtils';

/**
 * @deprecated Use the formatPrice function from priceUtils.ts instead
 * Formats a price value to display in Rs. format with proper decimal places
 * @param price - The price to format (number or string)
 * @param showSymbol - Whether to include the Rs symbol (default: true)
 * @returns Formatted price string
 */
export function formatPrice(price: number | string, showSymbol: boolean = true): string {
  return formatPriceNew(price);
}

/**
 * @deprecated Use the priceToNumber function from priceUtils.ts instead
 * Ensures a price value is stored as a valid number for database operations
 * @param price - The price to normalize (number or string)
 * @returns Normalized price as a number
 */
export function normalizePrice(price: number | string | any): number {
  return priceToNumber(price);
}

// Re-export functions from priceUtils for convenience
export { priceToNumber, parsePrice, calculateDiscountPercentage };

/**
 * Convert a string to a URL-friendly slug
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Truncate a string to a maximum length
 * @param text - The text to truncate
 * @param maxLength - The maximum length
 * @returns The truncated string
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate a random ID
 * @param length - The length of the ID
 * @returns A random ID
 */
export function generateId(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

/**
 * Check if a URL is valid
 * @param url - The URL to validate
 * @returns True if the URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}
