import { AppointmentStatus, PaymentStatus } from '@/generated/prisma/client'
import { prisma } from '@/db'
import type { UserPayload } from '@/lib/auth/auth.middleware'

export type CreatePrescriptionInput = {
  appointmentId: string
  instructions: string
  followUpDate?: string | Date | null
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

  const followUp =
    payload.followUpDate == null
      ? null
      : typeof payload.followUpDate === 'string'
        ? new Date(payload.followUpDate)
        : payload.followUpDate

  return prisma.prescription.create({
    data: {
      appointmentId: appointment.id,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      instructions: payload.instructions,
      followUpDate: followUp ?? undefined,
    },
    include: { patient: true },
  })
}
