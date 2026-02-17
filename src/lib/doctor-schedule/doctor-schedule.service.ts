import { prisma } from '@/db'

export type DoctorPayload = { email: string; role: string }

export type CreateDoctorScheduleInput = { scheduleIds: string[] }

export async function insertDoctorScheduleIntoDB(
  user: DoctorPayload,
  payload: CreateDoctorScheduleInput,
) {
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  })

  const data = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctor.id,
    scheduleId,
  }))

  return prisma.doctorSchedules.createMany({
    data,
    skipDuplicates: true,
  })
}
