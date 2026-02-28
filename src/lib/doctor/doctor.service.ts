import type { Prisma } from '@/generated/prisma/client'
import { UserStatus } from '@/generated/prisma/client'
import { prisma } from '@/db'
import { calculatePagination, type PaginationOptions } from '@/lib/utils/pagination'
import { doctorSearchableFields, doctorSortableFields } from './doctor.constant'

export type DoctorListFilters = {
  searchTerm?: string
  gender?: string
  speciality?: string
}

export async function getDoctors(filters: DoctorListFilters, options: PaginationOptions) {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options)

  const andConditions: Prisma.DoctorWhereInput[] = [{ isDeleted: false }]

  if (filters.searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: { contains: filters.searchTerm, mode: 'insensitive' as const },
      })),
    })
  }

  if (filters.gender) {
    andConditions.push({ gender: filters.gender as any })
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
