import { useState, useEffect, useCallback } from 'react'
import { productApi } from '../services'
import type { ProductListItem, ProductFilterState, PaginationInfo } from '../types'

interface UseProductsOptions {
  /** Initial filter state */
  initialFilters?: Partial<ProductFilterState>
  /** Whether to auto-fetch on mount */
  autoFetch?: boolean
}

interface UseProductsReturn {
  /** Product list data */
  data: ProductListItem[]
  /** Pagination info */
  pagination: PaginationInfo | null
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
  /** Current filter state */
  filters: ProductFilterState
  /** Fetch products with filters */
  fetchProducts: (filters?: Partial<ProductFilterState>) => Promise<void>
  /** Update filters and refetch */
  setFilters: (filters: Partial<ProductFilterState>) => void
  /** Reset to initial filters */
  resetFilters: () => void
}

const DEFAULT_FILTERS: ProductFilterState = {
  page: 1,
  pageSize: 12,
  status: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc'
}

/**
 * Custom hook for fetching and managing product list
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { initialFilters = {}, autoFetch = true } = options

  const [data, setData] = useState<ProductListItem[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFiltersState] = useState<ProductFilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  })

  /**
   * Fetch products from API
   */
  const fetchProducts = useCallback(async (overrideFilters?: Partial<ProductFilterState>) => {
    const currentFilters = overrideFilters || filters
    
    setLoading(true)
    setError(null)

    try {
      const result = await productApi.getProducts(currentFilters)
      setData(result.data)
      setPagination(result.pagination)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch products')
      setError(error)
      console.error('useProducts error:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  /**
   * Update filters and reset to page 1
   */
  const updateFilters = useCallback((newFilters: Partial<ProductFilterState>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1  // Reset to page 1 on filter change
    }))
  }, [])

  /**
   * Reset filters to initial state
   */
  const resetFilters = useCallback(() => {
    setFiltersState({
      ...DEFAULT_FILTERS,
      ...initialFilters
    })
  }, [initialFilters])

  /**
   * Auto-fetch on mount or filters change
   */
  useEffect(() => {
    if (autoFetch) {
      fetchProducts()
    }
  }, [autoFetch, fetchProducts])

  return {
    data,
    pagination,
    loading,
    error,
    filters,
    fetchProducts,
    setFilters: updateFilters,
    resetFilters
  }
}

export default useProducts
