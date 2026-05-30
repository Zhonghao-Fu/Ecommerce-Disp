import { PrismaClient } from '@prisma/client'

// Check database connection
export const checkDatabaseConnection = async (prisma: PrismaClient): Promise<void> => {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Run a simple query to verify
    const result = await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database query test passed')
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
}

// Graceful shutdown
export const gracefulShutdown = async (prisma: PrismaClient, signal: string): Promise<void> => {
  console.log(`\n🔄 Received ${signal}. Shutting down gracefully...`)
  
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error during shutdown:', error.message)
    process.exit(1)
  }
}
