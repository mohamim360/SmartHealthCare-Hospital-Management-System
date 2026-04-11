import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { prisma } from '@/db'
import { cancelDay, uncancelDay } from '@/lib/weekly-availability/weekly-availability.service'
import { cancelDaySchema } from '@/lib/weekly-availability/weekly-availability.validation'

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

        const action = body?.action || 'cancel'
        const date = body?.date

        if (!date) {
          return sendError({ statusCode: 400, message: 'date is required' })
        }

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
            doctorId = body.doctorId
            if (!doctorId) {
              return sendError({ statusCode: 400, message: 'doctorId required for admin' })
            }
          }

          if (action === 'restore') {
            try {
              await uncancelDay(doctorId, date)
              return sendSuccess({
                statusCode: 200,
                message: 'Day restored successfully',
                data: { date, action: 'restored' },
              })
            } catch (err) {
              // If the cancellation doesn't exist, that's fine
              return sendSuccess({
                statusCode: 200,
                message: 'Day was already active',
                data: { date, action: 'already_active' },
              })
            }
          } else {
            const result = await cancelDay(doctorId, date, body.reason)
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
