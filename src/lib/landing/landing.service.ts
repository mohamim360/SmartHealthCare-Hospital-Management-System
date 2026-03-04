import { prisma } from '@/db'

export interface LandingPageData {
    stats: {
        doctorCount: number
        patientCount: number
        appointmentCount: number
        averageRating: number
    }
    featuredDoctors: Array<{
        id: string
        name: string
        profilePhoto: string | null
        designation: string
        qualification: string
        experience: number
        averageRating: number
        appointmentFee: number
    }>
    testimonials: Array<{
        id: string
        rating: number
        comment: string | null
        createdAt: Date
        patient: { name: string; profilePhoto: string | null }
        doctor: { name: string; designation: string }
    }>
}

export async function getLandingPageData(): Promise<LandingPageData> {
    const [
        doctorCount,
        patientCount,
        appointmentCount,
        avgRatingResult,
        featuredDoctors,
        testimonials,
    ] = await Promise.all([
        // Stats
        prisma.doctor.count({ where: { isDeleted: false } }),
        prisma.patient.count({ where: { isDeleted: false } }),
        prisma.appointment.count(),
        prisma.review.aggregate({ _avg: { rating: true } }),

        // Featured doctors — top 4 by average rating (with fallback to experience)
        prisma.doctor.findMany({
            where: { isDeleted: false },
            select: {
                id: true,
                name: true,
                profilePhoto: true,
                designation: true,
                qualification: true,
                experience: true,
                averageRating: true,
                appointmentFee: true,
            },
            orderBy: [{ averageRating: 'desc' }, { experience: 'desc' }],
            take: 4,
        }),

        // Recent testimonials — latest 6 reviews with comments
        prisma.review.findMany({
            where: { comment: { not: null } },
            select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                patient: { select: { name: true, profilePhoto: true } },
                doctor: { select: { name: true, designation: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 6,
        }),
    ])

    return {
        stats: {
            doctorCount,
            patientCount,
            appointmentCount,
            averageRating: avgRatingResult._avg.rating
                ? Math.round(avgRatingResult._avg.rating * 10) / 10
                : 0,
        },
        featuredDoctors,
        testimonials,
    }
}
