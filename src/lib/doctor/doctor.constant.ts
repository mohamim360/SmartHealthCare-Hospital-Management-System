export const doctorSearchableFields = ['name', 'email', 'address', 'qualification', 'designation'] as const

export const doctorFilterableFields = ['email', 'gender', 'designation'] as const

export const doctorSortableFields = [
    'createdAt',
    'updatedAt',
    'name',
    'email',
    'appointmentFee',
    'experience',
    'averageRating',
] as const
