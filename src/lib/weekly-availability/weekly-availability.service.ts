import { prisma } from '@/db'
import { addMinutes, addHours, format, addDays, startOfDay } from 'date-fns'

export type DaySlot = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

/**
 * Set (upsert) the weekly availability template for a doctor.
 * Each slot is unique per [doctorId, dayOfWeek].
 */
export async function setWeeklyAvailability(doctorId: string, slots: DaySlot[]) {
  const activeDays = slots.map(s => s.dayOfWeek)

  return prisma.$transaction(async (tx) => {
    await tx.doctorWeeklyAvailability.deleteMany({
      where: {
        doctorId,
        dayOfWeek: { notIn: activeDays },
      },
    })

    const results = []
    for (const slot of slots) {
      const result = await tx.doctorWeeklyAvailability.upsert({
        where: {
          doctorId_dayOfWeek: {
            doctorId,
            dayOfWeek: slot.dayOfWeek,
          },
        },
        update: {
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: slot.isActive,
        },
        create: {
          doctorId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: slot.isActive,
        },
      })
      results.push(result)
    }

    return results
  })
}

/**
 * Get the weekly availability template for a doctor.
 */
export async function getWeeklyAvailability(doctorId: string) {
  return prisma.doctorWeeklyAvailability.findMany({
    where: { doctorId },
    orderBy: { dayOfWeek: 'asc' },
  })
}

/**
 * Cancel a specific date for a doctor.
 * Also auto-cancels any existing SCHEDULED appointments on that date.
 */
export async function cancelDay(doctorId: string, date: string, reason?: string) {
  const dateObj = startOfDay(new Date(date))
  const nextDay = addDays(dateObj, 1)

  return prisma.$transaction(async (tx) => {
    // 1. Record the cancellation
    const cancellation = await tx.doctorDayCancellation.upsert({
      where: {
        doctorId_date: {
          doctorId,
          date: dateObj,
        },
      },
      update: { reason },
      create: {
        doctorId,
        date: dateObj,
        reason,
      },
    })

    // 2. Find all SCHEDULED appointments for this doctor on this date
    const appointmentsToCancel = await tx.appointment.findMany({
      where: {
        doctorId,
        status: 'SCHEDULED',
        schedule: {
          startDateTime: { gte: dateObj, lt: nextDay },
        },
      },
      select: { id: true, scheduleId: true },
    })

    // 3. Cancel those appointments and free up the schedule slots
    if (appointmentsToCancel.length > 0) {
      await tx.appointment.updateMany({
        where: {
          id: { in: appointmentsToCancel.map(a => a.id) },
        },
        data: { status: 'CANCEL' },
      })

      await tx.doctorSchedules.updateMany({
        where: {
          doctorId,
          scheduleId: { in: appointmentsToCancel.map(a => a.scheduleId) },
        },
        data: { isBooked: false },
      })
    }

    return {
      ...cancellation,
      cancelledAppointments: appointmentsToCancel.length,
    }
  })
}

/**
 * Remove a cancellation (uncancel a day).
 */
export async function uncancelDay(doctorId: string, date: string) {
  const dateObj = startOfDay(new Date(date))

  const result = await prisma.doctorDayCancellation.deleteMany({
    where: {
      doctorId,
      date: dateObj,
    },
  })

  return result.count
}

/**
 * Get all cancellations for a doctor within a date range.
 */
export async function getCancellations(doctorId: string, fromDate?: Date, toDate?: Date) {
  const where: any = { doctorId }
  if (fromDate || toDate) {
    where.date = {}
    if (fromDate) where.date.gte = fromDate
    if (toDate) where.date.lte = toDate
  }

  return prisma.doctorDayCancellation.findMany({
    where,
    orderBy: { date: 'asc' },
  })
}

/**
 * Generate concrete Schedule + DoctorSchedules entries for the next N weeks
 * based on the doctor's weekly availability template.
 * Skips cancelled dates and already-existing slots.
 */
export async function generateSlotsForWeeks(doctorId: string, weeksAhead: number = 4) {
  const intervalMinutes = 30

  // Get doctor's weekly template
  const availability = await prisma.doctorWeeklyAvailability.findMany({
    where: { doctorId, isActive: true },
  })

  if (availability.length === 0) {
    return { created: 0, message: 'No weekly availability configured' }
  }

  // Get cancellations for the period
  const today = startOfDay(new Date())
  const endDate = addDays(today, weeksAhead * 7)

  const cancellations = await prisma.doctorDayCancellation.findMany({
    where: {
      doctorId,
      date: { gte: today, lte: endDate },
    },
  })

  const cancelledDates = new Set(
    cancellations.map(c => format(c.date, 'yyyy-MM-dd'))
  )

  // Build a map of dayOfWeek -> availability
  const availByDay = new Map<number, typeof availability[0]>()
  for (const a of availability) {
    availByDay.set(a.dayOfWeek, a)
  }

  let created = 0
  let currentDate = new Date(today)

  while (currentDate < endDate) {
    const dayOfWeek = currentDate.getDay() // 0=Sunday
    const dateStr = format(currentDate, 'yyyy-MM-dd')

    // Check if this day has availability and is not cancelled
    const dayAvail = availByDay.get(dayOfWeek)
    if (dayAvail && !cancelledDates.has(dateStr)) {
      const [startH, startM] = dayAvail.startTime.split(':').map(Number)
      const [endH, endM] = dayAvail.endTime.split(':').map(Number)

      let slotStart = addMinutes(
        addHours(new Date(dateStr), startH),
        startM
      )
      const dayEnd = addMinutes(
        addHours(new Date(dateStr), endH),
        endM
      )

      while (slotStart < dayEnd) {
        const slotEnd = addMinutes(slotStart, intervalMinutes)

        // Check if schedule already exists
        const existing = await prisma.schedule.findFirst({
          where: {
            startDateTime: slotStart,
            endDateTime: slotEnd,
          },
        })

        let scheduleId: string
        if (existing) {
          scheduleId = existing.id
        } else {
          const newSchedule = await prisma.schedule.create({
            data: {
              startDateTime: slotStart,
              endDateTime: slotEnd,
            },
          })
          scheduleId = newSchedule.id
        }

        // Check if doctor-schedule link already exists
        const existingLink = await prisma.doctorSchedules.findUnique({
          where: {
            doctorId_scheduleId: {
              doctorId,
              scheduleId,
            },
          },
        })

        if (!existingLink) {
          await prisma.doctorSchedules.create({
            data: {
              doctorId,
              scheduleId,
            },
          })
          created++
        }

        slotStart = addMinutes(slotStart, intervalMinutes)
      }
    }

    currentDate = addDays(currentDate, 1)
  }

  return { created, message: `Generated ${created} new schedule slots for ${weeksAhead} weeks` }
}
