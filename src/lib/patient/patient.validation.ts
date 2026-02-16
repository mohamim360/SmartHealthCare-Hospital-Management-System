import { z } from 'zod'

export const patientListQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  searchTerm: z.string().min(1).optional(),
  email: z.string().email().optional(),
})

export const patientUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  profilePhoto: z.string().url().optional(),
})

