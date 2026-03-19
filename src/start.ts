
import { createMiddleware, createStart } from '@tanstack/react-start'

const loggingMiddleware = createMiddleware().server(async ({ next, request }) => {
  const start = Date.now()
  const url = new URL(request.url)

  console.log(`[${new Date().toISOString()}] ${request.method} ${url.pathname}`)

  try {
    const result = await next()
    const duration = Date.now() - start
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${url.pathname} - ${duration}ms`,
    )
    return result
  } catch (error) {
    const duration = Date.now() - start
    console.error(
      `[${new Date().toISOString()}] ${request.method} ${url.pathname} - ERROR after ${duration}ms:`,
      error,
    )
 
    throw error
  }
})

/**
 * Create Start instance with global middleware
 * 
 * Request middleware runs for all server requests:
 * - Server routes (API endpoints)
 * - SSR requests
 * - Server function requests
 * 
 * Note: Error handling is done at the route level using errorComponent
 * and in server route handlers using try/catch with sendError utility
 */
export const startInstance = createStart(() => ({
  // Global request middleware - runs for all server requests
  requestMiddleware: [loggingMiddleware],
}))
