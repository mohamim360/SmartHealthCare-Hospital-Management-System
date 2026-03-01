

import { useState, useEffect, useCallback } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Search, Star, MapPin, Briefcase, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks'
import { api, buildQuery } from '@/lib/api'
import { MotionStaggerList, staggerItem } from '@/components/ui/motion'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/consultation')({
    component: ConsultationPage,
})

function ConsultationPage() {
    const [doctors, setDoctors] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const debouncedSearch = useDebounce(search, 400)

    const fetchDoctors = useCallback(async () => {
        setLoading(true)
        const qs = buildQuery({ page, limit: 12, searchTerm: debouncedSearch || undefined })
        const res = await api.get<any[]>(`/api/doctor${qs}`)
        if (res.success) {
            setDoctors(res.data ?? [])
            setTotal(res.meta?.total ?? 0)
        }
        setLoading(false)
    }, [page, debouncedSearch])

    useEffect(() => { fetchDoctors() }, [fetchDoctors])

    const totalPages = Math.ceil(total / 12)

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Find Your Doctor
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Browse our network of {total} qualified healthcare professionals and book an appointment today.
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-lg mx-auto relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, speciality, or designation…"
                        className="pl-12 h-12 text-base rounded-xl border-2 focus:border-primary"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                    />
                </div>

                {/* Doctor Grid */}
                {loading ? (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
                    </div>
                ) : doctors.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <p className="text-lg">No doctors found matching your search.</p>
                    </div>
                ) : (
                    <MotionStaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {doctors.map((d: any) => (
                            <motion.div key={d.id} variants={staggerItem}>
                                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {d.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-base truncate">{d.name}</h3>
                                                <p className="text-sm text-primary font-medium">{d.designation}</p>
                                                <p className="text-xs text-muted-foreground">{d.qualification}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                <Briefcase className="h-3 w-3 mr-1" />
                                                {d.experience} yrs exp
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                                {d.averageRating?.toFixed(1) ?? '—'}
                                            </Badge>
                                            {d.currentWorkingPlace && (
                                                <Badge variant="outline" className="text-xs">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {d.currentWorkingPlace}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Consultation Fee</p>
                                                <p className="font-bold text-primary text-lg">৳{d.appointmentFee}</p>
                                            </div>
                                            <Button size="sm" asChild className="group-hover:shadow-md transition-shadow">
                                                <Link to="/doctor/$id" params={{ id: d.id }}>
                                                    View Profile
                                                    <ArrowRight className="h-3 w-3 ml-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </MotionStaggerList>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                        <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                        <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
