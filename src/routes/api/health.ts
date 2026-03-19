
import { createServerOnlyFn } from '@tanstack/react-start'
import { createFileRoute } from '@tanstack/react-router'
import { sendError, sendSuccess } from '@/lib/utils/response'

const getServerInfo = createServerOnlyFn(() => {
  return {
    nodeEnv: process.env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }
})

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          // Get server information (server-only, not exposed to client)
          const serverInfo = getServerInfo()

          return sendSuccess({
            message: 'Server is running..',
            data: {
              environment: serverInfo.nodeEnv,
              uptime: `${serverInfo.uptime.toFixed(2)} sec`,
              timestamp: serverInfo.timestamp,
            },
          })
        } catch (error) {
          // Handle errors in route handler
          return sendError({
            statusCode: 500,
            message: 'Failed to get server information',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      },
    },
  },
})
