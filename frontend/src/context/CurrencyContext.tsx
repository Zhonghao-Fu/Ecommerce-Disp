/**
 * Currency Context
 * 
 * Manages currency state and provides price conversion utilities
 * Persists user's currency preference in localStorage
 * Fetches exchange rates from backend on mount
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

export type Currency = 'CNY' | 'USD' | 'EUR' | 'HKD'

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

const SUPPORTED_CURRENCIES: Currency[] = ['CNY', 'USD', 'EUR', 'HKD']

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  rates: Record<string, number> | null
  loading: boolean
  convert: (amount: number) => number
  formatPrice: (amount: number) => string
  formatPriceRange: (min: number | null, max: number | null) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

/**
 * Detect default currency from browser locale
 */
function detectCurrency(): Currency {
  if (typeof navigator === 'undefined') return 'CNY'
  
  const browserLang = navigator.language || 'en'
  const lang = browserLang.toLowerCase()
  
  if (lang.startsWith('zh')) return 'CNY'
  if (lang.startsWith('fr')) return 'EUR'
  if (lang.includes('hk') || lang.startsWith('zh-hk')) return 'HKD'
  if (lang.startsWith('en')) return 'USD'
  
  return 'CNY' // Default to CNY
}

interface CurrencyProviderProps {
  children: ReactNode
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency') as Currency | null
    if (saved && SUPPORTED_CURRENCIES.includes(saved)) {
      return saved
    }
    return detectCurrency()
  })

  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch exchange rates on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.CURRENCY_RATES, {
          params: { base: 'CNY' }
        })

        if (response.data.success) {
          setRates(response.data.data.rates)
          console.log(`[Currency] Rates loaded: ${response.data.data.source}`)
        }
      } catch (error) {
        console.error('[Currency] Failed to fetch rates:', error)
        // Use fallback rates
        setRates({ CNY: 1, USD: 0.138, EUR: 0.127, HKD: 1.079 })
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
  }, [])

  // Save currency preference to localStorage
  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('currency', newCurrency)
    console.log(`[Currency] Changed to ${newCurrency}`)
  }, [])

  // Convert CNY amount to current currency
  const convert = useCallback((amount: number): number => {
    if (!rates || currency === 'CNY') return amount
    
    const rate = rates[currency]
    if (!rate) return amount
    
    return Math.round(amount * rate * 100) / 100
  }, [rates, currency])

  // Format price with currency symbol
  const formatPrice = useCallback((amount: number): string => {
    const converted = convert(amount)
    const symbol = CURRENCY_SYMBOLS[currency]
    return `${symbol}${converted.toFixed(2)}`
  }, [convert, currency])

  // Format price range
  const formatPriceRange = useCallback((min: number | null, max: number | null): string => {
    const symbol = CURRENCY_SYMBOLS[currency]
    
    if (min !== null && max !== null) {
      return `${symbol}${convert(min).toFixed(2)} - ${symbol}${convert(max).toFixed(2)}`
    }
    if (min !== null && max === null) {
      return `${symbol}${convert(min).toFixed(2)}+`
    }
    if (min === null && max !== null) {
      return `${symbol}0.00 - ${symbol}${convert(max).toFixed(2)}`
    }
    return 'All prices'
  }, [convert, currency])

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rates,
        loading,
        convert,
        formatPrice,
        formatPriceRange
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}
