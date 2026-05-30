import { Response } from 'express'

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  meta?: Record<string, any>
}

// Success response helper
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  pagination?: ApiResponse['pagination'],
  meta?: Record<string, any>
) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(pagination && { pagination }),
    ...(meta && { meta })
  }
  
  return res.status(statusCode).json(response)
}

// Error response helper
export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  details?: any
) => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  }
  
  return res.status(statusCode).json(response)
}
