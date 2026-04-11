import { AppointmentStatus, PaymentStatus } from '@/generated/prisma/client'
import { prisma } from '@/db'
import type { UserPayload } from '@/lib/auth/auth.middleware'

export type CreateAppointmentInput = {
  doctorId: string
  scheduleId: string
}

export async function createAppointment(user: UserPayload, payload: CreateAppointmentInput) {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  })

  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { id: payload.doctorId, isDeleted: false },
  })

  const doctorSchedule = await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
    include: {
      schedule: { select: { startDateTime: true } },
    },
  })

  // Pre-compute the date range for cancellation check
  const slotDate = new Date(doctorSchedule.schedule.startDateTime)
  const startOfSlotDay = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate())
  const endOfSlotDay = new Date(startOfSlotDay)
  endOfSlotDay.setDate(endOfSlotDay.getDate() + 1)

  const videoCallingId = crypto.randomUUID()
  const transactionId = crypto.randomUUID()

  const result = await prisma.$transaction(
    async (tnx) => {
      // Check cancellation INSIDE the transaction to prevent race condition
      const cancellation = await tnx.doctorDayCancellation.findFirst({
        where: {
          doctorId: payload.doctorId,
          date: { gte: startOfSlotDay, lt: endOfSlotDay },
        },
      })

      if (cancellation) {
        throw new Error('This date has been cancelled by the doctor and is not available for booking')
      }

      // Atomically claim the slot — only succeeds if still unbooked
      const claimed = await tnx.doctorSchedules.updateMany({
        where: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
          isBooked: false,
        },
        data: { isBooked: true },
      })

      if (claimed.count !== 1) {
        throw new Error('This time slot has already been booked')
      }

      const appointment = await tnx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          scheduleId: payload.scheduleId,
          videoCallingId,
        },
      })

      await tnx.payment.create({
        data: {
          appointmentId: appointment.id,
          amount: doctor.appointmentFee,
          transactionId,
        },
      })

      return appointment
    },
    { maxWait: 10000, timeout: 15000 },
  )

  return result
}

/**
 * Change appointment status.
 * - DOCTOR/ADMIN can set any valid status
 * - PATIENT can only CANCEL their own SCHEDULED appointments
 */
export async function changeAppointmentStatus(
  user: UserPayload,
  appointmentId: string,
  newStatus: string,
) {
  const validStatuses = ['SCHEDULED', 'INPROGRESS', 'COMPLETED', 'CANCEL']
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`)
  }

  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    include: { doctor: true, patient: true },
  })

  // Patient can only cancel their own SCHEDULED appointments
  if (user.role === 'PATIENT') {
    const patient = await prisma.patient.findUnique({ where: { email: user.email } })
    if (!patient || patient.id !== appointment.patientId) {
      throw new Error('This is not your appointment')
    }
    if (newStatus !== 'CANCEL') {
      throw new Error('Patient can only cancel appointments')
    }
    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new Error('Can only cancel SCHEDULED appointments')
    }
  }

  // Doctor can only change their own appointments
  if (user.role === 'DOCTOR') {
    if (user.email !== appointment.doctor.email) {
      throw new Error('This is not your appointment')
    }
  }
  // ADMIN / SUPER_ADMIN can change any appointment

  // When cancelling, also release the booked slot
  if (newStatus === 'CANCEL') {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: newStatus as AppointmentStatus },
        include: {
          patient: { select: { id: true, name: true, email: true } },
          doctor: { select: { id: true, name: true, email: true, designation: true } },
          schedule: { select: { startDateTime: true, endDateTime: true } },
        },
      })
      await tx.doctorSchedules.updateMany({
        where: {
          doctorId: appointment.doctorId,
          scheduleId: appointment.scheduleId,
        },
        data: { isBooked: false },
      })
      return updated
    })
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: newStatus as AppointmentStatus },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      doctor: { select: { id: true, name: true, email: true, designation: true } },
      schedule: { select: { startDateTime: true, endDateTime: true } },
    },
  })
}

/**
 * Mark appointment payment as PAID.
 */
export async function markPaymentPaid(user: UserPayload, appointmentId: string) {
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    include: { payment: true, patient: true },
  })

  // Only the patient who owns the appointment can pay
  if (user.role === 'PATIENT') {
    const patient = await prisma.patient.findUnique({ where: { email: user.email } })
    if (!patient || patient.id !== appointment.patientId) {
      throw new Error('This is not your appointment')
    }
  }

  if (!appointment.payment) {
    throw new Error('No payment record found for this appointment')
  }
  if (appointment.payment.status === PaymentStatus.PAID) {
    throw new Error('Payment already completed')
  }

  // Block payment for cancelled appointments
  const currentAppt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { status: true },
  })
  if (currentAppt?.status === AppointmentStatus.CANCEL) {
    throw new Error('Cannot pay for a cancelled appointment')
  }

  return prisma.$transaction(async (tnx) => {
    await tnx.payment.update({
      where: { id: appointment.payment!.id },
      data: { status: PaymentStatus.PAID },
    })
    return tnx.appointment.update({
      where: { id: appointmentId },
      data: { paymentStatus: PaymentStatus.PAID },
    })
  })
}
