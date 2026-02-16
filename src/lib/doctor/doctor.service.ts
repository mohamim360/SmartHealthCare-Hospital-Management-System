import { UserStatus } from '@/generated/prisma/client'
import { prisma } from '@/db'

export async function getDoctorById(id: string) {
  return prisma.doctor.findFirstOrThrow({
    where: { id, isDeleted: false },
    include: { doctorSchedules: true },
  })
}

export async function deleteDoctorById(id: string) {
  const doctor = await prisma.doctor.findFirstOrThrow({
    where: { id, isDeleted: false },
    select: { id: true, email: true },
  })

  return prisma.$transaction(
    async (tnx) => {
      const deletedDoctor = await tnx.doctor.update({
        where: { id: doctor.id },
        data: { isDeleted: true },
      })

      await tnx.user.update({
        where: { email: doctor.email },
        data: { status: UserStatus.DELETED },
      })

      return deletedDoctor
    },
    { maxWait: 10000, timeout: 15000 },
  )
}

