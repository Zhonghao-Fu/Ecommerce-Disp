import { PrismaClient } from '@prisma/client'
import { stringify } from 'csv-stringify/sync'
import { EXPORT_FIELDS, ExportFieldConfig } from '../config/export-fields'

const prisma = new PrismaClient()

export interface ExportRequest {
  fields: string[]
  scope: 'filtered' | 'all'
  filters?: {
    keyword?: string
    minPrice?: number
    maxPrice?: number
    status?: 'all' | 'on_sale' | 'off_sale'
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
}

export interface ExportResult {
  csv: string
  count: number
}

export class ExportService {
  /**
   * Export products to CSV format
   */
  async exportProducts(request: ExportRequest): Promise<ExportResult> {
    const { fields, scope, filters = {} } = request

    // 1. Validate fields
    const validFields = fields.filter(field => 
      EXPORT_FIELDS.some(f => f.key === field)
    )

    if (validFields.length === 0) {
      throw new Error('至少选择一个导出字段')
    }

    // 2. Fetch products based on scope
    const products = scope === 'all'
      ? await this.fetchAllProducts()
      : await this.fetchFilteredProducts(filters)

    if (products.length === 0) {
      throw new Error('没有可导出的商品数据')
    }

    // 3. Check limit
    if (products.length > 5000) {
      throw new Error(`导出数据量过大(${products.length}条)，请使用筛选条件分批导出（最多5000条）`)
    }

    // 4. Transform products to CSV rows
    const selectedFields = EXPORT_FIELDS.filter(f => validFields.includes(f.key))
    const csvData = products.map(product => {
      const row: any = {}
      selectedFields.forEach(field => {
        let value = (product as any)[field.key]
        
        // Apply transform function if exists
        if (field.transform) {
          value = field.transform(value)
        }
        
        row[field.label] = value
      })
      return row
    })

    // 5. Generate CSV with BOM for Excel compatibility
    const csv = stringify(csvData, {
      header: true,
      bom: true,  // UTF-8 BOM
      quoted: true,  // Quote all fields
      record_delimiter: 'windows'  // CRLF for Windows
    })

    return {
      csv,
      count: products.length
    }
  }

  /**
   * Fetch all products (no filters)
   */
  private async fetchAllProducts() {
    return prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  /**
   * Fetch products with filters (reuse getProducts logic)
   */
  private async fetchFilteredProducts(filters: any) {
    const where: any = {}

    // Keyword filter
    if (filters.keyword) {
      where.OR = [
        { name: { contains: filters.keyword } },
        { description: { contains: filters.keyword } }
      ]
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {}
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice * 100  // Convert yuan to cents
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice * 100  // Convert yuan to cents
      }
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      where.status = filters.status
    }

    // Sort
    const sortBy = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder || 'desc'

    return prisma.product.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder
      }
    })
  }
}
