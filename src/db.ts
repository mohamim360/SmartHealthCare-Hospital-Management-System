import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.js'

/**
 * Return DATABASE_URL as a string. pg expects a string connection URL; if the env
 * value is not a string (e.g. in some runtimes), we coerce so the driver never
 * receives an object and triggers ERR_INVALID_ARG_TYPE during startup.
 */
export function getDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL
  if (raw == null || raw === '') {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  if (typeof raw === 'string') {
    return raw
  }
  if (typeof raw === 'object' && raw !== null && 'href' in raw) {
    return (raw as URL).href
  }
  return String(raw)
}

// Global instance for development hot-reload prevention
declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = getDatabaseUrl()
  const adapter = new PrismaPg({ connectionString })

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
