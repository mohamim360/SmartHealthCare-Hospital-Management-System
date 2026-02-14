import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.js'

/**
 * Lazily fetch and validate DATABASE_URL
 * Throws only when actually used at runtime
 */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return url
}

// Global instance for development hot-reload prevention
declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const pool = new pg.Pool({
    connectionString: getDatabaseUrl(),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

export const prisma =
  globalThis.__prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
