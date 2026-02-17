import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { createAppointment } from '@/lib/appointment/appointment.service'
import { createAppointmentSchema } from '@/lib/appointment/appointment.validation'

export const Route = createFileRoute('/api/appointment/')({
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

        const parsed = createAppointmentSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }

        try {
          const data = await createAppointment(user, parsed.data)
          return sendSuccess({
            statusCode: 201,
            message: 'Appointment created successfully!',
            data,
          })
        } catch (err) {
          console.error('Failed to create appointment', err)
          const isNotFound =
            typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2025'
          if (isNotFound) {
            return sendError({
              statusCode: 404,
              message: 'Patient, doctor, or available schedule not found',
            })
          }
          return sendError({
            statusCode: 500,
            message: 'Failed to create appointment',
          })
        }
      },
    },
  },
})
