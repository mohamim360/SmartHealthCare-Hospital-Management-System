import { useState, useCallback, useMemo } from 'react'

interface UsePaginationOptions {
    /** Total number of items */
    total: number
    /** Number of items per page (default: 10) */
    pageSize?: number
    /** Initial page number (default: 1) */
    initialPage?: number
}

interface UsePaginationReturn {
    /** Current page number (1-based) */
    page: number
    /** Items per page */
    limit: number
    /** Total number of pages */
    totalPages: number
    /** Whether a previous page exists */
    hasPrevious: boolean
    /** Whether a next page exists */
    hasNext: boolean
    /** Go to next page */
    nextPage: () => void
    /** Go to previous page */
    previousPage: () => void
    /** Go to a specific page */
    goToPage: (page: number) => void
    /** Reset to first page */
    resetPage: () => void
    /** Offset for skip-based queries */
    offset: number
}

/**
 * Pagination state management hook.
 * Provides page navigation and computes skip offsets for API calls.
 */
export function usePagination({
    total,
    pageSize = 10,
    initialPage = 1,
}: UsePaginationOptions): UsePaginationReturn {
    const [page, setPage] = useState(initialPage)

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(total / pageSize)),
        [total, pageSize],
    )

    const hasPrevious = page > 1
    const hasNext = page < totalPages

    const nextPage = useCallback(() => {
        setPage((p) => Math.min(p + 1, totalPages))
    }, [totalPages])

    const previousPage = useCallback(() => {
        setPage((p) => Math.max(p - 1, 1))
    }, [])

    const goToPage = useCallback(
        (target: number) => {
            setPage(Math.max(1, Math.min(target, totalPages)))
        },
        [totalPages],
    )

    const resetPage = useCallback(() => {
        setPage(1)
    }, [])

    const offset = (page - 1) * pageSize

    return {
        page,
        limit: pageSize,
        totalPages,
        hasPrevious,
        hasNext,
        nextPage,
        previousPage,
        goToPage,
        resetPage,
        offset,
    }
}
