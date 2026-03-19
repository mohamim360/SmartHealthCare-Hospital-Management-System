import { createFileRoute } from '@tanstack/react-router'
import { handleStripeWebhook } from '@/lib/payment/payment.service'

export const Route = createFileRoute('/api/payment/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Stripe webhook — no auth required, verified by signature
        const signature = request.headers.get('stripe-signature')
        if (!signature) {
          return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        let rawBody: string
        try {
          rawBody = await request.text()
        } catch {
          return new Response(JSON.stringify({ error: 'Failed to read body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        try {
          const result = await handleStripeWebhook(rawBody, signature)
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err: any) {
          console.error('[Webhook Error]', err.message)
          return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
