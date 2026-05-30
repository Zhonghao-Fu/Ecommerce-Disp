import { useState, useCallback } from 'react'

interface UsePaginationOptions {
  /** Initial page number */
  initialPage?: number
  /** Page size */
  pageSize?: number
}

interface UsePaginationReturn {
  /** Current page number */
  currentPage: number
  /** Page size */
  pageSize: number
  /** Go to specific page */
  goToPage: (page: number) => void
  /** Go to next page */
  nextPage: () => void
  /** Go to previous page */
  prevPage: () => void
  /** Reset to initial page */
  reset: () => void
}

/**
 * Custom hook for managing pagination state
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { initialPage = 1, pageSize = 12 } = options

  const [currentPage, setCurrentPage] = useState(initialPage)

  const goToPage = useCallback((page: number) => {
    if (page < 1) return
    setCurrentPage(page)
  }, [])

  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1)
  }, [])

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }, [])

  const reset = useCallback(() => {
    setCurrentPage(initialPage)
  }, [initialPage])

  return {
    currentPage,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    reset
  }
}

export default usePagination
