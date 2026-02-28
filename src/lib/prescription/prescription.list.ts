import { prisma } from '@/db'
import { calculatePagination, type PaginationOptions } from '@/lib/utils/pagination'
import type { UserPayload } from '@/lib/auth/auth.middleware'

export async function getPrescriptions(
    user: UserPayload,
    options: PaginationOptions,
) {
    const { page, limit, skip, sortOrder } = calculatePagination(options)

    const where: any = {}

    if (user.role === 'PATIENT') {
        const patient = await prisma.patient.findUnique({ where: { email: user.email } })
        if (patient) where.patientId = patient.id
    } else if (user.role === 'DOCTOR') {
        const doctor = await prisma.doctor.findUnique({ where: { email: user.email } })
        if (doctor) where.doctorId = doctor.id
    }

    const [data, total] = await Promise.all([
        prisma.prescription.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: sortOrder },
            include: {
                patient: { select: { id: true, name: true, email: true } },
                doctor: { select: { id: true, name: true, email: true, designation: true } },
                appointment: { select: { id: true, status: true } },
            },
        }),
        prisma.prescription.count({ where }),
    ])

    return { data, meta: { page, limit, total } }
}
