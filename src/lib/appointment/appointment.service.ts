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
  })

  const videoCallingId = crypto.randomUUID()
  const transactionId = crypto.randomUUID()

  const result = await prisma.$transaction(
    async (tnx) => {
      const appointment = await tnx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          scheduleId: payload.scheduleId,
          videoCallingId,
        },
      })

      await tnx.doctorSchedules.update({
        where: {
          doctorId_scheduleId: {
            doctorId: doctorSchedule.doctorId,
            scheduleId: payload.scheduleId,
          },
        },
        data: { isBooked: true },
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
