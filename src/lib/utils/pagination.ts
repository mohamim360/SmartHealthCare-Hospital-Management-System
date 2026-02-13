export type PaginationOptions = {
    page?: string | number
    limit?: string | number
    sortBy?: string
    sortOrder?: string
}

type PaginationResult = {
    page: number
    limit: number
    skip: number
    sortBy: string
    sortOrder: 'asc' | 'desc'
}

export function calculatePagination(options: PaginationOptions): PaginationResult {
    const page = Number(options.page) || 1
    const limit = Number(options.limit) || 10
    const skip = (page - 1) * limit

    const sortBy = options.sortBy || 'createdAt'
    const sortOrder = (options.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
    }
}

export const paginationHelper = {
    calculatePagination,
}
