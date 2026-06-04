import { AppointmentStatus, PaymentStatus } from '@/generated/prisma/client'
import { prisma } from '@/db'
import type { UserPayload } from '@/lib/auth/auth.middleware'

export type CreatePrescriptionInput = {
  appointmentId: string
  instructions: string
  followUpDate?: string | Date | null
}

export type UpdatePrescriptionInput = {
  instructions: string
  followUpDate?: string | Date | null
}

const prescriptionInclude = {
  patient: { select: { id: true, name: true, email: true, contactNumber: true } },
  doctor: { select: { id: true, name: true, email: true, designation: true, profilePhoto: true } },
  appointment: {
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      schedule: { select: { startDateTime: true, endDateTime: true } },
    },
  },
} as const

function parseFollowUpDate(value?: string | Date | null) {
  if (value == null || value === '') return null
  return typeof value === 'string' ? new Date(value) : value
}

async function assertPrescriptionAccess(user: UserPayload, prescriptionId: string) {
  const prescription = await prisma.prescription.findUniqueOrThrow({
    where: { id: prescriptionId },
    include: prescriptionInclude,
  })

  if (user.role === 'PATIENT') {
    const patient = await prisma.patient.findUnique({ where: { email: user.email } })
    if (!patient || patient.id !== prescription.patientId) {
      throw new Error('You do not have access to this prescription')
    }
  } else if (user.role === 'DOCTOR') {
    if (user.email !== prescription.doctor.email) {
      throw new Error('You do not have access to this prescription')
    }
  } else if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new Error('You do not have access to this prescription')
  }

  return prescription
}

export async function getPrescriptionById(user: UserPayload, prescriptionId: string) {
  return assertPrescriptionAccess(user, prescriptionId)
}

export async function updatePrescription(
  user: UserPayload,
  prescriptionId: string,
  payload: UpdatePrescriptionInput,
) {
  if (user.role !== 'DOCTOR') {
    throw new Error('Only doctors can update prescriptions')
  }

  const prescription = await assertPrescriptionAccess(user, prescriptionId)

  if (user.email !== prescription.doctor.email) {
    throw new Error('This is not your prescription')
  }

  return prisma.prescription.update({
    where: { id: prescriptionId },
    data: {
      instructions: payload.instructions,
      followUpDate: parseFollowUpDate(payload.followUpDate),
    },
    include: prescriptionInclude,
  })
}

export async function createPrescription(user: UserPayload, payload: CreatePrescriptionInput) {
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: { doctor: true },
  })

  if (user.email !== appointment.doctor.email) {
    throw new Error('This is not your appointment')
  }

  const followUp = parseFollowUpDate(payload.followUpDate)

  return prisma.prescription.create({
    data: {
      appointmentId: appointment.id,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      instructions: payload.instructions,
      followUpDate: followUp ?? undefined,
    },
    include: prescriptionInclude,
  })
}
