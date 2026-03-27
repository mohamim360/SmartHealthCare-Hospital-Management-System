
import { createFileRoute } from '@tanstack/react-router'
import { verifyAuth } from '@/lib/auth/auth.middleware'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { prisma } from '@/db'

export const Route = createFileRoute('/api/auth/me')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = verifyAuth(request)
        if (!user) {
          return sendError({ statusCode: 401, message: 'Not authenticated' })
        }

        // Fetch the full name from the role-specific table
        let name = user.email
        let profilePhoto: string | null = null
        try {
          if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            const admin = await prisma.admin.findFirst({ where: { email: user.email }, select: { name: true, profilePhoto: true } })
            if (admin) { name = admin.name; profilePhoto = admin.profilePhoto ?? null }
          } else if (user.role === 'DOCTOR') {
            const doctor = await prisma.doctor.findFirst({ where: { email: user.email }, select: { name: true, profilePhoto: true } })
            if (doctor) { name = doctor.name; profilePhoto = doctor.profilePhoto ?? null }
          } else if (user.role === 'PATIENT') {
            const patient = await prisma.patient.findFirst({ where: { email: user.email }, select: { name: true, profilePhoto: true } })
            if (patient) { name = patient.name; profilePhoto = patient.profilePhoto ?? null }
          }
        } catch {
          // fallback to email as name
        }

        return sendSuccess({
          statusCode: 200,
          message: 'Authenticated',
          data: {
            email: user.email,
            role: user.role,
            name,
            profilePhoto,
          },
        })
      },
    },
  },
})
