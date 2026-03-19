import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { createCheckoutSession } from '@/lib/payment/payment.service'

export const Route = createFileRoute('/api/payment/checkout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = requireAuth(request, 'PATIENT')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized' })
        }

        let body: { appointmentId?: string }
        try {
          body = await request.json()
        } catch {
          return sendError({ statusCode: 400, message: 'Invalid JSON' })
        }

        if (!body.appointmentId) {
          return sendError({ statusCode: 400, message: 'appointmentId is required' })
        }

        try {
          const result = await createCheckoutSession(body.appointmentId, user.email)
          return sendSuccess({
            statusCode: 200,
            message: 'Checkout session created',
            data: result,
          })
        } catch (err: any) {
          console.error('[Checkout]', err.message)
          const msg = err.message || 'Failed to create checkout session'
          const status = msg.includes('not your') ? 403 : msg.includes('already') ? 400 : 500
          return sendError({ statusCode: status, message: msg })
        }
      },
    },
  },
})
