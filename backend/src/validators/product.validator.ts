import { z } from 'zod'

// Create product validation schema
export const createProductSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Product name is required'
    }).min(1, 'Product name cannot be empty').max(200, 'Product name too long'),
    
    price: z.number({
      required_error: 'Product price is required'
    }).positive('Product price must be greater than 0').max(999999999, 'Product price too large'),
    
    description: z.string().max(5000, 'Description too long').optional().default(''),
    
    images: z.array(z.string().url('Invalid image URL')).max(10, 'Maximum 10 images allowed').optional().default([]),
    
    status: z.enum(['on_sale', 'off_sale']).optional().default('on_sale')
  })
})

// Update product validation schema
export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name cannot be empty').max(200, 'Product name too long').optional(),
    
    price: z.number().positive('Product price must be greater than 0').max(999999999, 'Product price too large').optional(),
    
    description: z.string().max(5000, 'Description too long').optional(),
    
    images: z.array(z.string().url('Invalid image URL')).max(10, 'Maximum 10 images allowed').optional(),
    
    status: z.enum(['on_sale', 'off_sale']).optional()
  })
})

// Update product status validation schema
export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['on_sale', 'off_sale'], {
      required_error: 'Status is required'
    })
  })
})

// Query parameters validation schema
export const productQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().optional().default(12),
    keyword: z.string().max(100, 'Keyword too long').optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    status: z.enum(['all', 'on_sale', 'off_sale']).optional().default('on_sale'),
    sortBy: z.enum(['price', 'name', 'createdAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  })
})

// Middleware to validate request
export const validate = (schema: any) => {
  return (req: any, res: any, next: any) => {
    try {
      if (req.query && schema.shape.query) {
        req.query = schema.shape.query.parse(req.query)
      }
      
      if (req.body && schema.shape.body) {
        req.body = schema.shape.body.parse(req.body)
      }
      
      next()
    } catch (error: any) {
      if (error.errors) {
        const messages = error.errors.map((e: any) => e.message).join(', ')
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: messages,
            details: error.errors
          }
        })
      } else {
        next(error)
      }
    }
  }
}
