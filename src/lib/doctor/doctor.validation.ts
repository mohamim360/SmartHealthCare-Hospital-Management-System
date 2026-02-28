import { z } from 'zod'

export const doctorListQuerySchema = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    searchTerm: z.string().min(1).optional(),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    speciality: z.string().optional(),
})
