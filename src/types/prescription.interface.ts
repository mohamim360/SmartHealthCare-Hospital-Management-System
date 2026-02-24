/**
 * Prescription domain types.
 */

import type { IAppointment } from './appointment.interface'
import type { IDoctor } from './doctor.interface'
import type { IPatient } from './patient.interface'

export interface IPrescription {
    id: string
    appointmentId: string
    appointment?: IAppointment
    doctorId: string
    doctor?: IDoctor
    patientId: string
    patient?: IPatient
    instructions: string
    followUpDate?: string | null
    createdAt: string
    updatedAt: string
}

/** Data required to create a new prescription */
export interface IPrescriptionFormData {
    appointmentId: string
    instructions: string
    followUpDate?: string
}
