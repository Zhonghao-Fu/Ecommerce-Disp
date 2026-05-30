/**
 * Pagination information
 * Matches backend pagination response structure
 */
export interface PaginationInfo {
  page: number          // Current page number
  pageSize: number      // Items per page
  total: number         // Total items count
  totalPages: number    // Total pages count
}

/**
 * Generic API response wrapper
 * Matches backend response format: { success, data, error, pagination }
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  pagination?: PaginationInfo
  meta?: Record<string, any>
}

/**
 * API error structure
 * Matches backend error response format
 */
export interface ApiError {
  code: string          // Error code (e.g., 'NOT_FOUND', 'VALIDATION_ERROR')
  message: string       // User-friendly error message
  details?: any         // Additional error details (optional)
}

/**
 * Filter state for product list queries
 * Used in URL query parameters and component state
 */
export interface ProductFilterState {
  page: number
  pageSize: number
  keyword?: string
  minPrice?: number
  maxPrice?: number
  status: 'all' | 'on_sale' | 'off_sale'
  sortBy: 'price' | 'name' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}

/**
 * Query parameters for product list API
 * Matches backend productQuerySchema validation
 */
export interface ProductQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  minPrice?: number
  maxPrice?: number
  status?: 'all' | 'on_sale' | 'off_sale'
  sortBy?: 'price' | 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}
