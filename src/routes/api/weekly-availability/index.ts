import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { prisma } from '@/db'
import {
  setWeeklyAvailability,
  getWeeklyAvailability,
  getCancellations,
} from '@/lib/weekly-availability/weekly-availability.service'
import { setWeeklyAvailabilitySchema } from '@/lib/weekly-availability/weekly-availability.validation'
import { addDays, startOfDay } from 'date-fns'

export const Route = createFileRoute('/api/weekly-availability/')({
  server: {
    handlers: {
      /**
       * GET /api/weekly-availability — get doctor's weekly template + cancellations
       */
      GET: async ({ request }) => {
        const user = requireAuth(request, 'DOCTOR', 'ADMIN')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized' })
        }

        try {
          // If admin, optionally filter by doctorId query param
          const url = new URL(request.url)
          let doctorId = url.searchParams.get('doctorId')

          if (!doctorId && user.role === 'DOCTOR') {
            const doctor = await prisma.doctor.findUnique({
              where: { email: user.email },
              select: { id: true },
            })
            if (!doctor) {
              return sendError({ statusCode: 404, message: 'Doctor profile not found' })
            }
            doctorId = doctor.id
          }

          if (!doctorId) {
            return sendError({ statusCode: 400, message: 'doctorId is required' })
          }

          const availability = await getWeeklyAvailability(doctorId)
          const today = startOfDay(new Date())
          const cancellations = await getCancellations(doctorId, today, addDays(today, 56)) // 8 weeks

          return sendSuccess({
            statusCode: 200,
            message: 'Weekly availability fetched',
            data: { availability, cancellations },
          })
        } catch (err) {
          console.error('Failed to fetch weekly availability', err)
          return sendError({ statusCode: 500, message: 'Failed to fetch weekly availability' })
        }
      },

      /**
       * PUT /api/weekly-availability — set/update the weekly template
       */
      PUT: async ({ request }) => {
        const user = requireAuth(request, 'DOCTOR', 'ADMIN')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized' })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return sendError({ statusCode: 400, message: 'Invalid JSON body' })
        }

        const parsed = setWeeklyAvailabilitySchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }

        try {
          // Get doctorId
          let doctorId: string | undefined

          if (user.role === 'DOCTOR') {
            const doctor = await prisma.doctor.findUnique({
              where: { email: user.email },
              select: { id: true },
            })
            if (!doctor) {
              return sendError({ statusCode: 404, message: 'Doctor profile not found' })
            }
            doctorId = doctor.id
          } else {
            // Admin can pass doctorId in body
            doctorId = (body as any).doctorId
            if (!doctorId) {
              return sendError({ statusCode: 400, message: 'doctorId is required for admin' })
            }
          }

          const result = await setWeeklyAvailability(doctorId, parsed.data.slots)
          return sendSuccess({
            statusCode: 200,
            message: 'Weekly availability updated',
            data: result,
          })
        } catch (err) {
          console.error('Failed to set weekly availability', err)
          return sendError({ statusCode: 500, message: 'Failed to set weekly availability' })
        }
      },
    },
  },
})
