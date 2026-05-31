/**
 * Currency Configuration
 * 
 * Supported currencies for price conversion
 * Base currency: CNY (Chinese Yuan)
 */

export const SUPPORTED_CURRENCIES = ['CNY', 'USD', 'EUR', 'HKD'] as const

export type Currency = typeof SUPPORTED_CURRENCIES[number]

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  HKD: 'HK$'
}

export const CURRENCY_NAMES: Record<Currency, string> = {
  CNY: 'Chinese Yuan',
  USD: 'US Dollar',
  EUR: 'Euro',
  HKD: 'Hong Kong Dollar'
}

export const CURRENCY_FLAGS: Record<Currency, string> = {
  CNY: '🇨🇳',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  HKD: '🇭🇰'
}

export const DEFAULT_CURRENCY: Currency = 'CNY'

/**
 * Map language locale to default currency
 */
export function mapLanguageToCurrency(language: string): Currency {
  const lang = language.toLowerCase()
  
  if (lang.startsWith('zh')) return 'CNY'
  if (lang.startsWith('fr')) return 'EUR'
  if (lang.startsWith('en-hk') || lang.startsWith('zh-hk')) return 'HKD'
  if (lang.startsWith('en')) return 'USD'
  
  return DEFAULT_CURRENCY
}
