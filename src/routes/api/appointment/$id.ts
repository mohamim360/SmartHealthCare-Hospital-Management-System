import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { changeAppointmentStatus, markPaymentPaid } from '@/lib/appointment/appointment.service'

export const Route = createFileRoute('/api/appointment/$id')({
    server: {
        handlers: {
            /**
             * PATCH /api/appointment/:id
             * Body: { action: 'change-status', status: string } | { action: 'pay' }
             */
            PATCH: async ({ request, params }) => {
                const { id } = params

                let body: any
                try {
                    body = await request.json()
                } catch {
                    return sendError({ statusCode: 400, message: 'Invalid JSON body' })
                }

                const action = body?.action as string
                if (!action) {
                    return sendError({ statusCode: 400, message: 'Missing action field' })
                }

                // --- Change appointment status ---
                if (action === 'change-status') {
                    const user = requireAuth(request, 'ADMIN', 'DOCTOR', 'PATIENT')
                    if (!user) {
                        return sendError({ statusCode: 401, message: 'Unauthorized' })
                    }

                    const newStatus = body?.status as string
                    if (!newStatus) {
                        return sendError({ statusCode: 400, message: 'Missing status field' })
                    }

                    try {
                        const data = await changeAppointmentStatus(user, id, newStatus)
                        return sendSuccess({
                            statusCode: 200,
                            message: 'Appointment status updated',
                            data,
                        })
                    } catch (err) {
                        if (err instanceof Error) {
                            const msg = err.message
                            if (
                                msg.includes('not your appointment') ||
                                msg.includes('only cancel') ||
                                msg.includes('only SCHEDULED') ||
                                msg.includes('Invalid status')
                            ) {
                                return sendError({ statusCode: 400, message: msg })
                            }
                        }
                        const isNotFound =
                            typeof err === 'object' && err !== null && 'code' in err && (err as any).code === 'P2025'
                        if (isNotFound) {
                            return sendError({ statusCode: 404, message: 'Appointment not found' })
                        }
                        console.error('Failed to change appointment status', err)
                        return sendError({ statusCode: 500, message: 'Failed to change appointment status' })
                    }
                }

                // --- Pay for appointment ---
                if (action === 'pay') {
                    const user = requireAuth(request, 'PATIENT', 'ADMIN')
                    if (!user) {
                        return sendError({ statusCode: 401, message: 'Unauthorized' })
                    }

                    try {
                        const data = await markPaymentPaid(user, id)
                        return sendSuccess({
                            statusCode: 200,
                            message: 'Payment completed successfully',
                            data,
                        })
                    } catch (err) {
                        if (err instanceof Error) {
                            const msg = err.message
                            if (
                                msg.includes('not your appointment') ||
                                msg.includes('No payment record') ||
                                msg.includes('already completed')
                            ) {
                                return sendError({ statusCode: 400, message: msg })
                            }
                        }
                        const isNotFound =
                            typeof err === 'object' && err !== null && 'code' in err && (err as any).code === 'P2025'
                        if (isNotFound) {
                            return sendError({ statusCode: 404, message: 'Appointment not found' })
                        }
                        console.error('Failed to process payment', err)
                        return sendError({ statusCode: 500, message: 'Failed to process payment' })
                    }
                }

                return sendError({ statusCode: 400, message: `Unknown action: ${action}` })
            },
        },
    },
})
