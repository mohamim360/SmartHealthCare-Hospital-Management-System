import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDebounce } from '@/hooks'
import { api, buildQuery } from '@/lib/api'

export interface DoctorFilters {
    searchTerm: string
    gender: string
    designation: string
    minExperience: string
    maxExperience: string
    minFee: string
    maxFee: string
    minRating: string
    availability: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
}

const defaultFilters: DoctorFilters = {
    searchTerm: '',
    gender: '',
    designation: '',
    minExperience: '',
    maxExperience: '',
    minFee: '',
    maxFee: '',
    minRating: '',
    availability: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
}

export function useDoctorFilter(pageSize = 12) {
    const [filters, setFiltersState] = useState<DoctorFilters>(defaultFilters)
    const [page, setPage] = useState(1)
    const [doctors, setDoctors] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const debouncedSearch = useDebounce(filters.searchTerm, 400)

    const setFilter = useCallback(<K extends keyof DoctorFilters>(key: K, value: DoctorFilters[K]) => {
        setFiltersState((prev) => ({ ...prev, [key]: value }))
        setPage(1) // Reset to page 1 on any filter change
    }, [])

    const resetFilters = useCallback(() => {
        setFiltersState(defaultFilters)
        setPage(1)
    }, [])

    const activeFilterCount = useMemo(() => {
        let count = 0
        if (filters.gender) count++
        if (filters.designation) count++
        if (filters.minExperience) count++
        if (filters.maxExperience) count++
        if (filters.minFee) count++
        if (filters.maxFee) count++
        if (filters.minRating) count++
        if (filters.availability) count++
        return count
    }, [filters])

    const totalPages = Math.ceil(total / pageSize)

    const fetchDoctors = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        const params: Record<string, string | number | undefined> = {
            page,
            limit: pageSize,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
            searchTerm: debouncedSearch || undefined,
            gender: filters.gender || undefined,
            designation: filters.designation || undefined,
            minExperience: filters.minExperience || undefined,
            maxExperience: filters.maxExperience || undefined,
            minFee: filters.minFee || undefined,
            maxFee: filters.maxFee || undefined,
            minRating: filters.minRating || undefined,
            availability: filters.availability || undefined,
        }

        const qs = buildQuery(params)
        try {
            const res = await api.get<any[]>(`/api/doctor${qs}`)
            if (res.success) {
                setDoctors(res.data ?? [])
                setTotal(res.meta?.total ?? 0)
            } else {
                setError(res.message || 'Failed to load doctors')
            }
        } catch {
            setError('Failed to connect to server')
        } finally {
            setIsLoading(false)
        }
    }, [page, pageSize, debouncedSearch, filters.sortBy, filters.sortOrder, filters.gender, filters.designation, filters.minExperience, filters.maxExperience, filters.minFee, filters.maxFee, filters.minRating, filters.availability])

    useEffect(() => {
        fetchDoctors()
    }, [fetchDoctors])

    return {
        doctors,
        total,
        isLoading,
        error,
        filters,
        setFilter,
        resetFilters,
        activeFilterCount,
        page,
        setPage,
        totalPages,
    }
}
