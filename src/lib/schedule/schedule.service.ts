import { addHours, addMinutes, format } from 'date-fns'
import type { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/db'
import {
  calculatePagination,
  type PaginationOptions,
  type PaginationResult,
} from '@/lib/utils/pagination'

export type CreateScheduleInput = {
  startTime: string
  endTime: string
  startDate: string
  endDate: string
}

export type SchedulesForDoctorFilters = {
  startDateTime?: string
  endDateTime?: string
}

export async function insertSchedulesIntoDB(payload: CreateScheduleInput) {
  const { startTime, endTime, startDate, endDate } = payload
  const intervalMinutes = 30
  const schedules: Array<{ id: string; startDateTime: Date; endDateTime: Date }> = []

  const currentDate = new Date(startDate)
  const lastDate = new Date(endDate)
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  while (currentDate <= lastDate) {
    let slotStart = addMinutes(
      addHours(new Date(format(currentDate, 'yyyy-MM-dd')), startHour),
      startMin,
    )
    const dayEnd = addMinutes(
      addHours(new Date(format(currentDate, 'yyyy-MM-dd')), endHour),
      endMin,
    )

    while (slotStart < dayEnd) {
      const slotEnd = addMinutes(slotStart, intervalMinutes)
      const existing = await prisma.schedule.findFirst({
        where: {
          startDateTime: slotStart,
          endDateTime: slotEnd,
        },
      })
      if (!existing) {
        const created = await prisma.schedule.create({
          data: {
            startDateTime: slotStart,
            endDateTime: slotEnd,
          },
        })
        schedules.push(created)
      }
      slotStart = addMinutes(slotStart, intervalMinutes)
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return schedules
}

export type DoctorPayload = { email: string; role: string }

export async function schedulesForDoctor(
  user: DoctorPayload,
  filters: SchedulesForDoctorFilters,
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

  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where: { doctor: { email: user.email } },
    select: { scheduleId: true },
  })
  const assignedIds = doctorSchedules.map((s) => s.scheduleId)

  const where: Prisma.ScheduleWhereInput = {
    id: { notIn: assignedIds },
    ...(andConditions.length > 0 ? { AND: andConditions } : {}),
  }

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
