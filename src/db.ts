/**
 * Prisma Database Client
 * Singleton pattern for database connection
 * Following TanStack Start best practices for database access
 * 
 * Uses PrismaPg adapter for connection pooling in production
 * Maintains single instance in development to prevent connection exhaustion
 * 
 * Note: This file is server-only and will be tree-shaken from client bundles
 */
import { PrismaClient } from './generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

// Validate DATABASE_URL is set (server-side only)
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create PrismaPg adapter for connection pooling
const adapter = new PrismaPg({
  connectionString: databaseUrl,
})

// Global instance for development hot-reload prevention
declare global {
  var __prisma: PrismaClient | undefined
}

/**
 * Prisma client instance
 * Uses adapter for connection pooling in production
 * Logs queries in development for debugging
 */
export const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

// Maintain single instance in development to prevent connection exhaustion
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
