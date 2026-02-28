import { createFileRoute } from '@tanstack/react-router'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { requireAuth } from '@/lib/auth/auth.middleware'
import {
  insertDoctorScheduleIntoDB,
  getMySchedules,
} from '@/lib/doctor-schedule/doctor-schedule.service'
import { createDoctorScheduleSchema } from '@/lib/doctor-schedule/doctor-schedule.validation'

export const Route = createFileRoute('/api/doctor-schedule/')({
  server: {
    handlers: {
      /**
       * GET /api/doctor-schedule — Get the doctor's own assigned schedules
       */
      GET: async ({ request }) => {
        const user = requireAuth(request, 'DOCTOR')
        if (!user) {
          return sendError({
            statusCode: 401,
            message: 'Unauthorized — doctors only',
          })
        }
        const url = new URL(request.url)
        const options = {
          page: url.searchParams.get('page')
            ? Number(url.searchParams.get('page'))
            : undefined,
          limit: url.searchParams.get('limit')
            ? Number(url.searchParams.get('limit'))
            : undefined,
        }
        try {
          const result = await getMySchedules(user, options)
          return sendSuccess({
            statusCode: 200,
            message: 'Doctor schedules fetched',
            data: result.data,
            meta: result.meta,
          })
        } catch (err) {
          console.error('Failed to fetch doctor schedules', err)
          return sendError({
            statusCode: 500,
            message: 'Failed to fetch doctor schedules',
          })
        }
      },

      /**
       * POST /api/doctor-schedule — Assign schedule slots to this doctor
       */
      POST: async ({ request }) => {
        const user = requireAuth(request, 'DOCTOR')
        if (!user) {
          return sendError({
            statusCode: 401,
            message: 'Unauthorized — doctors only',
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
