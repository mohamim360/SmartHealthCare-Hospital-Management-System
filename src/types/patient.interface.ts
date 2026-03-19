/**
 * Patient domain types.
 */

import type { BloodGroup, Gender, MaritalStatus } from './common'

export interface IPatient {
    id: string
    email: string
    name: string
    profilePhoto?: string | null
    contactNumber: string
    address: string
    isDeleted: boolean
    createdAt: string
    updatedAt: string
    patientHealthData?: IPatientHealthData
    medicalReport?: IMedicalReport[]
}

/** Detailed patient health information */
export interface IPatientHealthData {
    id: string
    patientId: string
    gender: Gender
    dateOfBirth: string
    bloodGroup: BloodGroup
    hasAllergies?: boolean
    hasDiabetes?: boolean
    height: string
    weight: string
    smokingStatus?: boolean
    dietaryPreferences?: string
    pregnancyStatus?: boolean
    mentalHealthHistory?: string
    immunizationStatus?: string
    hasPastSurgeries?: boolean
    recentAnxiety?: boolean
    recentDepression?: boolean
    maritalStatus?: MaritalStatus
    createdAt: string
    updatedAt: string
}

/** Uploaded medical report/document */
export interface IMedicalReport {
    id: string
    patientId: string
    reportName: string
    reportLink: string
    createdAt: string
    updatedAt: string
}
