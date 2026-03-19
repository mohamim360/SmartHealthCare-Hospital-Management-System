import { Search, X, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { DoctorFilters } from '@/hooks/useDoctorFilter'

interface DoctorSearchBarProps {
    searchTerm: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
    onSearchChange: (value: string) => void
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

const sortOptions = [
    { label: 'Newest', sortBy: 'createdAt', sortOrder: 'desc' as const },
    { label: 'Rating: High → Low', sortBy: 'averageRating', sortOrder: 'desc' as const },
    { label: 'Fee: Low → High', sortBy: 'appointmentFee', sortOrder: 'asc' as const },
    { label: 'Fee: High → Low', sortBy: 'appointmentFee', sortOrder: 'desc' as const },
    { label: 'Experience', sortBy: 'experience', sortOrder: 'desc' as const },
    { label: 'Name A–Z', sortBy: 'name', sortOrder: 'asc' as const },
]

export function DoctorSearchBar({
    searchTerm,
    sortBy,
    sortOrder,
    onSearchChange,
    onSortChange,
}: DoctorSearchBarProps) {
    const currentSort = sortOptions.find(
        (o) => o.sortBy === sortBy && o.sortOrder === sortOrder,
    ) ?? sortOptions[0]

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name, specialization, or keyword…"
                    className="pl-10 pr-9 h-11 text-sm rounded-lg border-2 focus:border-primary transition-colors"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchTerm && (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => onSearchChange('')}
                        aria-label="Clear search"
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
                <select
                    value={`${currentSort.sortBy}:${currentSort.sortOrder}`}
                    onChange={(e) => {
                        const [sb, so] = e.target.value.split(':')
                        onSortChange(sb, so as 'asc' | 'desc')
                    }}
                    className="h-11 pl-9 pr-4 text-sm rounded-lg border-2 bg-background appearance-none cursor-pointer focus:border-primary outline-none transition-colors min-w-[160px]"
                    aria-label="Sort doctors by"
                >
                    {sortOptions.map((opt) => (
                        <option key={`${opt.sortBy}:${opt.sortOrder}`} value={`${opt.sortBy}:${opt.sortOrder}`}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
        </div>
    )
}
