/**
 * Appointment domain types.
 */

import type { AppointmentStatus, PaymentStatus } from './common'
import type { IDoctor } from './doctor.interface'
import type { IPatient } from './patient.interface'
import type { IPrescription } from './prescription.interface'
import type { IReview } from './review.interface'
import type { ISchedule } from './schedule.interface'

export interface IAppointment {
    id: string
    patientId: string
    patient?: IPatient
    doctorId: string
    doctor?: IDoctor
    scheduleId: string
    schedule?: ISchedule
    videoCallingId: string
    status: AppointmentStatus
    paymentStatus: PaymentStatus
    createdAt: string
    updatedAt: string
    prescription?: IPrescription
    review?: IReview
}

/** Payment record linked to an appointment */
export interface IPayment {
    id: string
    appointmentId: string
    amount: number
    transactionId: string
    status: PaymentStatus
    paymentGatewayData?: Record<string, unknown>
    stripeEventId?: string
    createdAt: string
    updatedAt: string
}

/** Data required to book a new appointment */
export interface IAppointmentFormData {
    doctorId: string
    scheduleId: string
}
