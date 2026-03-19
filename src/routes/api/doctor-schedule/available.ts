import { createFileRoute } from '@tanstack/react-router'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { getAvailableSchedules } from '@/lib/doctor-schedule/doctor-schedule.service'

export const Route = createFileRoute('/api/doctor-schedule/available')({
    server: {
        handlers: {
            /**
             * GET /api/doctor-schedule/available — Get schedule slots NOT assigned to this doctor
             */
            GET: async ({ request }) => {
                const user = requireAuth(request, 'DOCTOR')
                if (!user) {
                    return sendError({
                        statusCode: 401,
                        message: 'Unauthorized — doctors only',
                    })
                }
                const url = new URL(request.url)
                const options = {
                    page: url.searchParams.get('page')
                        ? Number(url.searchParams.get('page'))
                        : undefined,
                    limit: url.searchParams.get('limit')
                        ? Number(url.searchParams.get('limit'))
                        : 100, // larger default for booking dialog
                }
                try {
                    const result = await getAvailableSchedules(user, options)
                    return sendSuccess({
                        statusCode: 200,
                        message: 'Available schedules fetched',
                        data: result.data,
                        meta: result.meta,
                    })
                } catch (err) {
                    console.error('Failed to fetch available schedules', err)
                    return sendError({
                        statusCode: 500,
                        message: 'Failed to fetch available schedules',
                    })
                }
            },
        },
    },
})
