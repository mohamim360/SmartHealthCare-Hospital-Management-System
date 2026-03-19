import { prisma } from '@/db'
import {
  calculatePagination,
  type PaginationOptions,
} from '@/lib/utils/pagination'

export type DoctorPayload = { email: string; role: string }

export type CreateDoctorScheduleInput = { scheduleIds: string[] }

/**
 * Assigns schedule slots to a doctor.
 */
export async function insertDoctorScheduleIntoDB(
  user: DoctorPayload,
  payload: CreateDoctorScheduleInput,
) {
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  })

  const data = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctor.id,
    scheduleId,
  }))

  return prisma.doctorSchedules.createMany({
    data,
    skipDuplicates: true,
  })
}

/**
 * Get the doctor's own assigned schedules (with related schedule data).
 */
export async function getMySchedules(
  user: DoctorPayload,
  options: PaginationOptions,
) {
  const { page, limit, skip } = calculatePagination(options)

  const doctor = await prisma.doctor.findUnique({
    where: { email: user.email },
    select: { id: true },
  })

  if (!doctor) {
    return { data: [], meta: { page, limit, total: 0 } }
  }

  const where = { doctorId: doctor.id }

  const [data, total] = await Promise.all([
    prisma.doctorSchedules.findMany({
      where,
      skip,
      take: limit,
      orderBy: { schedule: { startDateTime: 'asc' } },
      include: {
        schedule: true,
      },
    }),
    prisma.doctorSchedules.count({ where }),
  ])

  return {
    data,
    meta: { page, limit, total },
  }
}

/**
 * Get schedules NOT yet assigned to this doctor — for the booking dialog.
 */
export async function getAvailableSchedules(
  user: DoctorPayload,
  options: PaginationOptions,
) {
  const { page, limit, skip } = calculatePagination(options)

  const doctor = await prisma.doctor.findUnique({
    where: { email: user.email },
    select: { id: true },
  })

  // Get IDs of all schedules this doctor already has
  const assignedIds = doctor
    ? (
      await prisma.doctorSchedules.findMany({
        where: { doctorId: doctor.id },
        select: { scheduleId: true },
      })
    ).map((ds) => ds.scheduleId)
    : []

  const where = {
    id: { notIn: assignedIds },
    // Only show future or today's schedules
    startDateTime: { gte: new Date() },
  }

  const [data, total] = await Promise.all([
    prisma.schedule.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDateTime: 'asc' },
    }),
    prisma.schedule.count({ where }),
  ])

  return {
    data,
    meta: { page, limit, total },
  }
}
