import { createFileRoute } from '@tanstack/react-router'
import { sendSuccess, sendError } from '@/lib/utils/response'
import { getLandingPageData } from '@/lib/landing/landing.service'

export const Route = createFileRoute('/api/public/landing-data/')({
    server: {
        handlers: {
            GET: async () => {
                try {
                    const data = await getLandingPageData()
                    return sendSuccess({
                        statusCode: 200,
                        message: 'Landing page data fetched successfully',
                        data,
                    })
                } catch (err) {
                    console.error('Failed to fetch landing page data', err)
                    return sendError({
                        statusCode: 500,
                        message: 'Failed to fetch landing page data',
                    })
                }
            },
        },
    },
})
