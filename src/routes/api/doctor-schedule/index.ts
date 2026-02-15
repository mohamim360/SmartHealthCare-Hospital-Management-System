import { createFileRoute } from '@tanstack/react-router'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { insertDoctorScheduleIntoDB } from '@/lib/doctor-schedule/doctor-schedule.service'
import { createDoctorScheduleSchema } from '@/lib/doctor-schedule/doctor-schedule.validation'

export const Route = createFileRoute('/api/doctor-schedule/')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = requireAuth(request, 'DOCTOR')
        if (!user) {
          return sendError({
            statusCode: 401,
            message: 'Unauthorized or invalid role',
          })
        }
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return sendError({
            statusCode: 400,
            message: 'Invalid JSON body',
          })
        }
        const parsed = createDoctorScheduleSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }
        try {
          await insertDoctorScheduleIntoDB(user, parsed.data)
          return sendSuccess({
            statusCode: 201,
            message: 'Doctor schedules assigned',
          })
        } catch (err) {
          console.error('Failed to assign doctor schedules', err)
          return sendError({
            statusCode: 500,
            message: 'Failed to assign doctor schedules',
          })
        }
      },
    },
  },
})
