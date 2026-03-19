import type { Prisma } from '@/generated/prisma/client'
import { UserStatus } from '@/generated/prisma/client'
import { prisma } from '@/db'
import { calculatePagination, type PaginationOptions } from '@/lib/utils/pagination'
import { doctorSearchableFields, doctorSortableFields } from './doctor.constant'

export type DoctorListFilters = {
  searchTerm?: string
  gender?: string
  designation?: string
  minExperience?: number
  maxExperience?: number
  minFee?: number
  maxFee?: number
  minRating?: number
  availability?: 'today' | 'thisWeek'
}

export async function getDoctors(filters: DoctorListFilters, options: PaginationOptions) {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options)

  const andConditions: Prisma.DoctorWhereInput[] = [{ isDeleted: false }]

  // Full-text search across searchable fields
  if (filters.searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: { contains: filters.searchTerm, mode: 'insensitive' as const },
      })),
    })
  }

  // Gender
  if (filters.gender) {
    andConditions.push({ gender: filters.gender as any })
  }

  // Designation (contains match)
  if (filters.designation) {
    andConditions.push({ designation: { contains: filters.designation, mode: 'insensitive' } })
  }

  // Experience range
  if (filters.minExperience !== undefined) {
    andConditions.push({ experience: { gte: filters.minExperience } })
  }
  if (filters.maxExperience !== undefined) {
    andConditions.push({ experience: { lte: filters.maxExperience } })
  }

  // Fee range
  if (filters.minFee !== undefined) {
    andConditions.push({ appointmentFee: { gte: filters.minFee } })
  }
  if (filters.maxFee !== undefined) {
    andConditions.push({ appointmentFee: { lte: filters.maxFee } })
  }

  // Rating filter
  if (filters.minRating !== undefined) {
    andConditions.push({ averageRating: { gte: filters.minRating } })
  }

  // Availability filter — doctors with unbooked schedules in date range
  if (filters.availability) {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    if (filters.availability === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    } else {
      // thisWeek — next 7 days
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
    }

    andConditions.push({
      doctorSchedules: {
        some: {
          isBooked: false,
          schedule: {
            startDateTime: { gte: startDate },
            endDateTime: { lte: endDate },
          },
        },
      },
    })
  }

  const where: Prisma.DoctorWhereInput = { AND: andConditions }

  const orderByKey = doctorSortableFields.includes(sortBy as any)
    ? (sortBy as (typeof doctorSortableFields)[number])
    : 'createdAt'

  const [data, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [orderByKey]: sortOrder },
    }),
    prisma.doctor.count({ where }),
  ])

  return { data, meta: { page, limit, total } }
}

/**
 * Get doctor with full details: reviews (recent 10) + review stats + schedules
 */
export async function getDoctorByIdWithDetails(id: string) {
  const [doctor, reviews, reviewStats] = await Promise.all([
    prisma.doctor.findFirstOrThrow({
      where: { id, isDeleted: false },
      include: {
        doctorSchedules: {
          where: {
            isBooked: false,
            schedule: { startDateTime: { gte: new Date() } },
          },
          include: {
            schedule: { select: { id: true, startDateTime: true, endDateTime: true } },
          },
          orderBy: { schedule: { startDateTime: 'asc' } },
          take: 20,
        },
      },
    }),
    prisma.review.findMany({
      where: { doctorId: id },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        patient: { select: { name: true, profilePhoto: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.review.aggregate({
      where: { doctorId: id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ])

  return {
    ...doctor,
    reviews,
    reviewStats: {
      averageRating: reviewStats._avg.rating
        ? Math.round(reviewStats._avg.rating * 10) / 10
        : 0,
      totalReviews: reviewStats._count.rating,
    },
  }
}

/**
 * Get similar doctors (same designation, excluding current doctor)
 */
export async function getSimilarDoctors(doctorId: string, designation: string) {
  return prisma.doctor.findMany({
    where: {
      isDeleted: false,
      id: { not: doctorId },
      designation: { contains: designation, mode: 'insensitive' },
    },
    select: {
      id: true,
      name: true,
      profilePhoto: true,
      designation: true,
      qualification: true,
      experience: true,
      averageRating: true,
      appointmentFee: true,
    },
    orderBy: { averageRating: 'desc' },
    take: 3,
  })
}

export async function getDoctorById(id: string) {
  return prisma.doctor.findFirstOrThrow({
    where: { id, isDeleted: false },
    include: {
      doctorSchedules: {
        include: {
          schedule: { select: { id: true, startDateTime: true, endDateTime: true } },
        },
      },
    },
  })
}

export async function deleteDoctorById(id: string) {
  const doctor = await prisma.doctor.findFirstOrThrow({
    where: { id, isDeleted: false },
    select: { id: true, email: true },
  })

  return prisma.$transaction(
    async (tnx) => {
      const deletedDoctor = await tnx.doctor.update({
        where: { id: doctor.id },
        data: { isDeleted: true },
      })

      await tnx.user.update({
        where: { email: doctor.email },
        data: { status: UserStatus.DELETED },
      })

      return deletedDoctor
    },
    { maxWait: 10000, timeout: 15000 },
  )
}
