/**
 * Exchange Rate Service
 * 
 * Fetches real-time exchange rates from ExchangeRate-API
 * Implements 4-hour memory caching to reduce API calls
 * Provides fallback rates when API is unavailable
 */

import fetch from 'node-fetch'
import { DEFAULT_CURRENCY, type Currency } from '../config/currency'

interface CacheEntry {
  rates: Record<string, number>
  timestamp: number
}

interface ApiResponse {
  result: string
  base_code: string
  conversion_rates: Record<string, number>
}

class ExchangeRateService {
  private cache: Map<string, CacheEntry> = new Map()
  private CACHE_TTL = 4 * 60 * 60 * 1000 // 4 hours in milliseconds
  
  // Fallback rates (updated manually if needed)
  // Base: CNY (Chinese Yuan)
  private FALLBACK_RATES: Record<Currency, Record<Currency, number>> = {
    CNY: { CNY: 1, USD: 0.138, EUR: 0.127, HKD: 1.079 },
    USD: { CNY: 7.25, USD: 1, EUR: 0.92, HKD: 7.82 },
    EUR: { CNY: 7.88, USD: 1.09, EUR: 1, HKD: 8.50 },
    HKD: { CNY: 0.927, USD: 0.128, EUR: 0.118, HKD: 1 }
  }

  /**
   * Get exchange rates for a base currency
   * Returns cached rates if available and not expired
   * Otherwise fetches fresh rates from API
   */
  async getRates(base: Currency = DEFAULT_CURRENCY): Promise<{
    rates: Record<string, number>
    updatedAt: Date
    source: 'api' | 'cache' | 'fallback'
  }> {
    const cacheKey = `rates_${base}`
    const cached = this.cache.get(cacheKey)
    
    // Check if we have valid cached data
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`[ExchangeRate] Using cached rates for ${base}`)
      return {
        rates: cached.rates,
        updatedAt: new Date(cached.timestamp),
        source: 'cache'
      }
    }

    // Try to fetch from API
    try {
      console.log(`[ExchangeRate] Fetching rates from API for ${base}`)
      const rates = await this.fetchFromApi(base)
      
      // Update cache
      this.cache.set(cacheKey, {
        rates,
        timestamp: Date.now()
      })
      
      return {
        rates,
        updatedAt: new Date(),
        source: 'api'
      }
    } catch (error) {
      console.error(`[ExchangeRate] API failed for ${base}, using fallback rates:`, error)
      
      // Use fallback rates
      return {
        rates: this.FALLBACK_RATES[base],
        updatedAt: new Date(),
        source: 'fallback'
      }
    }
  }

  /**
   * Fetch exchange rates from ExchangeRate-API
   * Free tier: 1500 requests/month, updates hourly
   */
  private async fetchFromApi(base: Currency): Promise<Record<string, number>> {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY
    const url = apiKey
      ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`
      : `https://api.exchangerate-api.com/v4/latest/${base}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      timeout: 5000
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as ApiResponse
    
    if (data.result !== 'success') {
      throw new Error(`API returned error result`)
    }

    // Filter to only supported currencies
    const supportedRates: Record<string, number> = {}
    const supportedCurrencies = ['CNY', 'USD', 'EUR', 'HKD']
    
    for (const currency of supportedCurrencies) {
      if (data.conversion_rates[currency]) {
        supportedRates[currency] = data.conversion_rates[currency]
      }
    }

    return supportedRates
  }

  /**
   * Convert amount from one currency to another
   */
  convert(
    amount: number,
    from: Currency,
    to: Currency,
    rates: Record<string, number>
  ): number {
    if (from === to) return amount
    
    const rate = rates[to]
    if (!rate) {
      console.error(`[ExchangeRate] No rate found for ${to}`)
      return amount
    }

    return Math.round(amount * rate * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear()
    console.log('[ExchangeRate] Cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Singleton instance
export const exchangeRateService = new ExchangeRateService()
