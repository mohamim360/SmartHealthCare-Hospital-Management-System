import { z } from 'zod'

/** Create schedule form schema */
export const createScheduleSchema = z.object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
})
export type CreateScheduleFormData = z.infer<typeof createScheduleSchema>
