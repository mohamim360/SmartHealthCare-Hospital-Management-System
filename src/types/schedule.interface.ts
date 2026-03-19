/**
 * Schedule domain types.
 */

export interface ISchedule {
    id: string
    startDateTime: string
    endDateTime: string
    createdAt: string
    updatedAt: string
}

/** Form data for creating a new schedule block */
export interface IScheduleFormData {
    startDate: string
    endDate: string
    startTime: string
    endTime: string
}

/** Doctor ↔ Schedule junction, indicating booking status */
export interface IDoctorSchedule {
    scheduleId: string
    doctorId: string
    isBooked: boolean
    appointmentId?: string
    createdAt: string
    updatedAt: string
    schedule?: ISchedule
}
