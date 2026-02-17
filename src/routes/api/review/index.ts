import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { createReview } from '@/lib/review/review.service'
import { createReviewSchema } from '@/lib/review/review.validation'

export const Route = createFileRoute('/api/review/')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = requireAuth(request, 'PATIENT')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized or invalid role' })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return sendError({ statusCode: 400, message: 'Invalid JSON body' })
        }

        const parsed = createReviewSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }

        try {
          const data = await createReview(user, parsed.data)
          return sendSuccess({
            statusCode: 200,
            message: 'Review created successfully',
            data,
          })
        } catch (err) {
          console.error('Failed to create review', err)
          if (err instanceof Error && err.message === 'This is not your appointment!') {
            return sendError({ statusCode: 400, message: err.message })
          }
          const isNotFound =
            typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2025'
          if (isNotFound) {
            return sendError({
              statusCode: 404,
              message: 'Patient or appointment not found',
            })
          }
          return sendError({
            statusCode: 500,
            message: 'Failed to create review',
          })
        }
      },
    },
  },
})
