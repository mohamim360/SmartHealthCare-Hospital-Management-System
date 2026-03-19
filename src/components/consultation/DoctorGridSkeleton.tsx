import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface DoctorGridSkeletonProps {
    count?: number
}

function DoctorCardSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                    <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-2/3" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex gap-1.5">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-md" />
                </div>
            </CardContent>
        </Card>
    )
}

export function DoctorGridSkeleton({ count = 6 }: DoctorGridSkeletonProps) {
    return (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <DoctorCardSkeleton key={i} />
            ))}
        </div>
    )
}
