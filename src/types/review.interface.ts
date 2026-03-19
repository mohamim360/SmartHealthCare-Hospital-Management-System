/**
 * Review domain types.
 */

import type { IAppointment } from './appointment.interface'
import type { IDoctor } from './doctor.interface'
import type { IPatient } from './patient.interface'

export interface IReview {
    id: string
    patientId: string
    patient?: IPatient
    doctorId: string
    doctor?: IDoctor
    appointmentId: string
    appointment?: IAppointment
    rating: number
    comment: string
    createdAt: string
    updatedAt: string
}

/** Data required to submit a new review */
export interface IReviewFormData {
    appointmentId: string
    doctorId?: string
    rating: number
    comment: string
}
