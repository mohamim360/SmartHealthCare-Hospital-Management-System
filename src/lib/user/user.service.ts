import bcrypt from 'bcryptjs'
import { prisma } from '@/db'

export type CreatePatientInput = {
  name: string
  email: string
  password: string
  address?: string
}

export async function createPatient(payload: CreatePatientInput) {
  const hashPassword = await bcrypt.hash(payload.password, 10)

  await prisma.user.create({
    data: {
      email: payload.email,
      password: hashPassword,
    },
  })

  const patient = await prisma.patient.create({
    data: {
      name: payload.name,
      email: payload.email,
      address: payload.address ?? '',
    },
  })

  return patient
}
