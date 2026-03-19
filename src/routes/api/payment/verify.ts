import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { verifyAndConfirmPayment } from '@/lib/payment/payment.service'

export const Route = createFileRoute('/api/payment/verify')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = requireAuth(request, 'PATIENT')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized' })
        }

        let body: { sessionId?: string }
        try {
          body = await request.json()
        } catch {
          return sendError({ statusCode: 400, message: 'Invalid JSON' })
        }

        if (!body.sessionId) {
          return sendError({ statusCode: 400, message: 'sessionId is required' })
        }

        try {
          const result = await verifyAndConfirmPayment(body.sessionId)
          return sendSuccess({
            statusCode: 200,
            message: result.message,
            data: { confirmed: result.confirmed },
          })
        } catch (err: any) {
          console.error('[Verify Payment]', err.message)
          return sendError({ statusCode: 500, message: err.message || 'Verification failed' })
        }
      },
    },
  },
})
