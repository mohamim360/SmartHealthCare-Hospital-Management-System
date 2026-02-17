import { z } from 'zod'

export const createAppointmentSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  scheduleId: z.string().uuid('Invalid schedule ID'),
})
