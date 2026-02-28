import { createFileRoute } from '@tanstack/react-router'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { getDoctors } from '@/lib/doctor/doctor.service'
import { doctorListQuerySchema } from '@/lib/doctor/doctor.validation'

export const Route = createFileRoute('/api/doctor/')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const url = new URL(request.url)
                const query = {
                    page: url.searchParams.get('page') ?? undefined,
                    limit: url.searchParams.get('limit') ?? undefined,
                    sortBy: url.searchParams.get('sortBy') ?? undefined,
                    sortOrder: url.searchParams.get('sortOrder') ?? undefined,
                    searchTerm: url.searchParams.get('searchTerm') ?? undefined,
                    gender: url.searchParams.get('gender') ?? undefined,
                    speciality: url.searchParams.get('speciality') ?? undefined,
                }

                const parsed = doctorListQuerySchema.safeParse(query)
                if (!parsed.success) {
                    return sendError({ statusCode: 400, message: 'Validation failed', error: parsed.error.flatten() })
                }

                try {
                    const result = await getDoctors(
                        { searchTerm: parsed.data.searchTerm, gender: parsed.data.gender, speciality: parsed.data.speciality },
                        { page: parsed.data.page, limit: parsed.data.limit, sortBy: parsed.data.sortBy, sortOrder: parsed.data.sortOrder },
                    )

                    return sendSuccess({
                        statusCode: 200,
                        message: 'Doctors fetched successfully',
                        data: result.data,
                        meta: result.meta,
                    })
                } catch (err) {
                    console.error('Failed to fetch doctors', err)
                    return sendError({ statusCode: 500, message: 'Failed to fetch doctors' })
                }
            },
        },
    },
})
