/**
 * Admin domain types.
 */

export interface IAdmin {
    id: string
    email: string
    name: string
    profilePhoto?: string | null
    contactNumber: string
    isDeleted: boolean
    createdAt: string
    updatedAt: string
}
