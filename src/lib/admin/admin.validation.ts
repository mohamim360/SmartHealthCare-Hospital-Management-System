import { z } from 'zod'

export const adminListQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  searchTerm: z.string().min(1).optional(),
  email: z.string().email().optional(),
  contactNumber: z.string().min(1).optional(),
})

export const adminUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  contactNumber: z.string().min(1).optional(),
  profilePhoto: z.string().url().optional(),
})

