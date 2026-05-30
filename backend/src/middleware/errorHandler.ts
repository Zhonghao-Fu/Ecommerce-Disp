import { Request, Response, NextFunction } from 'express'
import { AppError, ValidationError, DatabaseError } from './errors'
import { Prisma } from '@prisma/client'

// Global error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging
  console.error('❌ Error:', {
    message: error.message,
    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    path: req.path,
    method: req.method
  })

  // Handle AppError instances
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
        ...(error instanceof ValidationError && { details: error.errors })
      }
    })
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (P2002)
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT_ERROR',
          message: 'Resource already exists'
        }
      })
    }

    // Record not found (P2025)
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found'
        }
      })
    }

    // Other Prisma errors
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Database error occurred' : error.message
      }
    })
  }

  // Handle unknown errors
  console.error('❌ Unknown error:', error)
  
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message
    }
  })
}
