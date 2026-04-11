import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { prisma } from '@/db'
import { generateSlotsForWeeks } from '@/lib/weekly-availability/weekly-availability.service'
import { generateSlotsSchema } from '@/lib/weekly-availability/weekly-availability.validation'

export const Route = createFileRoute('/api/weekly-availability/generate')({
  server: {
    handlers: {
      /**
       * POST /api/weekly-availability/generate — generate schedule slots from template
       */
      POST: async ({ request }) => {
        const user = requireAuth(request, 'DOCTOR', 'ADMIN')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized' })
        }

        let body: any = {}
        try {
          body = await request.json()
        } catch {
          // body is optional, defaults will be used
        }

        const parsed = generateSlotsSchema.safeParse(body)
        const weeksAhead = parsed.success ? parsed.data.weeksAhead : 4

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
            doctorId = body?.doctorId
            if (!doctorId) {
              return sendError({ statusCode: 400, message: 'doctorId required for admin' })
            }
          }

          const result = await generateSlotsForWeeks(doctorId, weeksAhead)
          return sendSuccess({
            statusCode: 200,
            message: result.message,
            data: result,
          })
        } catch (err) {
          console.error('Failed to generate slots', err)
          return sendError({ statusCode: 500, message: 'Failed to generate schedule slots' })
        }
      },
    },
  },
})
