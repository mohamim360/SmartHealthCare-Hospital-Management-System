import { PaymentStatus, UserRole } from '@/generated/prisma/client'
import { prisma } from '@/db'
import type { UserPayload } from '@/lib/auth/auth.middleware'

export async function fetchDashboardMetaData(user: UserPayload) {
  switch (user.role) {
    case UserRole.ADMIN:
      return getAdminMetaData()
    case UserRole.DOCTOR:
      return getDoctorMetaData(user)
    case UserRole.PATIENT:
      return getPatientMetaData(user)
    default:
      throw new Error('Invalid user role!')
  }
}

async function getDoctorMetaData(user: UserPayload) {
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  })

  const appointmentCount = await prisma.appointment.count({
    where: { doctorId: doctor.id },
  })

  const patientCountResult = await prisma.appointment.groupBy({
    by: ['patientId'],
    _count: { id: true },
    where: { doctorId: doctor.id },
  })

  const reviewCount = await prisma.review.count({
    where: { doctorId: doctor.id },
  })

  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      appointment: { doctorId: doctor.id },
      status: PaymentStatus.PAID,
    },
  })

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ['status'],
    _count: { id: true },
    where: { doctorId: doctor.id },
  })

  const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ status, _count }) => ({
    status,
    count: Number(_count.id),
  }))

  return {
    appointmentCount,
    reviewCount,
    patientCount: patientCountResult.length,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    formattedAppointmentStatusDistribution,
  }
}

async function getPatientMetaData(user: UserPayload) {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  })

  const appointmentCount = await prisma.appointment.count({
    where: { patientId: patient.id },
  })

  const prescriptionCount = await prisma.prescription.count({
    where: { patientId: patient.id },
  })

  const reviewCount = await prisma.review.count({
    where: { patientId: patient.id },
  })

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ['status'],
    _count: { id: true },
    where: { patientId: patient.id },
  })

  const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ status, _count }) => ({
    status,
    count: Number(_count.id),
  }))

  return {
    appointmentCount,
    prescriptionCount,
    reviewCount,
    formattedAppointmentStatusDistribution,
  }
}

async function getAdminMetaData() {
  const patientCount = await prisma.patient.count()
  const doctorCount = await prisma.doctor.count()
  const adminCount = await prisma.admin.count()
  const appointmentCount = await prisma.appointment.count()
  const paymentCount = await prisma.payment.count()

  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: PaymentStatus.PAID },
  })

  const barChartData = await getBarChartData()
  const pieChartData = await getPieChartData()

  return {
    patientCount,
    doctorCount,
    adminCount,
    appointmentCount,
    paymentCount,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    barChartData,
    pieChartData,
  }
}

async function getBarChartData() {
  const appointmentCountPerMonth = await prisma.$queryRaw<
    Array<{ month: Date; count: bigint }>
  >`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
    COUNT(*) AS count
    FROM "appointments"
    GROUP BY month
    ORDER BY month ASC
  `

  return appointmentCountPerMonth.map((item) => ({
    month: item.month,
    count: Number(item.count),
  }))
}

async function getPieChartData() {
  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ['status'],
    _count: { id: true },
  })

  return appointmentStatusDistribution.map(({ status, _count }) => ({
    status,
    count: Number(_count.id),
  }))
}
