import { Request, Response, NextFunction } from 'express'

// Track response time for performance monitoring
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  // When response is sent, calculate and log duration
  res.on('finish', () => {
    const duration = Date.now() - start
    const method = req.method
    const path = req.path
    const status = res.statusCode
    
    // Log slow requests (> 1000ms) as warnings
    if (duration > 1000) {
      console.warn(`️  Slow request: ${method} ${path} ${status} - ${duration}ms`)
    } else {
      console.log(`✅ ${method} ${path} ${status} - ${duration}ms`)
    }
  })
  
  next()
}
