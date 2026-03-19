import { SearchX, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyDoctorStateProps {
    hasFilters: boolean
    onResetFilters: () => void
}

export function EmptyDoctorState({ hasFilters, onResetFilters }: EmptyDoctorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mb-6">
                <SearchX className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Doctors Found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
                {hasFilters
                    ? "We couldn't find any doctors matching your filter criteria. Try adjusting or clearing your filters."
                    : 'No doctors are available at the moment. Please check back later.'}
            </p>
            {hasFilters && (
                <Button variant="outline" onClick={onResetFilters}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear All Filters
                </Button>
            )}
        </div>
    )
}
