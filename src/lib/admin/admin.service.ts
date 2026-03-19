import type { Prisma } from '@/generated/prisma/client'
import { UserStatus } from '@/generated/prisma/client'
import { prisma } from '@/db'
import { calculatePagination, type PaginationOptions } from '@/lib/utils/pagination'
import { adminSearchableFields, adminSortableFields } from './admin.constant'

export type AdminListFilters = {
  searchTerm?: string
  email?: string
  contactNumber?: string
}

export async function getAdmins(filters: AdminListFilters, options: PaginationOptions) {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options)

  const andConditions: Prisma.AdminWhereInput[] = [{ isDeleted: false }]

  if (filters.searchTerm) {
    andConditions.push({
      OR: adminSearchableFields.map((field) => ({
        [field]: { contains: filters.searchTerm, mode: 'insensitive' },
      })),
    })
  }

  if (filters.email) {
    andConditions.push({ email: { equals: filters.email } })
  }

  if (filters.contactNumber) {
    andConditions.push({ contactNumber: { equals: filters.contactNumber } })
  }

  const where: Prisma.AdminWhereInput = { AND: andConditions }

  const orderByKey = adminSortableFields.includes(sortBy as any)
    ? (sortBy as (typeof adminSortableFields)[number])
    : 'createdAt'

  const [data, total] = await Promise.all([
    prisma.admin.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [orderByKey]: sortOrder },
    }),
    prisma.admin.count({ where }),
  ])

  return { data, meta: { page, limit, total } }
}

export async function getAdminById(id: string) {
  return prisma.admin.findFirstOrThrow({
    where: { id, isDeleted: false },
  })
}

export async function updateAdminById(id: string, payload: Prisma.AdminUpdateInput) {
  await prisma.admin.findFirstOrThrow({ where: { id, isDeleted: false } })
  return prisma.admin.update({
    where: { id },
    data: payload,
  })
}

export async function deleteAdminById(id: string) {
  const admin = await prisma.admin.findFirstOrThrow({
    where: { id, isDeleted: false },
    select: { id: true, email: true },
  })

  return prisma.$transaction(
    async (tnx) => {
      const deletedAdmin = await tnx.admin.update({
        where: { id: admin.id },
        data: { isDeleted: true },
      })

      await tnx.user.update({
        where: { email: admin.email },
        data: { status: UserStatus.DELETED },
      })

      return deletedAdmin
    },
    {
      maxWait: 10000,
      timeout: 15000,
    },
  )
}

