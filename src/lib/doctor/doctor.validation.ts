import { z } from 'zod'

export const doctorListQuerySchema = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    searchTerm: z.string().min(1).optional(),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    speciality: z.string().optional(),
    designation: z.string().optional(),
    minExperience: z.coerce.number().min(0).optional(),
    maxExperience: z.coerce.number().min(0).optional(),
    minFee: z.coerce.number().min(0).optional(),
    maxFee: z.coerce.number().min(0).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    availability: z.enum(['today', 'thisWeek']).optional(),
})

export type DoctorListQuery = z.infer<typeof doctorListQuerySchema>

export const doctorUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  contactNumber: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  qualification: z.string().min(1).optional(),
  designation: z.string().min(1).optional(),
  experience: z.coerce.number().min(0).optional(),
  appointmentFee: z.coerce.number().min(0).optional(),
  currentWorkingPlace: z.string().min(1).optional(),
  registrationNumber: z.string().min(1).optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  profilePhoto: z.string().url().optional(),
})
