/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Base URL from environment variable or default
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// API endpoints
export const API_ENDPOINTS = {
  // Product endpoints
  PRODUCTS: '/api/v1/products',
  PRODUCT_BY_ID: (id: string) => `/api/v1/products/${id}`,
  
  // Health check
  HEALTH: '/api/health'
} as const

// Default request timeout (ms)
export const API_TIMEOUT = 10000

// Default page size
export const DEFAULT_PAGE_SIZE = 12
