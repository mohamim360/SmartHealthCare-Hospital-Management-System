import { useState, useEffect } from 'react'
import { X, SlidersHorizontal, RotateCcw, Stethoscope, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type { DoctorFilters } from '@/hooks/useDoctorFilter'

interface DoctorFilterSidebarProps {
    filters: DoctorFilters
    setFilter: <K extends keyof DoctorFilters>(key: K, value: DoctorFilters[K]) => void
    resetFilters: () => void
    activeFilterCount: number
    className?: string
    onClose?: () => void
    isMobile?: boolean
}

const experiencePresets = [
    { label: 'Any', min: '', max: '' },
    { label: '1–5 yrs', min: '1', max: '5' },
    { label: '5–10 yrs', min: '5', max: '10' },
    { label: '10+ yrs', min: '10', max: '' },
]

const ratingPresets = [
    { label: 'Any', value: '' },
    { label: '4+ ★', value: '4' },
    { label: '3+ ★', value: '3' },
    { label: '2+ ★', value: '2' },
]

const availabilityOptions = [
    { label: 'Anytime', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'thisWeek' },
]

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
            </Label>
            {children}
        </div>
    )
}

function PresetButtons({
    options,
    value,
    onChange,
}: {
    options: { label: string; value: string }[]
    value: string
    onChange: (val: string) => void
}) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map((opt) => (
                <Button
                    key={opt.label}
                    type="button"
                    variant={value === opt.value ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => onChange(opt.value)}
                >
                    {opt.label}
                </Button>
            ))}
        </div>
    )
}

export function DoctorFilterSidebar({
    filters,
    setFilter,
    resetFilters,
    activeFilterCount,
    className,
    onClose,
    isMobile,
}: DoctorFilterSidebarProps) {
    const [specializations, setSpecializations] = useState<string[]>([])

    useEffect(() => {
        api.get<string[]>('/api/doctor/specializations').then((res) => {
            if (res.success && res.data) {
                setSpecializations(res.data)
            }
        })
    }, [])

    return (
        <aside
            className={cn(
                'space-y-5 p-5 bg-card rounded-xl border',
                isMobile && 'h-full overflow-y-auto',
                className,
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Filters</span>
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                            {activeFilterCount}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground"
                            onClick={resetFilters}
                        >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Clear
                        </Button>
                    )}
                    {isMobile && onClose && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Specialization dropdown */}
            <FilterSection title="Specialization">
                <div className="relative">
                    <Stethoscope className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <select
                        value={filters.designation}
                        onChange={(e) => setFilter('designation', e.target.value)}
                        className="w-full h-9 pl-8 pr-8 text-sm rounded-lg border bg-background appearance-none cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
                        aria-label="Filter by specialization"
                    >
                        <option value="">All Specializations</option>
                        {specializations.map((spec) => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
            </FilterSection>

            {/* Gender */}
            <FilterSection title="Gender">
                <PresetButtons
                    options={[
                        { label: 'All', value: '' },
                        { label: 'Male', value: 'MALE' },
                        { label: 'Female', value: 'FEMALE' },
                    ]}
                    value={filters.gender}
                    onChange={(v) => setFilter('gender', v)}
                />
            </FilterSection>

            {/* Experience */}
            <FilterSection title="Experience">
                <div className="flex flex-wrap gap-1.5">
                    {experiencePresets.map((preset) => {
                        const isActive =
                            filters.minExperience === preset.min && filters.maxExperience === preset.max
                        return (
                            <Button
                                key={preset.label}
                                type="button"
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 text-xs px-2.5"
                                onClick={() => {
                                    setFilter('minExperience', preset.min)
                                    setFilter('maxExperience', preset.max)
                                }}
                            >
                                {preset.label}
                            </Button>
                        )
                    })}
                </div>
            </FilterSection>

            {/* Fee Range */}
            <FilterSection title="Consultation Fee ($)">
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        className="h-8 text-xs"
                        value={filters.minFee}
                        onChange={(e) => setFilter('minFee', e.target.value)}
                    />
                    <span className="text-muted-foreground text-xs shrink-0">to</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        className="h-8 text-xs"
                        value={filters.maxFee}
                        onChange={(e) => setFilter('maxFee', e.target.value)}
                    />
                </div>
            </FilterSection>

            {/* Rating */}
            <FilterSection title="Minimum Rating">
                <PresetButtons
                    options={ratingPresets}
                    value={filters.minRating}
                    onChange={(v) => setFilter('minRating', v)}
                />
            </FilterSection>

            {/* Availability */}
            <FilterSection title="Availability">
                <PresetButtons
                    options={availabilityOptions}
                    value={filters.availability}
                    onChange={(v) => setFilter('availability', v)}
                />
            </FilterSection>
        </aside>
    )
}
