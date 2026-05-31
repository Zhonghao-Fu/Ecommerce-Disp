/**
 * Currency API Routes
 * 
 * GET /api/v1/currency/rates - Get current exchange rates
 * POST /api/v1/currency/convert - Convert amount between currencies
 */

import { Request, Response, Router } from 'express'
import { exchangeRateService } from '../services/exchange-rate.service'
import { SUPPORTED_CURRENCIES, type Currency } from '../config/currency'

const router = Router()

// ===== GET /api/v1/currency/rates - Get current exchange rates =====
router.get('/currency/rates', async (req: Request, res: Response) => {
  try {
    const baseParam = (req.query.base as string) || 'CNY'
    
    // Validate base currency
    if (!SUPPORTED_CURRENCIES.includes(baseParam as Currency)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CURRENCY',
          message: `Unsupported currency: ${baseParam}. Supported: ${SUPPORTED_CURRENCIES.join(', ')}`
        }
      })
    }

    const base = baseParam as Currency
    const { rates, updatedAt, source } = await exchangeRateService.getRates(base)

    res.json({
      success: true,
      data: {
        base,
        rates,
        updatedAt,
        source,
        supportedCurrencies: SUPPORTED_CURRENCIES
      }
    })
  } catch (error: any) {
    console.error('[Currency API] Error fetching rates:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'RATES_FETCH_FAILED',
        message: 'Failed to fetch exchange rates'
      }
    })
  }
})

// ===== POST /api/v1/currency/convert - Convert amount =====
router.post('/currency/convert', async (req: Request, res: Response) => {
  try {
    const { amount, from, to } = req.body

    // Validate inputs
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_AMOUNT',
          message: 'Amount is required'
        }
      })
    }

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CURRENCY',
          message: 'Both "from" and "to" currencies are required'
        }
      })
    }

    if (!SUPPORTED_CURRENCIES.includes(from as Currency)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FROM_CURRENCY',
          message: `Unsupported "from" currency: ${from}`
        }
      })
    }

    if (!SUPPORTED_CURRENCIES.includes(to as Currency)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TO_CURRENCY',
          message: `Unsupported "to" currency: ${to}`
        }
      })
    }

    // Get rates
    const { rates, updatedAt, source } = await exchangeRateService.getRates(from as Currency)
    
    // Convert
    const convertedAmount = exchangeRateService.convert(
      amount,
      from as Currency,
      to as Currency,
      rates
    )

    res.json({
      success: true,
      data: {
        amount,
        from,
        to,
        convertedAmount,
        rate: rates[to],
        updatedAt,
        source
      }
    })
  } catch (error: any) {
    console.error('[Currency API] Error converting amount:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSION_FAILED',
        message: 'Failed to convert currency'
      }
    })
  }
})

export { router as CurrencyRouter }
