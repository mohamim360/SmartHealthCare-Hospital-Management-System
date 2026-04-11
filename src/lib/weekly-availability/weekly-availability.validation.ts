import { z } from 'zod'

const daySlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'Invalid time (use HH:MM)'),
  endTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'Invalid time (use HH:MM)'),
  isActive: z.boolean().default(true),
})

export const setWeeklyAvailabilitySchema = z.object({
  slots: z.array(daySlotSchema).min(1).max(7),
})

export const cancelDaySchema = z.object({
  date: z.string().min(1, 'Date is required'), // YYYY-MM-DD format
  reason: z.string().optional(),
})

export const uncancelDaySchema = z.object({
  date: z.string().min(1, 'Date is required'),
})

export const generateSlotsSchema = z.object({
  weeksAhead: z.coerce.number().min(1).max(12).default(4),
})
