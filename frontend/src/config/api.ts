/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Base URL from environment variable or default
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

// API endpoints
export const API_ENDPOINTS = {
  // Product endpoints
  PRODUCTS: '/api/v1/products',
  PRODUCT_BY_ID: (id: string) => `/api/v1/products/${id}`,
  PRODUCT_STATUS: (id: string) => `/api/v1/products/${id}/status`,
  
  // Import/Export endpoints
  PRODUCTS_EXPORT: '/api/v1/products/export',
  PRODUCTS_IMPORT: '/api/v1/products/import',
  PRODUCTS_TEMPLATE: '/api/v1/products/template',
  
  // Upload endpoints
  UPLOAD_PRODUCT: '/api/v1/upload/products',
  
  // Currency endpoints
  CURRENCY_RATES: '/api/v1/currency/rates',
  CURRENCY_CONVERT: '/api/v1/currency/convert',
  
  // Health check
  HEALTH: '/api/health'
} as const

// Default request timeout (ms)
export const API_TIMEOUT = 10000

// Default page size
export const DEFAULT_PAGE_SIZE = 12
