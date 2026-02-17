import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { createPrescription } from '@/lib/prescription/prescription.service'
import { createPrescriptionSchema } from '@/lib/prescription/prescription.validation'

export const Route = createFileRoute('/api/prescription/')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = requireAuth(request, 'DOCTOR')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized or invalid role' })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return sendError({ statusCode: 400, message: 'Invalid JSON body' })
        }

        const parsed = createPrescriptionSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }

        try {
          const data = await createPrescription(user, {
            appointmentId: parsed.data.appointmentId,
            instructions: parsed.data.instructions,
            followUpDate: parsed.data.followUpDate,
          })
          return sendSuccess({
            statusCode: 201,
            message: 'Prescription created successfully!',
            data,
          })
        } catch (err) {
          console.error('Failed to create prescription', err)
          if (err instanceof Error && err.message === 'This is not your appointment') {
            return sendError({ statusCode: 400, message: err.message })
          }
          const isNotFound =
            typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2025'
          if (isNotFound) {
            return sendError({
              statusCode: 404,
              message: 'Appointment not found or not completed/paid',
            })
          }
          return sendError({
            statusCode: 500,
            message: 'Failed to create prescription',
          })
        }
      },
    },
  },
})
