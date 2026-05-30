import { useState, useCallback } from 'react'
import { productApi } from '../services'
import type { Product } from '../types'

interface UseProductDetailReturn {
  /** Product data */
  data: Product | null
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
  /** Fetch product by ID */
  fetchProduct: (id: string) => Promise<void>
  /** Clear product data */
  clearProduct: () => void
}

/**
 * Custom hook for fetching and managing single product detail
 */
export function useProductDetail(): UseProductDetailReturn {
  const [data, setData] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Fetch product by ID
   */
  const fetchProduct = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const product = await productApi.getProductById(id)
      setData(product)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch product')
      setError(error)
      console.error('useProductDetail error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Clear product data
   */
  const clearProduct = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    fetchProduct,
    clearProduct
  }
}

export default useProductDetail
