/**
 * Common enums and utility types used across the application.
 */

/** User role within the health care system */
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'PATIENT'

/** Account status */
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'DELETED'

/** Gender options */
export type Gender = 'MALE' | 'FEMALE'

/** Blood group enum */
export type BloodGroup =
    | 'A_POSITIVE'
    | 'A_NEGATIVE'
    | 'B_POSITIVE'
    | 'B_NEGATIVE'
    | 'AB_POSITIVE'
    | 'AB_NEGATIVE'
    | 'O_POSITIVE'
    | 'O_NEGATIVE'

/** Marital status */
export type MaritalStatus = 'MARRIED' | 'UNMARRIED'

/** Appointment lifecycle status */
export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    INPROGRESS = 'INPROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED',
}

/** Payment status */
export enum PaymentStatus {
    PAID = 'PAID',
    UNPAID = 'UNPAID',
}

/** Standard paginated API response shape */
export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

/** Standard API success response */
export interface ApiResponse<T = unknown> {
    success: boolean
    message: string
    data: T
}
