import { createFileRoute } from '@tanstack/react-router'
import { sendSuccess, sendError } from '@/lib/utils/response'
import { prisma } from '@/db'

export const Route = createFileRoute('/api/doctor/specializations')({
    server: {
        handlers: {
            GET: async () => {
                try {
                    const designations = await prisma.doctor.findMany({
                        where: { isDeleted: false },
                        select: { designation: true },
                        distinct: ['designation'],
                        orderBy: { designation: 'asc' },
                    })

                    return sendSuccess({
                        statusCode: 200,
                        message: 'Specializations fetched',
                        data: designations.map((d) => d.designation),
                    })
                } catch (err) {
                    console.error('Failed to fetch specializations', err)
                    return sendError({ statusCode: 500, message: 'Failed to fetch specializations' })
                }
            },
        },
    },
})
