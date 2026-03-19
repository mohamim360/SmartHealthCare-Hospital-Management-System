import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import {
  deleteAdminById,
  getAdminById,
  updateAdminById,
} from '@/lib/admin/admin.service'
import { adminUpdateSchema } from '@/lib/admin/admin.validation'

function isPrismaNotFoundError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as any).code === 'P2025'
  )
}

export const Route = createFileRoute('/api/admin/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const user = requireAuth(request, 'ADMIN')
        if (!user) return sendError({ statusCode: 401, message: 'Unauthorized or invalid role' })

        try {
          const data = await getAdminById(params.id)
          return sendSuccess({ statusCode: 200, message: 'Admin fetched successfully', data })
        } catch (err) {
          console.error('Failed to fetch admin', err)
          return sendError({ statusCode: 404, message: 'Admin not found' })
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

        const parsed = adminUpdateSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({ statusCode: 400, message: 'Validation failed', error: parsed.error.flatten() })
        }

        try {
          const data = await updateAdminById(params.id, parsed.data)
          return sendSuccess({ statusCode: 200, message: 'Admin updated successfully', data })
        } catch (err) {
          console.error('Failed to update admin', err)
          return sendError({ statusCode: 404, message: 'Admin not found' })
        }
      },
      DELETE: async ({ request, params }) => {
        const user = requireAuth(request, 'ADMIN')
        if (!user) return sendError({ statusCode: 401, message: 'Unauthorized or invalid role' })

        try {
          const data = await deleteAdminById(params.id)
          return sendSuccess({ statusCode: 200, message: 'Admin deleted successfully', data })
        } catch (err) {
          if (isPrismaNotFoundError(err)) {
            return sendError({ statusCode: 404, message: 'Admin not found' })
          }
          console.error('Failed to delete admin', err)
          return sendError({ statusCode: 500, message: 'Failed to delete admin' })
        }
      },
    },
  },
})

