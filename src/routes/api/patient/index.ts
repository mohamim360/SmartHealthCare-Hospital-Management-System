import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { getPatients } from '@/lib/patient/patient.service'
import { patientListQuerySchema } from '@/lib/patient/patient.validation'

export const Route = createFileRoute('/api/patient/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = requireAuth(request, 'ADMIN')
        if (!user) {
          return sendError({ statusCode: 401, message: 'Unauthorized or invalid role' })
        }

        const url = new URL(request.url)
        const query = {
          page: url.searchParams.get('page') ?? undefined,
          limit: url.searchParams.get('limit') ?? undefined,
          sortBy: url.searchParams.get('sortBy') ?? undefined,
          sortOrder: url.searchParams.get('sortOrder') ?? undefined,
          searchTerm: url.searchParams.get('searchTerm') ?? undefined,
          email: url.searchParams.get('email') ?? undefined,
        }

        const parsed = patientListQuerySchema.safeParse(query)
        if (!parsed.success) {
          return sendError({ statusCode: 400, message: 'Validation failed', error: parsed.error.flatten() })
        }

        try {
          const result = await getPatients(
            { searchTerm: parsed.data.searchTerm, email: parsed.data.email },
            {
              page: parsed.data.page,
              limit: parsed.data.limit,
              sortBy: parsed.data.sortBy,
              sortOrder: parsed.data.sortOrder,
            },
          )

          return sendSuccess({
            statusCode: 200,
            message: 'Patients fetched successfully',
            data: result.data,
            meta: result.meta,
          })
        } catch (err) {
          console.error('Failed to fetch patients', err)
          return sendError({ statusCode: 500, message: 'Failed to fetch patients' })
        }
      },
    },
  },
})

