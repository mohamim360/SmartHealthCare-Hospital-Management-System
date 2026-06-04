import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import {
  getPrescriptionById,
  updatePrescription,
} from '@/lib/prescription/prescription.service'
import { updatePrescriptionSchema } from '@/lib/prescription/prescription.validation'

function isPrismaNotFoundError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2025'
  )
}

export const Route = createFileRoute('/api/prescription/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const user = requireAuth(request, 'ADMIN', 'DOCTOR', 'PATIENT')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized or invalid role' })
        }

        try {
          const data = await getPrescriptionById(user, params.id)
          return sendSuccess({
            statusCode: 200,
            message: 'Prescription fetched successfully',
            data,
          })
        } catch (err) {
          if (err instanceof Error && err.message.includes('access')) {
            return sendError({ statusCode: 403, message: err.message })
          }
          if (isPrismaNotFoundError(err)) {
            return sendError({ statusCode: 404, message: 'Prescription not found' })
          }
          console.error('Failed to fetch prescription', err)
          return sendError({ statusCode: 500, message: 'Failed to fetch prescription' })
        }
      },
      PATCH: async ({ request, params }) => {
        const user = requireAuth(request, 'DOCTOR')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized or invalid role' })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return sendError({ statusCode: 400, message: 'Invalid JSON body' })
        }

        const parsed = updatePrescriptionSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }

        try {
          const data = await updatePrescription(user, params.id, parsed.data)
          return sendSuccess({
            statusCode: 200,
            message: 'Prescription updated successfully',
            data,
          })
        } catch (err) {
          if (err instanceof Error) {
            if (err.message.includes('access') || err.message.includes('not your')) {
              return sendError({ statusCode: 403, message: err.message })
            }
          }
          if (isPrismaNotFoundError(err)) {
            return sendError({ statusCode: 404, message: 'Prescription not found' })
          }
          console.error('Failed to update prescription', err)
          return sendError({ statusCode: 500, message: 'Failed to update prescription' })
        }
      },
    },
  },
})
