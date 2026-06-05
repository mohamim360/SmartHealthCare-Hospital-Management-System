import type { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/db'
import {
  calculatePagination,
  type PaginationOptions,
} from '@/lib/utils/pagination'
import {
  addScheduleDays,
  addScheduleMinutes,
  getScheduleDateKey,
  parseScheduleDate,
  parseScheduleDateTime,
} from '@/lib/utils/schedule-datetime'

export type CreateScheduleInput = {
  startTime: string
  endTime: string
  startDate: string
  endDate: string
  doctorId?: string
}

export type ScheduleFilters = {
  startDateTime?: string
  endDateTime?: string
}

/**
 * Creates 30-minute time slots between startDate–endDate × startTime–endTime.
 * If doctorId is provided, also links each slot to that doctor via DoctorSchedules.
 */
export async function insertSchedulesIntoDB(payload: CreateScheduleInput) {
  const { startTime, endTime, startDate, endDate, doctorId } = payload
  const intervalMinutes = 30

  let currentDate = parseScheduleDate(startDate)
  const lastDate = parseScheduleDate(endDate)

  let newSlots = 0
  let linkedSlots = 0
  let totalSlots = 0

  while (currentDate <= lastDate) {
    const dateStr = getScheduleDateKey(currentDate)
    let slotStart = parseScheduleDateTime(dateStr, startTime)
    const dayEnd = parseScheduleDateTime(dateStr, endTime)

    while (slotStart < dayEnd) {
      const slotEnd = addScheduleMinutes(slotStart, intervalMinutes)
      totalSlots++

      const existing = await prisma.schedule.findFirst({
        where: {
          startDateTime: slotStart,
          endDateTime: slotEnd,
        },
      })

      let scheduleId: string
      if (!existing) {
        const created = await prisma.schedule.create({
          data: {
            startDateTime: slotStart,
            endDateTime: slotEnd,
          },
        })
        scheduleId = created.id
        newSlots++
      } else {
        scheduleId = existing.id
      }

      if (doctorId) {
        const existingLink = await prisma.doctorSchedules.findUnique({
          where: {
            doctorId_scheduleId: { doctorId, scheduleId },
          },
        })
        if (!existingLink) {
          await prisma.doctorSchedules.create({
            data: { doctorId, scheduleId },
          })
          linkedSlots++
        }
      }

      slotStart = addScheduleMinutes(slotStart, intervalMinutes)
    }

    currentDate = addScheduleDays(currentDate, 1)
  }

  return { newSlots, linkedSlots, totalSlots }
}

/**
 * Fetch all schedules with pagination and date filters.
 */
export async function getAllSchedules(
  filters: ScheduleFilters,
  options: PaginationOptions,
) {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options)

  const andConditions: Prisma.ScheduleWhereInput[] = []
  if (filters.startDateTime && filters.endDateTime) {
    andConditions.push({
      AND: [
        { startDateTime: { gte: new Date(filters.startDateTime) } },
        { endDateTime: { lte: new Date(filters.endDateTime) } },
      ],
    })
  }

  const where: Prisma.ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {}

  const validSortKeys = ['id', 'startDateTime', 'endDateTime', 'createdAt', 'updatedAt'] as const
  const orderByKey = validSortKeys.includes(sortBy as (typeof validSortKeys)[number])
    ? sortBy
    : 'startDateTime'

  const [data, total] = await Promise.all([
    prisma.schedule.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [orderByKey]: sortOrder },
    }),
    prisma.schedule.count({ where }),
  ])

  return {
    data,
    meta: { page, limit, total },
  }
}

export async function deleteScheduleFromDB(id: string) {
  return prisma.schedule.delete({
    where: { id },
  })
}
