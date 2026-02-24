import { z } from 'zod'

/** Create patient form schema */
export const createPatientSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.email('Invalid email address'),
    contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
    address: z.string().min(1, 'Address is required'),
    profilePhoto: z
        .instanceof(File)
        .refine((file) => file.size > 0, 'Profile photo is required')
        .optional(),
})
export type CreatePatientFormData = z.infer<typeof createPatientSchema>

/** Update patient form schema (all fields optional) */
export const updatePatientSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').optional(),
    contactNumber: z.string().min(10, 'Contact number must be at least 10 digits').optional(),
    address: z.string().optional(),
})
export type UpdatePatientFormData = z.infer<typeof updatePatientSchema>
