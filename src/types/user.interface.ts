/**
 * User domain types.
 */

import type { UserRole, UserStatus } from './common'
import type { IAdmin } from './admin.interface'
import type { IDoctor } from './doctor.interface'
import type { IPatient } from './patient.interface'

/** Authenticated user profile */
export interface UserInfo {
    id: string
    name: string
    email: string
    role: UserRole
    needPasswordChange: boolean
    status: UserStatus
    admin?: IAdmin
    patient?: IPatient
    doctor?: IDoctor
    createdAt: string
    updatedAt: string
}
