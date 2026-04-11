import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { prisma } from '@/db'
import { doctorUpdateSchema } from '@/lib/doctor/doctor.validation'

export const Route = createFileRoute('/api/doctor/profile')({
  server: {
    handlers: {
      /** GET /api/doctor/profile — doctor fetches own profile */
      GET: async ({ request }) => {
        const user = requireAuth(request, 'DOCTOR')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized' })
        }

        try {
          const doctor = await prisma.doctor.findFirst({
            where: { email: user.email, isDeleted: false },
          })
          if (!doctor) {
            return sendError({ statusCode: 404, message: 'Doctor profile not found' })
          }
          return sendSuccess({
            statusCode: 200,
            message: 'Profile fetched',
            data: doctor,
          })
        } catch (err) {
          console.error('Failed to fetch doctor profile', err)
          return sendError({ statusCode: 500, message: 'Failed to fetch profile' })
        }
      },

      /** PATCH /api/doctor/profile — doctor updates own profile */
      PATCH: async ({ request }) => {
        const user = requireAuth(request, 'DOCTOR')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized' })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return sendError({ statusCode: 400, message: 'Invalid JSON body' })
        }

        const parsed = doctorUpdateSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }

        try {
          const doctor = await prisma.doctor.findFirst({
            where: { email: user.email, isDeleted: false },
            select: { id: true },
          })
          if (!doctor) {
            return sendError({ statusCode: 404, message: 'Doctor profile not found' })
          }

          const updated = await prisma.doctor.update({
            where: { id: doctor.id },
            data: parsed.data,
          })

          return sendSuccess({
            statusCode: 200,
            message: 'Profile updated successfully',
            data: updated,
          })
        } catch (err) {
          console.error('Failed to update doctor profile', err)
          return sendError({ statusCode: 500, message: 'Failed to update profile' })
        }
      },
    },
  },
})
