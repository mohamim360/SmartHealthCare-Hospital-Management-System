import { z } from 'zod'

/** Create prescription form schema */
export const createPrescriptionSchema = z.object({
    appointmentId: z.string().uuid('Appointment ID must be a valid UUID'),
    instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
    followUpDate: z.string().optional(),
})
export type CreatePrescriptionFormData = z.infer<typeof createPrescriptionSchema>
