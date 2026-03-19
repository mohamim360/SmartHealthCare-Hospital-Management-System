import { createFileRoute } from '@tanstack/react-router'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { getDoctors } from '@/lib/doctor/doctor.service'
import { doctorListQuerySchema } from '@/lib/doctor/doctor.validation'

export const Route = createFileRoute('/api/doctor/')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const url = new URL(request.url)
                const query: Record<string, string | undefined> = {}

                // Collect all search params
                for (const key of [
                    'page', 'limit', 'sortBy', 'sortOrder', 'searchTerm',
                    'gender', 'speciality', 'designation',
                    'minExperience', 'maxExperience',
                    'minFee', 'maxFee', 'minRating', 'availability',
                ]) {
                    query[key] = url.searchParams.get(key) ?? undefined
                }

                const parsed = doctorListQuerySchema.safeParse(query)
                if (!parsed.success) {
                    return sendError({ statusCode: 400, message: 'Validation failed', error: parsed.error.flatten() })
                }

                try {
                    const { page, limit, sortBy, sortOrder, searchTerm, ...filters } = parsed.data
                    const result = await getDoctors(
                        { searchTerm, ...filters },
                        { page, limit, sortBy, sortOrder },
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
