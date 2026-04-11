import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { prisma } from '@/db'
import { adminUpdateSchema } from '@/lib/admin/admin.validation'

export const Route = createFileRoute('/api/admin/profile')({
  server: {
    handlers: {
      /** GET /api/admin/profile — admin fetches own profile */
      GET: async ({ request }) => {
        const user = requireAuth(request, 'ADMIN', 'SUPER_ADMIN')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized' })
        }

        try {
          const admin = await prisma.admin.findFirst({
            where: { email: user.email, isDeleted: false },
          })
          if (!admin) {
            return sendError({ statusCode: 404, message: 'Admin profile not found' })
          }
          return sendSuccess({
            statusCode: 200,
            message: 'Profile fetched',
            data: admin,
          })
        } catch (err) {
          console.error('Failed to fetch admin profile', err)
          return sendError({ statusCode: 500, message: 'Failed to fetch profile' })
        }
      },

      /** PATCH /api/admin/profile — admin updates own profile */
      PATCH: async ({ request }) => {
        const user = requireAuth(request, 'ADMIN', 'SUPER_ADMIN')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized' })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return sendError({ statusCode: 400, message: 'Invalid JSON body' })
        }

        const parsed = adminUpdateSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }

        try {
          const admin = await prisma.admin.findFirst({
            where: { email: user.email, isDeleted: false },
            select: { id: true },
          })
          if (!admin) {
            return sendError({ statusCode: 404, message: 'Admin profile not found' })
          }

          const updated = await prisma.admin.update({
            where: { id: admin.id },
            data: parsed.data,
          })

          return sendSuccess({
            statusCode: 200,
            message: 'Profile updated successfully',
            data: updated,
          })
        } catch (err) {
          console.error('Failed to update admin profile', err)
          return sendError({ statusCode: 500, message: 'Failed to update profile' })
        }
      },
    },
  },
})
