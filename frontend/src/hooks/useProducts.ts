import { useState, useEffect, useCallback, useRef } from 'react'
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
  pageSize: 10,
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

  // Use ref to track current filters without causing re-renders
  const filtersRef = useRef(filters)
  
  // Update ref when filters change
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  /**
   * Fetch products from API
   */
  const fetchProducts = useCallback(async (overrideFilters?: Partial<ProductFilterState>) => {
    // Always use the latest filters from ref
    const currentFilters = overrideFilters || filtersRef.current
    
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
  }, [])  // No dependencies - always uses latest filters via ref

  /**
   * Update filters and reset to page 1
   */
  const updateFilters = useCallback((newFilters: Partial<ProductFilterState>) => {
    setFiltersState(prev => {
      // Check if filters actually changed to avoid unnecessary re-renders
      const merged = {
        ...prev,
        ...newFilters,
        page: newFilters.page || 1
      }
      
      // Only update if something changed
      if (
        merged.keyword === prev.keyword &&
        merged.minPrice === prev.minPrice &&
        merged.maxPrice === prev.maxPrice &&
        merged.status === prev.status &&
        merged.sortBy === prev.sortBy &&
        merged.sortOrder === prev.sortOrder &&
        merged.page === prev.page
      ) {
        return prev // No change, skip update
      }
      
      return merged
    })
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
   * Fetch products when filters change
   */
  useEffect(() => {
    if (autoFetch) {
      fetchProducts()
    }
  }, [filters.page, filters.keyword, filters.minPrice, filters.maxPrice, filters.status, filters.sortBy, filters.sortOrder, autoFetch])  // Depend on individual filter properties, not the whole object

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
