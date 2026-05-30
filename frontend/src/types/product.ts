/**
 * Product status enum
 * Matches backend ProductStatus values
 */
export type ProductStatus = 'on_sale' | 'off_sale'

/**
 * Product interface for API responses
 * Price is in Yuan (converted from backend cents)
 */
export interface Product {
  id: string                    // UUID
  name: string                  // Product name
  price: number                 // Price in Yuan (分 → 元)
  description: string           // Product description
  images: string[]              // Array of image URLs
  status: ProductStatus         // on_sale | off_sale
  createdAt: string             // ISO date string
  updatedAt?: string            // ISO date string (optional for list)
}

/**
 * Product list item (simplified version for grid display)
 * Contains only fields needed for product cards
 */
export interface ProductListItem {
  id: string
  name: string
  price: number
  images: string[]
  status: ProductStatus
  createdAt: string
}

/**
 * Create product request payload
 * Price in Yuan (will be converted to cents in API service)
 */
export interface CreateProductRequest {
  name: string
  price: number                 // Yuan
  description?: string
  images?: string[]
  status?: ProductStatus
}

/**
 * Update product request payload
 * All fields optional for partial updates
 */
export interface UpdateProductRequest {
  name?: string
  price?: number                // Yuan
  description?: string
  images?: string[]
  status?: ProductStatus
}

/**
 * Update product status request
 */
export interface UpdateStatusRequest {
  status: ProductStatus
}
