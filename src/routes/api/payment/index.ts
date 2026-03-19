import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { getPayments, getPaymentStats } from '@/lib/payment/payment.service'

export const Route = createFileRoute('/api/payment/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = requireAuth(request, 'ADMIN', 'DOCTOR', 'PATIENT')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized' })
        }

        const url = new URL(request.url)
        const options = {
          page: Number(url.searchParams.get('page')) || 1,
          limit: Number(url.searchParams.get('limit')) || 20,
          status: url.searchParams.get('status') || undefined,
        }

        try {
          const result = await getPayments(user, options)

          // Include stats for admin
          let stats = undefined
          if (user.role === 'ADMIN') {
            stats = await getPaymentStats()
          }

          return sendSuccess({
            statusCode: 200,
            message: 'Payments fetched',
            data: result.data,
            meta: { ...result.meta, stats },
          })
        } catch (err: any) {
          console.error('[Payments]', err.message)
          return sendError({ statusCode: 500, message: 'Failed to fetch payments' })
        }
      },
    },
  },
})
