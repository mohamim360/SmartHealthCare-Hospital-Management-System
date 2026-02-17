import type { Prisma } from '@/generated/prisma/client'
import { UserStatus } from '@/generated/prisma/client'
import { prisma } from '@/db'
import { calculatePagination, type PaginationOptions } from '@/lib/utils/pagination'
import { patientSearchableFields, patientSortableFields } from './patient.constant'

export type PatientListFilters = {
  searchTerm?: string
  email?: string
}

export async function getPatients(filters: PatientListFilters, options: PaginationOptions) {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options)

  const andConditions: Prisma.PatientWhereInput[] = [{ isDeleted: false }]

  if (filters.searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: { contains: filters.searchTerm, mode: 'insensitive' },
      })),
    })
  }

  if (filters.email) {
    andConditions.push({ email: { equals: filters.email } })
  }

  const where: Prisma.PatientWhereInput = { AND: andConditions }

  const orderByKey = patientSortableFields.includes(sortBy as any)
    ? (sortBy as (typeof patientSortableFields)[number])
    : 'createdAt'

  const [data, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [orderByKey]: sortOrder },
    }),
    prisma.patient.count({ where }),
  ])

  return { data, meta: { page, limit, total } }
}

export async function getPatientById(id: string) {
  return prisma.patient.findFirstOrThrow({
    where: { id, isDeleted: false },
  })
}

export async function updatePatientById(id: string, payload: Prisma.PatientUpdateInput) {
  await prisma.patient.findFirstOrThrow({ where: { id, isDeleted: false } })
  return prisma.patient.update({
    where: { id },
    data: payload,
  })
}

export async function deletePatientById(id: string) {
  const patient = await prisma.patient.findFirstOrThrow({
    where: { id, isDeleted: false },
    select: { id: true, email: true },
  })

  return prisma.$transaction(
    async (tnx) => {
      const deletedPatient = await tnx.patient.update({
        where: { id: patient.id },
        data: { isDeleted: true },
      })

      await tnx.user.update({
        where: { email: patient.email },
        data: { status: UserStatus.DELETED },
      })

      return deletedPatient
    },
    {
      maxWait: 10000,
      timeout: 15000,
    },
  )
}

