/**
 * Doctor domain types.
 */

import type { Gender } from './common'
import type { IDoctorSchedule } from './schedule.interface'
import type { ISpecialty } from './speciality.interface'

export interface IDoctor {
    id: string
    name: string
    email: string
    contactNumber: string
    address?: string
    registrationNumber: string
    experience?: number
    gender: Gender
    appointmentFee: number
    qualification: string
    currentWorkingPlace: string
    designation: string
    profilePhoto?: string | null
    isDeleted?: boolean
    averageRating?: number
    createdAt?: string
    updatedAt?: string
    doctorSpecialties?: IDoctorSpecialty[]
    doctorSchedules?: IDoctorSchedule[]
}

/** Junction table between Doctor and Specialty */
export interface IDoctorSpecialty {
    specialitiesId: string
    specialities?: ISpecialty
}
