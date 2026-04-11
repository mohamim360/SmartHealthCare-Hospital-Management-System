import { z } from 'zod'

const STRICT_TIME_REGEX = /^(?:[01]?\d|2[0-3]):[0-5]\d$/
const STRICT_DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

const daySlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(STRICT_TIME_REGEX, 'Invalid time (use HH:MM, 0-23 hours)'),
  endTime: z.string().regex(STRICT_TIME_REGEX, 'Invalid time (use HH:MM, 0-23 hours)'),
  isActive: z.boolean().default(true),
}).refine((data) => {
  const [sh, sm] = data.startTime.split(':').map(Number)
  const [eh, em] = data.endTime.split(':').map(Number)
  return (eh * 60 + em) > (sh * 60 + sm)
}, { message: 'endTime must be after startTime', path: ['endTime'] })

export const setWeeklyAvailabilitySchema = z.object({
  slots: z.array(daySlotSchema).min(1).max(7),
})

export const cancelDaySchema = z.object({
  date: z.string().regex(STRICT_DATE_REGEX, 'Date must be in YYYY-MM-DD format'),
  reason: z.string().optional(),
})

export const uncancelDaySchema = z.object({
  date: z.string().regex(STRICT_DATE_REGEX, 'Date must be in YYYY-MM-DD format'),
})

export const generateSlotsSchema = z.object({
  weeksAhead: z.coerce.number().min(1).max(12).default(4),
})
