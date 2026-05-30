import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

// Generate unique request ID for tracking
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = crypto.randomUUID()
  
  // Add to request object
  ;(req as any).requestId = requestId
  
  // Add to response headers
  res.setHeader('X-Request-Id', requestId)
  
  next()
}
