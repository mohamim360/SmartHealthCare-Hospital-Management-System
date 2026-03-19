import { Skeleton } from '@/components/ui/skeleton'
import type { LandingPageData } from '@/lib/landing/landing.service'

interface LandingStatsProps {
    stats: LandingPageData['stats'] | null
    isLoading: boolean
}

function formatNumber(n: number): string {
    if (n >= 1000) {
        return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k+`
    }
    return `${n}+`
}

export function LandingStats({ stats, isLoading }: LandingStatsProps) {
    if (isLoading) {
        return (
            <div className="flex gap-8 pt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                        <Skeleton className="h-7 w-16" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        )
    }

    if (!stats) return null

    const items = [
        {
            value: formatNumber(stats.doctorCount),
            label: 'Qualified Doctors',
        },
        {
            value: formatNumber(stats.patientCount),
            label: 'Happy Patients',
        },
        {
            value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—',
            label: 'User Rating',
        },
    ]

    return (
        <div className="flex gap-8 pt-4">
            {items.map((item) => (
                <div key={item.label}>
                    <p className="text-2xl font-bold text-primary">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
            ))}
        </div>
    )
}
