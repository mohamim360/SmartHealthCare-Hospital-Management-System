import { createFileRoute } from '@tanstack/react-router'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { requireAuth } from '@/lib/auth/auth.middleware'
import {
  insertSchedulesIntoDB,
  schedulesForDoctor,
} from '@/lib/schedule/schedule.service'
import {
  createScheduleSchema,
  schedulesForDoctorQuerySchema,
} from '@/lib/schedule/schedule.validation'

export const Route = createFileRoute('/api/schedule/')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return sendError({
            statusCode: 400,
            message: 'Invalid JSON body',
          })
        }
        const parsed = createScheduleSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }
        try {
          const data = await insertSchedulesIntoDB(parsed.data)
          return sendSuccess({
            statusCode: 201,
            message: 'Schedules created',
            data,
          })
        } catch (err) {
          console.error('Failed to create schedules', err)
          return sendError({
            statusCode: 500,
            message: 'Failed to create schedules',
          })
        }
      },
      GET: async ({ request }) => {
        const user = requireAuth(request, 'DOCTOR')
        if (!user) {
          return sendError({
            statusCode: 401,
            message: 'Unauthorized or invalid role',
          })
        }
        const url = new URL(request.url)
        const query = {
          page: url.searchParams.get('page') ?? undefined,
          limit: url.searchParams.get('limit') ?? undefined,
          sortBy: url.searchParams.get('sortBy') ?? undefined,
          sortOrder: url.searchParams.get('sortOrder') ?? undefined,
          startDateTime: url.searchParams.get('startDateTime') ?? undefined,
          endDateTime: url.searchParams.get('endDateTime') ?? undefined,
        }
        const parsed = schedulesForDoctorQuerySchema.safeParse(query)
        const filters = {
          startDateTime: parsed.success ? parsed.data.startDateTime : undefined,
          endDateTime: parsed.success ? parsed.data.endDateTime : undefined,
        }
        const options = parsed.success
          ? {
              page: parsed.data.page,
              limit: parsed.data.limit,
              sortBy: parsed.data.sortBy,
              sortOrder: parsed.data.sortOrder,
            }
          : {}
        try {
          const result = await schedulesForDoctor(user, filters, options)
          return sendSuccess({
            statusCode: 200,
            message: 'Schedules fetched',
            data: result.data,
            meta: result.meta,
          })
        } catch (err) {
          console.error('Failed to fetch schedules', err)
          return sendError({
            statusCode: 500,
            message: 'Failed to fetch schedules',
          })
        }
      },
    },
  },
})
