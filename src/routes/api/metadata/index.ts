import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { fetchDashboardMetaData } from '@/lib/meta/meta.service'

export const Route = createFileRoute('/api/metadata/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = requireAuth(request, 'ADMIN', 'DOCTOR', 'PATIENT')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized or invalid role' })
        }

        try {
          const data = await fetchDashboardMetaData(user)
          return sendSuccess({
            statusCode: 200,
            message: 'Meta data retrieval successfully!',
            data,
          })
        } catch (err) {
          console.error('Failed to fetch metadata', err)
          if (err instanceof Error && err.message === 'Invalid user role!') {
            return sendError({ statusCode: 400, message: err.message })
          }
          return sendError({
            statusCode: 500,
            message: 'Failed to fetch metadata',
          })
        }
      },
    },
  },
})
