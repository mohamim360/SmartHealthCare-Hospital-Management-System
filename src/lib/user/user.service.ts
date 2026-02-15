import bcrypt from 'bcryptjs'
import { prisma } from '@/db'
import { UserRole, Prisma } from '@/generated/prisma/client'
import { paginationHelper, PaginationOptions } from '@/lib/utils/pagination'

export const userSearchableFields = ['email']

export type CreateUserInput = {
  password: string
  email: string
  profilePhoto?: string
}

export type CreatePatientInput = CreateUserInput & {
  name: string
  address?: string
}

export type CreateAdminInput = CreateUserInput & {
  name: string
  contactNumber: string
}

export type CreateDoctorInput = CreateUserInput & {
  name: string
  contactNumber: string
  address: string
  registrationNumber: string
  experience: number
  gender: 'MALE' | 'FEMALE'
  appointmentFee: number
  qualification: string
  currentWorkingPlace: string
  designation: string
}

export async function createPatient(payload: CreatePatientInput) {
  const hashPassword = await bcrypt.hash(payload.password, 10)

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: payload.email,
        password: hashPassword,
        role: UserRole.PATIENT,
      },
    })

    return await tnx.patient.create({
      data: {
        name: payload.name,
        email: payload.email,
        address: payload.address,
        profilePhoto: payload.profilePhoto,
      },
    })
  }, {
    maxWait: 10000, // time to acquire a connection (fixes P2028 on first/cold request)
    timeout: 15000,
  })

  return result
}

export async function createAdmin(payload: CreateAdminInput) {
  const hashPassword = await bcrypt.hash(payload.password, 10)

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: payload.email,
        password: hashPassword,
        role: UserRole.ADMIN,
      },
    })

    return await tnx.admin.create({
      data: {
        name: payload.name,
        email: payload.email,
        contactNumber: payload.contactNumber,
        profilePhoto: payload.profilePhoto,
      },
    })
  }, {
    maxWait: 10000, // time to acquire a connection (fixes P2028 on first/cold request)
    timeout: 15000,
  })

  return result
}

export async function createDoctor(payload: CreateDoctorInput) {
  const hashPassword = await bcrypt.hash(payload.password, 10)

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: payload.email,
        password: hashPassword,
        role: UserRole.DOCTOR,
      },
    })

    return await tnx.doctor.create({
      data: {
        name: payload.name,
        email: payload.email,
        contactNumber: payload.contactNumber,
        address: payload.address,
        registrationNumber: payload.registrationNumber,
        experience: payload.experience,
        gender: payload.gender,
        appointmentFee: payload.appointmentFee,
        qualification: payload.qualification,
        currentWorkingPlace: payload.currentWorkingPlace,
        designation: payload.designation,
        profilePhoto: payload.profilePhoto,
      },
    })
  }, {
    maxWait: 10000, // time to acquire a connection (fixes P2028 on first/cold request)
    timeout: 15000,
  })

  return result
}

// Pagination and filtering logic

export async function getAllFromDB(
  params: any,
  options: PaginationOptions,
) {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options)
  const { searchTerm, ...filterData } = params

  const andConditions: Prisma.UserWhereInput[] = []

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    })
  }

  // Whitelist filters
  const filterKeys = Object.keys(filterData)
  if (filterKeys.length > 0) {
    andConditions.push({
      AND: filterKeys
        .filter((key) => userFilterableFields.includes(key))
        .map((key) => ({
          [key]: {
            equals: (filterData as any)[key],
          },
        })),
    })
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {}

  const result = await prisma.user.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: {
      [sortBy]: sortOrder,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      needPasswordChange: true,
      createdAt: true,
      updatedAt: true,
      patient: true,
      doctor: true,
      admin: true,
    },
  })

  const total = await prisma.user.count({
    where: whereConditions,
  })

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  }
}
