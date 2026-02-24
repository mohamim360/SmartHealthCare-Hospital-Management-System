import { z } from 'zod'

/** Create speciality form schema */
export const createSpecialitySchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    icon: z
        .instanceof(File)
        .refine((file) => file.size > 0, 'Icon image is required')
        .optional(),
})
export type CreateSpecialityFormData = z.infer<typeof createSpecialitySchema>
