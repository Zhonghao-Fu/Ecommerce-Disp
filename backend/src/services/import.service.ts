import { PrismaClient, Product } from '@prisma/client'
import csvParser from 'csv-parser'
import { Readable } from 'stream'
import { EXPORT_FIELDS } from '../config/export-fields'

const prisma = new PrismaClient()

export type ImportMode = 'hybrid' | 'insert-only' | 'update-only'

export interface ImportResult {
  total: number
  success: number
  failed: number
  skipped: number
  errors: ImportError[]
}

export interface ImportError {
  row: number
  name: string
  error: string
}

export interface ParsedRow {
  [key: string]: string
}

export class ImportService {
  /**
   * Import products from CSV file
   */
  async importProducts(
    file: Express.Multer.File,
    mode: ImportMode = 'hybrid'
  ): Promise<ImportResult> {
    const result: ImportResult = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    }

    // 1. Parse CSV file
    const rows = await this.parseCSV(file)
    result.total = rows.length

    // 2. Validate row limit
    if (result.total === 0) {
      throw new Error('CSV文件为空，没有可导入的数据')
    }

    if (result.total > 5000) {
      throw new Error(`单次导入最多支持5000行，当前文件包含${result.total}行`)
    }

    // 3. Process in batches (100 per batch)
    const batchSize = 100
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)

      // Use transaction for data consistency
      await prisma.$transaction(async (tx) => {
        for (const row of batch) {
          const rowIndex = i + batch.indexOf(row) + 2  // +2 for header row and 1-based index

          try {
            await this.processRow(row, mode, tx, result, rowIndex)
          } catch (error: any) {
            result.failed++
            result.errors.push({
              row: rowIndex,
              name: row['商品名称'] || '',
              error: error.message || '未知错误'
            })
          }
        }
      })
    }

    return result
  }

  /**
   * Parse CSV file to array of objects
   */
  private parseCSV(file: Express.Multer.File): Promise<ParsedRow[]> {
    return new Promise((resolve, reject) => {
      const results: ParsedRow[] = []
      const headers: string[] = []

      // Map Chinese headers to field keys
      const headerMap = new Map<string, string>()
      EXPORT_FIELDS.forEach(field => {
        headerMap.set(field.label, field.key)
      })

      const stream = Readable.from(file.buffer)

      stream
        .pipe(csvParser())
        .on('headers', (csvHeaders) => {
          // Validate required headers
          const requiredFields = EXPORT_FIELDS.filter(f => f.required)
          for (const field of requiredFields) {
            if (!csvHeaders.includes(field.label)) {
              reject(new Error(`缺少必填字段: ${field.label}`))
              return
            }
          }
        })
        .on('data', (row: ParsedRow) => {
          results.push(row)
        })
        .on('end', () => {
          resolve(results)
        })
        .on('error', (error) => {
          reject(new Error(`CSV解析失败: ${error.message}`))
        })
    })
  }

  /**
   * Process a single row from CSV
   */
  private async processRow(
    row: ParsedRow,
    mode: ImportMode,
    tx: any,
    result: ImportResult,
    rowIndex: number
  ): Promise<void> {
    // 1. Validate required fields
    const name = row['商品名称']?.trim()
    if (!name) {
      throw new Error('商品名称不能为空')
    }

    const priceStr = row['价格(元)']?.trim()
    const priceYuan = parseFloat(priceStr)
    if (isNaN(priceYuan) || priceYuan <= 0) {
      throw new Error('价格必须大于0')
    }

    // Validate status if provided
    const status = row['状态']?.trim()
    if (status && !['on_sale', 'off_sale'].includes(status)) {
      throw new Error('状态必须是 on_sale 或 off_sale')
    }

    // 2. Transform CSV row to product data
    const productData: any = {
      name: name,
      description: row['商品描述']?.trim() || '',
      price: Math.round(priceYuan * 100),  // Convert yuan to cents
      status: status || 'on_sale',
    }

    // Parse images (semicolon-separated)
    const imagesStr = row['图片URL']?.trim()
    if (imagesStr) {
      productData.images = imagesStr.split(';').map(url => url.trim()).filter(url => url)
    }

    // Handle ID (optional - if empty, will create new product)
    const id = row['商品ID']?.trim()

    // 3. Check if product exists
    let existingProduct: Product | null = null
    if (id) {
      existingProduct = await tx.product.findUnique({
        where: { id }
      })
    }

    // 4. Process based on mode
    if (existingProduct) {
      // Product exists
      if (mode === 'insert-only') {
        // Skip in insert-only mode
        result.skipped++
        return
      }

      // Update existing product
      await tx.product.update({
        where: { id: existingProduct.id },
        data: productData
      })
      result.success++
    } else {
      // Product doesn't exist
      if (mode === 'update-only') {
        // Skip in update-only mode
        result.skipped++
        return
      }

      // Create new product (with or without specified ID)
      if (id) {
        // Check if ID format is valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(id)) {
          throw new Error('商品ID格式无效，必须是UUID格式')
        }
        
        // Try to create with specified ID
        productData.id = id
      }

      await tx.product.create({
        data: productData
      })
      result.success++
    }
  }
}
