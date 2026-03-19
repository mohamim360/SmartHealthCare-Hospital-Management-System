
/** Data point for bar chart (monthly appointment counts) */
export interface IBarChartData {
    month: Date | string
    count: number
}

/** Data point for pie chart (appointment status distribution) */
export interface IPieChartData {
    status: string
    count: number
}

/** Admin dashboard aggregate metrics */
export interface IAdminDashboardMeta {
    appointmentCount: number
    patientCount: number
    doctorCount: number
    adminCount?: number
    paymentCount: number
    totalRevenue: {
        _sum: {
            amount: number | null
        }
    }
    barChartData: IBarChartData[]
    pieCharData: IPieChartData[]
}

/** Doctor dashboard aggregate metrics */
export interface IDoctorDashboardMeta {
    appointmentCount: number
    patientCount: number
    reviewCount: number
    totalRevenue: {
        _sum: {
            amount: number | null
        }
    }
    formattedAppointmentStatusDistribution: IPieChartData[]
}

/** Patient dashboard aggregate metrics */
export interface IPatientDashboardMeta {
    appointmentCount: number
    prescriptionCount: number
    reviewCount: number
    formattedAppointmentStatusDistribution: IPieChartData[]
}

/** Union of all dashboard meta shapes */
export type IDashboardMeta =
    | IAdminDashboardMeta
    | IDoctorDashboardMeta
    | IPatientDashboardMeta
