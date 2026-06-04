import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { ProductRouter } from './routes/product.routes'
import { CurrencyRouter } from './routes/currency.routes'
import { errorHandler } from './middleware/errorHandler'
import { NotFoundError } from './middleware/errors'
import { requestIdMiddleware } from './middleware/requestId'
import { responseTimeMiddleware } from './middleware/responseTime'
import { checkDatabaseConnection, gracefulShutdown } from './utils/database'

const app = express()
const PORT: number = parseInt(process.env.PORT || '4000', 10)

// Initialize Prisma Client
const prisma = new PrismaClient()

// ===== Middleware =====

// CORS configuration (MUST be before routes)
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Id', 'X-Request-Timestamp'],
  exposedHeaders: ['X-Request-Id', 'X-Total-Count'],
  maxAge: 86400 // 24 hours
}))

// Request ID generation
app.use(requestIdMiddleware)

// Response time tracking
app.use(responseTimeMiddleware)

// Parse JSON request bodies
app.use(express.json())

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`)
    next()
  })
}

// ===== Routes =====

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API v1 routes
app.use('/api/v1', ProductRouter)
app.use('/api/v1', CurrencyRouter)

// ===== Error Handling =====

// 404 handler for undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`))
})

// Global error handler (must be last)
app.use(errorHandler)

// ===== Start Server =====

const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log('\n' + '='.repeat(50))
  console.log('🚀 Server is running on http://localhost:' + PORT)
  console.log('📊 Health check: http://localhost:' + PORT + '/api/health')
  console.log('📦 API v1: http://localhost:' + PORT + '/api/v1/products')
  console.log('🌍 Environment: ' + (process.env.NODE_ENV || 'development'))
  console.log('='.repeat(50) + '\n')
  
  // Check database connection
  await checkDatabaseConnection(prisma)
})

// Graceful shutdown
process.on('SIGTERM', () => gracefulShutdown(prisma, 'SIGTERM'))
process.on('SIGINT', () => gracefulShutdown(prisma, 'SIGINT'))

export default app
