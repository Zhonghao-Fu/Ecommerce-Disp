/**
 * Convert cents to yuan
 * Backend stores prices in cents, frontend displays in yuan
 * 
 * @param cents - Price in cents (integer)
 * @returns Price in yuan (decimal)
 * 
 * @example
 * centsToYuan(29900) // Returns: 299
 * centsToYuan(899)   // Returns: 8.99
 */
export function centsToYuan(cents: number): number {
  return cents / 100
}

/**
 * Convert yuan to cents
 * Frontend inputs are in yuan, backend expects cents
 * 
 * @param yuan - Price in yuan (decimal)
 * @returns Price in cents (integer, rounded)
 * 
 * @example
 * yuanToCents(299)    // Returns: 29900
 * yuanToCents(8.99)   // Returns: 899
 */
export function yuanToCents(yuan: number): number {
  return Math.round(yuan * 100)
}

/**
 * Format price for display
 * Adds currency symbol and formats to 2 decimal places
 * 
 * @param price - Price in yuan
 * @param currency - Currency symbol (default: '¥')
 * @returns Formatted price string
 * 
 * @example
 * formatPrice(299)      // Returns: '¥299.00'
 * formatPrice(8.9)      // Returns: '¥8.90'
 * formatPrice(123.456)  // Returns: '¥123.46'
 */
export function formatPrice(price: number, currency: string = '¥'): string {
  return `${currency}${price.toFixed(2)}`
}

/**
 * Format price range for display
 * 
 * @param min - Minimum price in yuan
 * @param max - Maximum price in yuan
 * @param currency - Currency symbol (default: '¥')
 * @returns Formatted price range string
 * 
 * @example
 * formatPriceRange(0, 100)    // Returns: '¥0.00 - ¥100.00'
 * formatPriceRange(100, null) // Returns: '¥100.00+'
 * formatPriceRange(null, 500) // Returns: '¥0.00 - ¥500.00'
 */
export function formatPriceRange(
  min: number | null,
  max: number | null,
  currency: string = '¥'
): string {
  if (min !== null && max !== null) {
    return `${currency}${min.toFixed(2)} - ${currency}${max.toFixed(2)}`
  }
  if (min !== null && max === null) {
    return `${currency}${min.toFixed(2)}+`
  }
  if (min === null && max !== null) {
    return `${currency}0.00 - ${currency}${max.toFixed(2)}`
  }
  return 'All prices'
}
