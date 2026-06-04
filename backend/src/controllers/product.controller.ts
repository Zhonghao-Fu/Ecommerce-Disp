import { PrismaClient } from '@prisma/client'
import { NotFoundError, ValidationError, BusinessError } from '../middleware/errors'

const prisma = new PrismaClient()

// ===== Type Definitions =====

export interface ProductQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  minPrice?: number
  maxPrice?: number
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateProductInput {
  name: string
  price: number
  description?: string
  images?: string[]
  status?: 'on_sale' | 'off_sale'
}

export interface UpdateProductInput {
  name?: string
  price?: number
  description?: string
  images?: string[]
  status?: 'on_sale' | 'off_sale'
}

// ===== Utility Functions =====

// Convert yuan to cents
const yuanToCents = (yuan: number): number => {
  return Math.round(yuan * 100)
}

// Convert cents to yuan
const centsToYuan = (cents: number): number => {
  return cents / 100
}

// Parse images JSON string safely
const parseImages = (imagesStr: string): string[] => {
  try {
    return JSON.parse(imagesStr)
  } catch {
    return []
  }
}

// ===== Controller Methods =====

export const ProductController = {
  // Get products list with pagination and filtering
  async getProducts(params: ProductQueryParams) {
    const {
      page = 1,
      pageSize = 12,
      keyword,
      minPrice,
      maxPrice,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params

    // Build where clause
    const where: any = {}

    // Status filter: only filter if explicitly set to 'on_sale' or 'off_sale'
    // 'all' or undefined means no status filter
    if (status === 'on_sale') {
      where.status = 'on_sale'
    } else if (status === 'off_sale') {
      where.status = 'off_sale'
    }
    // 'all' or undefined: no status filter applied (shows all products)

    // Keyword search (name or description)
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } }
      ]
    }

    // Price range filter (convert yuan to cents)
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) {
        where.price.gte = yuanToCents(minPrice)
      }
      if (maxPrice !== undefined) {
        where.price.lte = yuanToCents(maxPrice)
      }
    }

    // Build order clause
    const orderBy: any = {}
    if (sortBy === 'price') {
      orderBy.price = sortOrder
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize

    // Get total count
    const total = await prisma.product.count({ where })

    // Get products
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize
    })

    // Transform products (convert cents to yuan, parse images)
    const transformedProducts = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: centsToYuan(product.price),
      images: parseImages(product.images),
      status: product.status,
      createdAt: product.createdAt.toISOString()
    }))

    return {
      data: transformedProducts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  },

  // Get single product by ID
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      throw new NotFoundError('Product not found')
    }

    return {
      id: product.id,
      name: product.name,
      price: centsToYuan(product.price),
      description: product.description,
      images: parseImages(product.images),
      status: product.status,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    }
  },

  // Create new product
  async createProduct(input: CreateProductInput) {
    // Validation
    if (!input.name || input.name.trim() === '') {
      throw new ValidationError('Product name is required')
    }

    if (!input.price || input.price <= 0) {
      throw new ValidationError('Product price must be greater than 0')
    }

    // Convert yuan to cents
    const priceInCents = yuanToCents(input.price)

    // Create product
    const product = await prisma.product.create({
      data: {
        name: input.name,
        price: priceInCents,
        description: input.description || '',
        images: JSON.stringify(input.images || []),
        status: input.status || 'on_sale'
      }
    })

    return this.getProductById(product.id)
  },

  // Update product
  async updateProduct(id: string, input: UpdateProductInput) {
    // Check if product exists
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Product not found')
    }

    // Validation
    if (input.name !== undefined && input.name.trim() === '') {
      throw new ValidationError('Product name cannot be empty')
    }

    if (input.price !== undefined && input.price <= 0) {
      throw new ValidationError('Product price must be greater than 0')
    }

    // Build update data
    const updateData: any = {}

    if (input.name !== undefined) {
      updateData.name = input.name
    }

    if (input.price !== undefined) {
      updateData.price = yuanToCents(input.price)
    }

    if (input.description !== undefined) {
      updateData.description = input.description
    }

    if (input.images !== undefined) {
      updateData.images = JSON.stringify(input.images)
    }

    if (input.status !== undefined) {
      updateData.status = input.status
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: updateData
    })

    return this.getProductById(product.id)
  },

  // Update product status
  async updateProductStatus(id: string, status: 'on_sale' | 'off_sale') {
    // Check if product exists
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Product not found')
    }

    // Update status
    const product = await prisma.product.update({
      where: { id },
      data: { status }
    })

    return this.getProductById(product.id)
  },

  // Delete product
  async deleteProduct(id: string) {
    // Check if product exists
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Product not found')
    }

    // Delete product
    await prisma.product.delete({
      where: { id }
    })

    return {
      message: 'Product deleted successfully'
    }
  }
}
