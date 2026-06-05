/**
 * Schedule date/time helpers.
 *
 * All appointment slots use UTC wall-clock storage: the time entered in admin/doctor
 * UI (e.g. 9:00 AM on 2026-06-05) is stored as 2026-06-05T09:00:00.000Z and displayed
 * with timeZone UTC everywhere so booking, doctor profile, and admin views match.
 */

export const SCHEDULE_LOCALE = 'en-US'

function toScheduleDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value
}

/** Parse YYYY-MM-DD as UTC midnight */
export function parseScheduleDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0))
}

/** Parse YYYY-MM-DD + HH:mm (24h) as UTC wall-clock */
export function parseScheduleDateTime(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h, min] = timeStr.split(':').map(Number)
  return new Date(Date.UTC(y, m - 1, d, h, min, 0, 0))
}

/** UTC calendar date key YYYY-MM-DD */
export function getScheduleDateKey(value: string | Date): string {
  const d = toScheduleDate(value)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Start of UTC calendar day for an instant */
export function getScheduleDayStart(value: string | Date = new Date()): Date {
  return parseScheduleDate(getScheduleDateKey(value))
}

export function addScheduleMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

export function addScheduleDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60_000)
}

export function getTodayScheduleDateKey(): string {
  return getScheduleDateKey(new Date())
}

export function formatScheduleDateTime(value: string | Date): string {
  return toScheduleDate(value).toLocaleString(SCHEDULE_LOCALE, {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatScheduleDate(value: string | Date): string {
  return toScheduleDate(value).toLocaleDateString(SCHEDULE_LOCALE, {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatScheduleTime(value: string | Date): string {
  return toScheduleDate(value).toLocaleTimeString(SCHEDULE_LOCALE, {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatScheduleParts(value: string | Date) {
  const d = toScheduleDate(value)
  return {
    day: d.toLocaleDateString(SCHEDULE_LOCALE, { timeZone: 'UTC', weekday: 'short' }),
    date: d.toLocaleDateString(SCHEDULE_LOCALE, { timeZone: 'UTC', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString(SCHEDULE_LOCALE, {
      timeZone: 'UTC',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  }
}

export function formatScheduleSlotButton(start: string | Date, end: string | Date) {
  const s = toScheduleDate(start)
  const e = toScheduleDate(end)
  return {
    dateStr: s.toLocaleDateString(SCHEDULE_LOCALE, { timeZone: 'UTC', month: 'short', day: 'numeric' }),
    startTime: s.toLocaleTimeString(SCHEDULE_LOCALE, {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    endTime: e.toLocaleTimeString(SCHEDULE_LOCALE, {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  }
}

export function formatScheduleWeekdayDate(value: string | Date): string {
  return toScheduleDate(value).toLocaleDateString(SCHEDULE_LOCALE, {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function formatScheduleMonthYear(value: string | Date): string {
  return toScheduleDate(value).toLocaleDateString(SCHEDULE_LOCALE, {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  })
}

export function formatScheduleShortMonth(value: string | Date): string {
  return toScheduleDate(value).toLocaleDateString(SCHEDULE_LOCALE, {
    timeZone: 'UTC',
    month: 'short',
  })
}
