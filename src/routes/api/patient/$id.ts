import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import {
  deletePatientById,
  getPatientById,
  updatePatientById,
} from '@/lib/patient/patient.service'
import { patientUpdateSchema } from '@/lib/patient/patient.validation'

function isPrismaNotFoundError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as any).code === 'P2025'
  )
}

export const Route = createFileRoute('/api/patient/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const user = requireAuth(request, 'ADMIN')
        if (!user) return sendError({ statusCode: 401, message: 'Unauthorized or invalid role' })

        try {
          const data = await getPatientById(params.id)
          return sendSuccess({ statusCode: 200, message: 'Patient fetched successfully', data })
        } catch (err) {
          console.error('Failed to fetch patient', err)
          return sendError({ statusCode: 404, message: 'Patient not found' })
        }
      },
      PATCH: async ({ request, params }) => {
        const user = requireAuth(request, 'ADMIN')
        if (!user) return sendError({ statusCode: 401, message: 'Unauthorized or invalid role' })

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return sendError({ statusCode: 400, message: 'Invalid JSON body' })
        }

        const parsed = patientUpdateSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({ statusCode: 400, message: 'Validation failed', error: parsed.error.flatten() })
        }

        try {
          const data = await updatePatientById(params.id, parsed.data)
          return sendSuccess({ statusCode: 200, message: 'Patient updated successfully', data })
        } catch (err) {
          console.error('Failed to update patient', err)
          return sendError({ statusCode: 404, message: 'Patient not found' })
        }
      },
      DELETE: async ({ request, params }) => {
        const user = requireAuth(request, 'ADMIN')
        if (!user) return sendError({ statusCode: 401, message: 'Unauthorized or invalid role' })

        try {
          const data = await deletePatientById(params.id)
          return sendSuccess({ statusCode: 200, message: 'Patient deleted successfully', data })
        } catch (err) {
          if (isPrismaNotFoundError(err)) {
            return sendError({ statusCode: 404, message: 'Patient not found' })
          }
          console.error('Failed to delete patient', err)
          return sendError({ statusCode: 500, message: 'Failed to delete patient' })
        }
      },
    },
  },
})

