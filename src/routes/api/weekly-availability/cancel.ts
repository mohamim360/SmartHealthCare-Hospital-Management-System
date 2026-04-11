import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { prisma } from '@/db'
import { cancelDay, uncancelDay } from '@/lib/weekly-availability/weekly-availability.service'
import { z } from 'zod'

const cancelActionSchema = z.object({
  date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'Date must be in YYYY-MM-DD format'),
  action: z.enum(['cancel', 'restore']).default('cancel'),
  reason: z.string().optional(),
  doctorId: z.string().optional(),
})

export const Route = createFileRoute('/api/weekly-availability/cancel')({
  server: {
    handlers: {
      /**
       * POST /api/weekly-availability/cancel — cancel OR uncancel a specific date
       * Body: { date: "YYYY-MM-DD", action: "cancel" | "restore", reason?: string }
       */
      POST: async ({ request }) => {
        const user = requireAuth(request, 'DOCTOR', 'ADMIN')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized' })
        }

        let body: any
        try {
          body = await request.json()
        } catch {
          return sendError({ statusCode: 400, message: 'Invalid JSON body' })
        }

        // Validate request body
        const parsed = cancelActionSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }

        const { action, date, reason } = parsed.data

        try {
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
            doctorId = parsed.data.doctorId
            if (!doctorId) {
              return sendError({ statusCode: 400, message: 'doctorId required for admin' })
            }
          }

          if (action === 'restore') {
            const deletedCount = await uncancelDay(doctorId, date)
            if (deletedCount === 0) {
              return sendSuccess({
                statusCode: 200,
                message: 'Day was already active',
                data: { date, action: 'already_active' },
              })
            }
            return sendSuccess({
              statusCode: 200,
              message: 'Day restored successfully',
              data: { date, action: 'restored' },
            })
          } else {
            const result = await cancelDay(doctorId, date, reason)
            const apptCount = (result as any).cancelledAppointments || 0
            const msg = apptCount > 0
              ? `Day cancelled. ${apptCount} existing appointment(s) were also cancelled.`
              : 'Day cancelled successfully'
            return sendSuccess({
              statusCode: 200,
              message: msg,
              data: result,
            })
          }
        } catch (err) {
          console.error('Failed to process cancellation', err)
          return sendError({ statusCode: 500, message: 'Failed to process request' })
        }
      },
    },
  },
})
