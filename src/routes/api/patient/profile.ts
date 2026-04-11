import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { prisma } from '@/db'
import { patientUpdateSchema } from '@/lib/patient/patient.validation'

export const Route = createFileRoute('/api/patient/profile')({
  server: {
    handlers: {
      /** GET /api/patient/profile — patient fetches own profile */
      GET: async ({ request }) => {
        const user = requireAuth(request, 'PATIENT')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized' })
        }

        try {
          const patient = await prisma.patient.findFirst({
            where: { email: user.email, isDeleted: false },
          })
          if (!patient) {
            return sendError({ statusCode: 404, message: 'Patient profile not found' })
          }
          return sendSuccess({
            statusCode: 200,
            message: 'Profile fetched',
            data: patient,
          })
        } catch (err) {
          console.error('Failed to fetch patient profile', err)
          return sendError({ statusCode: 500, message: 'Failed to fetch profile' })
        }
      },

      /** PATCH /api/patient/profile — patient updates own profile */
      PATCH: async ({ request }) => {
        const user = requireAuth(request, 'PATIENT')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized' })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return sendError({ statusCode: 400, message: 'Invalid JSON body' })
        }

        const parsed = patientUpdateSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }

        try {
          const patient = await prisma.patient.findFirst({
            where: { email: user.email, isDeleted: false },
            select: { id: true },
          })
          if (!patient) {
            return sendError({ statusCode: 404, message: 'Patient profile not found' })
          }

          const updated = await prisma.patient.update({
            where: { id: patient.id },
            data: parsed.data,
          })

          return sendSuccess({
            statusCode: 200,
            message: 'Profile updated successfully',
            data: updated,
          })
        } catch (err) {
          console.error('Failed to update patient profile', err)
          return sendError({ statusCode: 500, message: 'Failed to update profile' })
        }
      },
    },
  },
})
