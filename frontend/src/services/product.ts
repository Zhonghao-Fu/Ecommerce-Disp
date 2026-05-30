import apiClient from './http'
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../config/api'
import type {
  ApiResponse,
  Product,
  ProductListItem,
  ProductFilterState,
  ProductQueryParams,
  PaginationInfo,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateStatusRequest
} from '../types'
import { centsToYuan, yuanToCents, parseImages, serializeImages } from '../utils'

/**
 * Transform backend product response to frontend format
 * Backend: cents, JSON string images
 * Frontend: yuan, array images
 */
function transformProductFromBackend(backendProduct: any): Product {
  return {
    ...backendProduct,
    price: centsToYuan(backendProduct.price),
    images: parseImages(backendProduct.images)
  }
}

/**
 * Transform backend product list item to frontend format
 */
function transformProductListItemFromBackend(backendProduct: any): ProductListItem {
  return {
    ...backendProduct,
    price: centsToYuan(backendProduct.price),
    images: parseImages(backendProduct.images)
  }
}

/**
 * Transform frontend product to backend format
 */
function transformProductToBackend(product: CreateProductRequest): any {
  return {
    ...product,
    price: yuanToCents(product.price),
    images: serializeImages(product.images || [])
  }
}

/**
 * Build query parameters from filter state
 */
function buildQueryParams(filters: ProductFilterState): ProductQueryParams {
  const params: ProductQueryParams = {
    page: filters.page,
    pageSize: filters.pageSize,
    status: filters.status === 'all' ? undefined : filters.status,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder
  }

  if (filters.keyword) {
    params.keyword = filters.keyword
  }

  if (filters.minPrice !== undefined && filters.minPrice !== null) {
    params.minPrice = yuanToCents(filters.minPrice)
  }

  if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
    params.maxPrice = yuanToCents(filters.maxPrice)
  }

  return params
}

/**
 * Product API Service
 * All product-related API calls
 */
export const productApi = {
  /**
   * Get paginated product list with filters
   */
  async getProducts(filters: Partial<ProductFilterState> = {}): Promise<{
    data: ProductListItem[]
    pagination: PaginationInfo
  }> {
    const defaultFilters: ProductFilterState = {
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...filters
    }

    const params = buildQueryParams(defaultFilters)
    const response = await apiClient.get<ApiResponse>(API_ENDPOINTS.PRODUCTS, { params })

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch products')
    }

    // Backend returns data as array directly, not nested in { products: [] }
    const products = (response.data.data as any[]).map(transformProductListItemFromBackend)

    return {
      data: products,
      pagination: response.data.pagination!
    }
  },

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse>(API_ENDPOINTS.PRODUCT_BY_ID(id))

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Product not found')
    }

    return transformProductFromBackend(response.data.data.product)
  },

  /**
   * Create new product
   */
  async createProduct(product: CreateProductRequest): Promise<Product> {
    const backendProduct = transformProductToBackend(product)
    const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.PRODUCTS, backendProduct)

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create product')
    }

    return transformProductFromBackend(response.data.data.product)
  },

  /**
   * Update product
   */
  async updateProduct(id: string, updates: UpdateProductRequest): Promise<Product> {
    const backendUpdates: any = { ...updates }
    
    if (updates.price !== undefined) {
      backendUpdates.price = yuanToCents(updates.price)
    }
    
    if (updates.images !== undefined) {
      backendUpdates.images = serializeImages(updates.images)
    }

    const response = await apiClient.put<ApiResponse>(
      API_ENDPOINTS.PRODUCT_BY_ID(id),
      backendUpdates
    )

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update product')
    }

    return transformProductFromBackend(response.data.data.product)
  },

  /**
   * Update product status
   */
  async updateProductStatus(id: string, status: UpdateStatusRequest['status']): Promise<Product> {
    const response = await apiClient.patch<ApiResponse>(
      API_ENDPOINTS.PRODUCT_BY_ID(id),
      { status }
    )

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update product status')
    }

    return transformProductFromBackend(response.data.data.product)
  },

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse>(API_ENDPOINTS.PRODUCT_BY_ID(id))

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete product')
    }
  }
}

export default productApi
