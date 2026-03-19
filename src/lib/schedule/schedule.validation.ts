import { z } from 'zod'

export const createScheduleSchema = z.object({
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'Invalid time (use HH:MM)'),
  endTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'Invalid time (use HH:MM)'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})

export const schedulesForDoctorQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  startDateTime: z.string().datetime().optional(),
  endDateTime: z.string().datetime().optional(),
})
