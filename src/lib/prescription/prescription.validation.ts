import { z } from 'zod'

export const createPrescriptionSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  instructions: z.string().min(1, 'Instructions are required'),
  followUpDate: z.union([z.string(), z.date()]).optional(),
})
