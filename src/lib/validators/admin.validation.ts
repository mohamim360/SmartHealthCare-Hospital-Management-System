import { z } from 'zod'

/** Create admin form schema */
export const createAdminSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Valid email is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    profilePhoto: z
        .instanceof(File)
        .refine((file) => file.size > 0, 'Profile photo is required')
        .optional(),
})
export type CreateAdminFormData = z.infer<typeof createAdminSchema>

/** Update admin form schema */
export const updateAdminSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
})
export type UpdateAdminFormData = z.infer<typeof updateAdminSchema>
