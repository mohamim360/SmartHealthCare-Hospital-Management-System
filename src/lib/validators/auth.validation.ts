import { z } from 'zod'

/** Login form schema */
export const loginSchema = z.object({
    email: z.email('Please enter a valid email address'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must be at most 100 characters'),
})
export type LoginFormData = z.infer<typeof loginSchema>
export type TLoginForm = LoginFormData

/** Patient registration form schema */
export const registerPatientSchema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        address: z.string().optional(),
        contactNumber: z.string().optional(),
        email: z.email('Please enter a valid email address'),
        password: z
            .string()
            .min(6, 'Password must be at least 6 characters')
            .max(100, 'Password must be at most 100 characters'),
        confirmPassword: z
            .string()
            .min(6, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })
export type RegisterPatientFormData = z.infer<typeof registerPatientSchema>
export type TRegisterPatientForm = RegisterPatientFormData

/** Forgot password schema */
export const forgotPasswordSchema = z.object({
    email: z.email('Please enter a valid email address'),
})
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

/** Reset password schema */
export const resetPasswordSchema = z
    .object({
        newPassword: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

/** Change password schema (requires old password) */
export const changePasswordSchema = z
    .object({
        oldPassword: z.string().min(6, 'Password must be at least 6 characters'),
        newPassword: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
