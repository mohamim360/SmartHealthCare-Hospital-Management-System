import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { SlidersHorizontal, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { MotionStaggerList, staggerItem } from '@/components/ui/motion'
import { motion } from 'framer-motion'
import { useDoctorFilter } from '@/hooks/useDoctorFilter'
import { DoctorSearchBar } from '@/components/consultation/DoctorSearchBar'
import { DoctorFilterSidebar } from '@/components/consultation/DoctorFilterSidebar'
import { DoctorCard } from '@/components/consultation/DoctorCard'
import { DoctorGridSkeleton } from '@/components/consultation/DoctorGridSkeleton'
import { EmptyDoctorState } from '@/components/consultation/EmptyDoctorState'

export const Route = createFileRoute('/consultation')({
    component: ConsultationPage,
    head: () => ({
        meta: [
            { title: 'Find a Doctor — Smart Health Care' },
            { name: 'description', content: 'Browse our network of qualified healthcare professionals. Filter by specialty, experience, rating, and more.' },
        ],
    }),
})

function ConsultationPage() {
    const {
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
    } = useDoctorFilter(12)

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavbar />

            <div className="flex-1 bg-gradient-to-br from-background via-primary/5 to-background">
                <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Find Your Doctor
                        </h1>
                        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                            Browse our network of {total > 0 ? total : ''} qualified healthcare professionals and book an appointment today.
                        </p>
                    </div>

                    {/* Search bar + mobile filter toggle */}
                    <div className="flex gap-3 items-start">
                        <div className="flex-1">
                            <DoctorSearchBar
                                searchTerm={filters.searchTerm}
                                sortBy={filters.sortBy}
                                sortOrder={filters.sortOrder}
                                onSearchChange={(v) => setFilter('searchTerm', v)}
                                onSortChange={(sb, so) => {
                                    setFilter('sortBy', sb)
                                    setFilter('sortOrder', so)
                                }}
                            />
                        </div>
                        {/* Mobile filter toggle */}
                        <Button
                            variant="outline"
                            size="default"
                            className="lg:hidden h-11 shrink-0 relative"
                            onClick={() => setMobileFiltersOpen(true)}
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {/* Main content: sidebar + grid */}
                    <div className="flex gap-6">
                        {/* Desktop sidebar */}
                        <div className="hidden lg:block w-64 shrink-0">
                            <div className="sticky top-20">
                                <DoctorFilterSidebar
                                    filters={filters}
                                    setFilter={setFilter}
                                    resetFilters={resetFilters}
                                    activeFilterCount={activeFilterCount}
                                />
                            </div>
                        </div>

                        {/* Doctor grid */}
                        <div className="flex-1 min-w-0">
                            {/* Results count */}
                            {!isLoading && (
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-muted-foreground">
                                        {total > 0 ? (
                                            <>Showing <span className="font-medium text-foreground">{doctors.length}</span> of <span className="font-medium text-foreground">{total}</span> doctors</>
                                        ) : (
                                            'No results'
                                        )}
                                    </p>
                                    {activeFilterCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs h-7"
                                            onClick={resetFilters}
                                        >
                                            Clear filters ({activeFilterCount})
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Error state */}
                            {error && (
                                <div className="flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Loading skeleton */}
                            {isLoading ? (
                                <DoctorGridSkeleton count={6} />
                            ) : doctors.length === 0 ? (
                                <EmptyDoctorState
                                    hasFilters={activeFilterCount > 0 || !!filters.searchTerm}
                                    onResetFilters={resetFilters}
                                />
                            ) : (
                                <MotionStaggerList className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                                    {doctors.map((d: any) => (
                                        <motion.div key={d.id} variants={staggerItem}>
                                            <DoctorCard doctor={d} />
                                        </motion.div>
                                    ))}
                                </MotionStaggerList>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1}
                                        onClick={() => setPage(page - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                                            // Show pages around current page
                                            let pageNum: number
                                            if (totalPages <= 5) {
                                                pageNum = i + 1
                                            } else if (page <= 3) {
                                                pageNum = i + 1
                                            } else if (page >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i
                                            } else {
                                                pageNum = page - 2 + i
                                            }
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={page === pageNum ? 'default' : 'ghost'}
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => setPage(pageNum)}
                                                >
                                                    {pageNum}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(page + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile filter overlay */}
            {mobileFiltersOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        onClick={() => setMobileFiltersOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] lg:hidden animate-in slide-in-from-left duration-300">
                        <DoctorFilterSidebar
                            filters={filters}
                            setFilter={setFilter}
                            resetFilters={resetFilters}
                            activeFilterCount={activeFilterCount}
                            isMobile
                            onClose={() => setMobileFiltersOpen(false)}
                        />
                    </div>
                </>
            )}

            <PublicFooter />
        </div>
    )
}
