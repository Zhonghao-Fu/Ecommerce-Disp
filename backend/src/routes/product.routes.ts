import { Router, Request, Response, NextFunction } from 'express'
import { ProductController } from '../controllers/product.controller'
import { validate, createProductSchema, updateProductSchema, updateStatusSchema, productQuerySchema } from '../validators/product.validator'

const router = Router()

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

export { router as ProductRouter }
