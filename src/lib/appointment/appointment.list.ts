import { prisma } from '@/db'
import { calculatePagination, type PaginationOptions } from '@/lib/utils/pagination'
import type { UserPayload } from '@/lib/auth/auth.middleware'

export type AppointmentListFilters = {
    status?: string
    searchTerm?: string
    patientId?: string
    doctorId?: string
}

export async function getAppointments(
    user: UserPayload,
    filters: AppointmentListFilters,
    options: PaginationOptions,
) {
    const { page, limit, skip, sortOrder } = calculatePagination(options)

    const where: any = {}

    // Role-based filtering
    if (user.role === 'PATIENT') {
        const patient = await prisma.patient.findUnique({ where: { email: user.email } })
        if (patient) where.patientId = patient.id
    } else if (user.role === 'DOCTOR') {
        const doctor = await prisma.doctor.findUnique({ where: { email: user.email } })
        if (doctor) where.doctorId = doctor.id
    }
    // ADMIN sees all

    if (filters.status) where.status = filters.status
    if (filters.patientId) where.patientId = filters.patientId
    if (filters.doctorId) where.doctorId = filters.doctorId

    const [data, total] = await Promise.all([
        prisma.appointment.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: sortOrder },
            include: {
                patient: { select: { id: true, name: true, email: true, profilePhoto: true } },
                doctor: { select: { id: true, name: true, email: true, designation: true, appointmentFee: true } },
                schedule: { select: { startDateTime: true, endDateTime: true } },
                prescription: { select: { id: true } },
                review: { select: { id: true } },
            },
        }),
        prisma.appointment.count({ where }),
    ])

    return { data, meta: { page, limit, total } }
}

export { createAppointment } from '@/lib/appointment/appointment.service'
