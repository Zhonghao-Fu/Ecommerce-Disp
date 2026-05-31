import { Router, Request, Response, NextFunction } from 'express'
import { ProductController } from '../controllers/product.controller'
import { validate, createProductSchema, updateProductSchema, updateStatusSchema, productQuerySchema } from '../validators/product.validator'
import { upload, uploadCSV, handleMulterError } from '../middleware/upload'
import { ExportService } from '../services/export.service'
import { ImportService } from '../services/import.service'

const router = Router()
const exportService = new ExportService()
const importService = new ImportService()

// ===== GET /api/v1/products - Get products list =====
router.get('/products', validate(productQuerySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ProductController.getProducts(req.query as any)
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    })
  } catch (error) {
    next(error)
  }
})

// ===== GET /api/v1/products/template - Download import template =====
router.get('/products/template', (req: Request, res: Response) => {
  const template = `商品名称*,商品描述,价格(元)*,状态,图片URL
iPhone 15 Pro Max,Apple最新旗舰手机,9999.00,on_sale,https://img1.jpg;https://img2.jpg
AirPods Pro 2,主动降噪耳机,1999.00,on_sale,`

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="import_template.csv"')
  res.send(template)
})

// ===== GET /api/v1/products/:id - Get product by ID =====
router.get('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductController.getProductById(req.params.id)
    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    next(error)
  }
})

// ===== POST /api/v1/products - Create product =====
router.post('/products', validate(createProductSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductController.createProduct(req.body)
    res.status(201).json({
      success: true,
      data: product
    })
  } catch (error) {
    next(error)
  }
})

// ===== PUT /api/v1/products/:id - Update product =====
router.put('/products/:id', validate(updateProductSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductController.updateProduct(req.params.id, req.body)
    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    next(error)
  }
})

// ===== PATCH /api/v1/products/:id/status - Update product status =====
router.patch('/products/:id/status', validate(updateStatusSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductController.updateProductStatus(req.params.id, req.body.status)
    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    next(error)
  }
})

// ===== DELETE /api/v1/products/:id - Delete product =====
router.delete('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ProductController.deleteProduct(req.params.id)
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
})

// Multer file interface
interface MulterRequest extends Request {
  file?: Express.Multer.File
}

// ===== POST /api/v1/upload/products - Upload product image =====
router.post(
  '/upload/products',
  upload.single('image'),
  handleMulterError,
  async (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: '请选择要上传的图片'
          }
        })
      }

      const imageUrl = `/uploads/products/${req.file.filename}`

      res.json({
        success: true,
        data: {
          url: imageUrl,
          filename: req.file.filename,
          size: req.file.size
        }
      })
    } catch (error) {
      console.error('Upload error:', error)
      res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: '图片上传失败'
        }
      })
    }
  }
)

// ===== POST /api/v1/products/export - Export products to CSV =====
router.post('/products/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fields, scope, filters } = req.body

    const result = await exportService.exportProducts({
      fields,
      scope,
      filters
    })

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="products_export_${Date.now()}.csv"`)
    res.send(result.csv)
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        code: 'EXPORT_FAILED',
        message: error.message || '导出失败'
      }
    })
  }
})

// ===== POST /api/v1/products/import - Import products from CSV =====
router.post(
  '/products/import',
  uploadCSV.single('file'),
  handleMulterError,
  async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: '请选择CSV文件'
          }
        })
      }

      const { mode } = req.body
      const result = await importService.importProducts(req.file, mode || 'hybrid')

      res.json({
        success: true,
        data: result
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'IMPORT_FAILED',
          message: error.message || '导入失败'
        }
      })
    }
  }
)

export { router as ProductRouter }
