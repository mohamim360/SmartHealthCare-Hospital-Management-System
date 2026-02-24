import { z } from 'zod'

/** Create appointment form schema */
export const createAppointmentSchema = z.object({
    doctorId: z.string().uuid('Doctor ID must be a valid UUID'),
    scheduleId: z.string().uuid('Schedule ID must be a valid UUID'),
})
export type CreateAppointmentFormData = z.infer<typeof createAppointmentSchema>
