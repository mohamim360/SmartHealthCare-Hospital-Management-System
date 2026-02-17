import { prisma } from '@/db'
import type { UserPayload } from '@/lib/auth/auth.middleware'

export type CreateReviewInput = {
  appointmentId: string
  rating: number
  comment?: string | null
}

export async function createReview(user: UserPayload, payload: CreateReviewInput) {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  })

  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: payload.appointmentId },
  })

  if (patient.id !== appointment.patientId) {
    throw new Error('This is not your appointment!')
  }

  return prisma.$transaction(
    async (tnx) => {
      const review = await tnx.review.create({
        data: {
          appointmentId: appointment.id,
          doctorId: appointment.doctorId,
          patientId: appointment.patientId,
          rating: payload.rating,
          comment: payload.comment ?? undefined,
        },
      })

      const avgRating = await tnx.review.aggregate({
        _avg: { rating: true },
        where: { doctorId: appointment.doctorId },
      })

      await tnx.doctor.update({
        where: { id: appointment.doctorId },
        data: { averageRating: (avgRating._avg.rating ?? 0) as number },
      })

      return review
    },
    { maxWait: 10000, timeout: 15000 },
  )
}
