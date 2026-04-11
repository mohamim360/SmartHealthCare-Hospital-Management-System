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
          return sendError({ statusCode: 400, message: 'Malformed JSON request' })
        }

        const parsed = generateSlotsSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }
        const weeksAhead = parsed.data.weeksAhead

        try {
          let doctorId: string | undefined

          if (user.role === 'DOCTOR') {
            const doctor = await prisma.doctor.findFirst({
              where: { email: user.email, isDeleted: false },
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
            // Verify doctor exists
            const doctorExists = await prisma.doctor.findFirst({
              where: { id: doctorId, isDeleted: false },
              select: { id: true },
            })
            if (!doctorExists) {
              return sendError({ statusCode: 400, message: 'Doctor not found with provided doctorId' })
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
