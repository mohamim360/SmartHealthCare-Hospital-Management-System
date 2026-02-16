import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { deleteDoctorById, getDoctorById } from '@/lib/doctor/doctor.service'

function isPrismaNotFoundError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as any).code === 'P2025'
  )
}

export const Route = createFileRoute('/api/doctor/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const user = requireAuth(request, 'ADMIN')
        if (!user) return sendError({ statusCode: 401, message: 'Unauthorized or invalid role' })

        try {
          const data = await getDoctorById(params.id)
          return sendSuccess({ statusCode: 200, message: 'Doctor fetched successfully', data })
        } catch (err) {
          console.error('Failed to fetch doctor', err)
          return sendError({ statusCode: 404, message: 'Doctor not found' })
        }
      },
      DELETE: async ({ request, params }) => {
        const user = requireAuth(request, 'ADMIN')
        if (!user) return sendError({ statusCode: 401, message: 'Unauthorized or invalid role' })

        try {
          const data = await deleteDoctorById(params.id)
          return sendSuccess({ statusCode: 200, message: 'Doctor deleted successfully', data })
        } catch (err) {
          if (isPrismaNotFoundError(err)) {
            return sendError({ statusCode: 404, message: 'Doctor not found' })
          }
          console.error('Failed to delete doctor', err)
          return sendError({ statusCode: 500, message: 'Failed to delete doctor' })
        }
      },
    },
  },
})

