import { z } from 'zod'

export const createPatientJsonSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  address: z.string().optional(),
})

export const createPatientMultipartSchema = z.object({
  password: z.string().min(1),
  patient: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address: z.string().optional(),
  }),
})

