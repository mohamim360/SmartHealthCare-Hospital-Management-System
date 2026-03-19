import { z } from 'zod'

/** Create doctor form schema */
export const createDoctorSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.email('Invalid email address'),
    contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
    address: z.string().optional(),
    registrationNumber: z.string().min(3, 'Registration number must be at least 3 characters'),
    experience: z.number().positive('Experience must be greater than 0'),
    gender: z.enum(['MALE', 'FEMALE'], { message: "Gender must be 'MALE' or 'FEMALE'" }),
    appointmentFee: z.number().positive('Appointment fee must be greater than 0'),
    qualification: z.string().min(3, 'Qualification must be at least 3 characters'),
    currentWorkingPlace: z.string().min(3, 'Current working place must be at least 3 characters'),
    designation: z.string().min(2, 'Designation must be at least 2 characters'),
    specialties: z
        .array(z.string().uuid('Each specialty must be a valid UUID'))
        .min(1, 'At least one specialty is required'),
    profilePhoto: z
        .instanceof(File)
        .refine((file) => file.size > 0, 'Profile photo is required')
        .optional(),
})
export type CreateDoctorFormData = z.infer<typeof createDoctorSchema>

/** Update doctor form schema (all fields optional) */
export const updateDoctorSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').optional(),
    profilePhoto: z.string().optional(),
    contactNumber: z.string().min(10, 'Contact number must be at least 10 digits').optional(),
    address: z.string().optional(),
    registrationNumber: z
        .string()
        .min(3, 'Registration number must be at least 3 characters')
        .optional(),
    experience: z.number().min(0, 'Experience cannot be negative').optional(),
    gender: z.enum(['MALE', 'FEMALE'], { message: "Gender must be 'MALE' or 'FEMALE'" }).optional(),
    appointmentFee: z.number().min(0, 'Appointment fee cannot be negative').optional(),
    qualification: z.string().min(3, 'Qualification must be at least 3 characters').optional(),
    currentWorkingPlace: z
        .string()
        .min(3, 'Current working place must be at least 3 characters')
        .optional(),
    designation: z.string().min(2, 'Designation must be at least 2 characters').optional(),
    specialties: z.array(z.string().uuid('Each specialty must be a valid UUID')).optional(),
    removeSpecialties: z.array(z.string().uuid('Each specialty to remove must be a valid UUID')).optional(),
})
export type UpdateDoctorFormData = z.infer<typeof updateDoctorSchema>
