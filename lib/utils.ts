/**
 * Utility functions for the application
 */

import { formatPrice as formatPriceNew, priceToNumber, parsePrice, calculateDiscountPercentage } from './priceUtils';

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