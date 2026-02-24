import { z } from 'zod'

/** Create review form schema */
export const createReviewSchema = z.object({
    appointmentId: z.string().uuid('Appointment ID must be a valid UUID'),
    rating: z
        .number()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5'),
    comment: z.string().min(10, 'Comment must be at least 10 characters'),
})
export type CreateReviewFormData = z.infer<typeof createReviewSchema>
