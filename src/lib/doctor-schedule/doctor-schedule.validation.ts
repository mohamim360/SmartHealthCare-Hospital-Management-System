import { z } from 'zod'

export const createDoctorScheduleSchema = z.object({
  scheduleIds: z.array(z.string().uuid()).min(1, 'At least one schedule ID required'),
})
