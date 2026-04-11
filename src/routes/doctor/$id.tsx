import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
    MapPin, Briefcase, Star, Phone, Mail, Award, Calendar,
    ArrowLeft, Clock, CheckCircle, MessageSquare, Users,
    GraduationCap, Building2, Hash, CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { DoctorCard } from '@/components/consultation/DoctorCard'

export const Route = createFileRoute('/doctor/$id')({
    component: DoctorDetailPage,
})

function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

function formatScheduleDate(dateStr: string) {
    const d = new Date(dateStr)
    return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    }
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
    const h = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`${h} ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
                />
            ))}
        </div>
    )
}

/* ────────── Stat pill ────────── */
function StatPill({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
            </div>
        </div>
    )
}

/* ────────── Info row ────────── */
function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b last:border-b-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/60">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium truncate">{value}</p>
            </div>
        </div>
    )
}

/* ────────── Loading skeleton ────────── */
function DetailSkeleton() {
    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavbar />
            <div className="flex-1">
                <div className="max-w-5xl mx-auto px-4 py-10 w-full space-y-6">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-44 rounded-2xl" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                    </div>
                    <div className="grid lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 space-y-4">
                            <Skeleton className="h-48 rounded-xl" />
                            <Skeleton className="h-40 rounded-xl" />
                        </div>
                        <div className="lg:col-span-2 space-y-4">
                            <Skeleton className="h-56 rounded-xl" />
                            <Skeleton className="h-32 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}

/* ────────── Error state ────────── */
function ErrorState({ error }: { error: string }) {
    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavbar />
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Users className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold">Doctor Not Found</h1>
                <p className="text-muted-foreground max-w-sm">{error}</p>
                <Button asChild variant="outline">
                    <Link to="/consultation">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Browse Doctors
                    </Link>
                </Button>
            </div>
            <PublicFooter />
        </div>
    )
}

/* ══════════ Main page ══════════ */
function DoctorDetailPage() {
    const { id } = Route.useParams()
    const [doctor, setDoctor] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        api.get(`/api/doctor/${id}`).then((res) => {
            if (res.success) setDoctor(res.data)
            else setError(res.message || 'Doctor not found')
            setLoading(false)
        }).catch(() => {
            setError('Failed to load doctor data')
            setLoading(false)
        })
    }, [id])

    if (loading) return <DetailSkeleton />
    if (error || !doctor) return <ErrorState error={error || 'Doctor not found'} />

    const openSchedules = doctor.doctorSchedules?.filter((ds: any) => !ds.isBooked) ?? []
    const reviews = doctor.reviews ?? []
    const reviewStats = doctor.reviewStats ?? { averageRating: 0, totalReviews: 0 }
    const similarDoctors = doctor.similarDoctors ?? []

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <PublicNavbar />

            <main className="flex-1">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">

                    {/* Back */}
                    <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
                        <Link to="/consultation">
                            <ArrowLeft className="h-4 w-4" />
                            All Doctors
                        </Link>
                    </Button>

                    {/* ═══════ HERO CARD ═══════ */}
                    <Card className="overflow-hidden border shadow-sm">
                        {/* Gradient banner */}
                        <div className="h-32 sm:h-36 bg-gradient-to-br from-primary via-primary/85 to-primary/55 relative">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                        </div>

                        <CardContent className="relative px-5 sm:px-8 pb-7 pt-0">
                            <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 -mt-14 sm:-mt-16">
                                {/* Avatar */}
                                <Avatar className="h-28 w-28 ring-4 ring-background shrink-0 shadow-lg">
                                    {doctor.profilePhoto && <AvatarImage src={doctor.profilePhoto} alt={doctor.name} />}
                                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                                        {getInitials(doctor.name)}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Name & title */}
                                <div className="flex-1 min-w-0 pt-1 sm:pt-4 space-y-2.5">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{doctor.name}</h1>
                                        <p className="text-primary font-semibold text-base">{doctor.designation}</p>
                                        <p className="text-sm text-muted-foreground">{doctor.qualification}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-0 gap-1">
                                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                            {reviewStats.averageRating > 0
                                                ? `${reviewStats.averageRating} (${reviewStats.totalReviews})`
                                                : 'New'}
                                        </Badge>
                                        <Badge variant="secondary" className="gap-1">
                                            <Briefcase className="h-3 w-3" />
                                            {doctor.experience} yrs
                                        </Badge>
                                        <Badge variant="outline" className="gap-1 capitalize">
                                            {doctor.gender?.toLowerCase()}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Fee & CTA */}
                                <div className="shrink-0 lg:pt-4">
                                    <div className="rounded-2xl border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 py-4 flex items-center justify-between gap-4 lg:flex-col lg:items-stretch lg:gap-3 lg:min-w-[220px]">
                                        <div className="text-left lg:text-center">
                                            <p className="text-xs text-muted-foreground font-medium">Consultation Fee</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-primary leading-tight">${doctor.appointmentFee}</p>
                                        </div>
                                        <Button size="lg" className="shadow-md gap-2 whitespace-nowrap" asChild>
                                            <Link to="/dashboard/patient/book-appointment">
                                                <Calendar className="h-4 w-4" />
                                                Book Now
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ═══════ STAT PILLS ═══════ */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatPill icon={Briefcase} label="Experience" value={`${doctor.experience} Years`} />
                        <StatPill icon={Star} label="Rating" value={reviewStats.averageRating > 0 ? `${reviewStats.averageRating}/5` : 'N/A'} />
                        <StatPill icon={MessageSquare} label="Reviews" value={`${reviewStats.totalReviews}`} />
                        <StatPill icon={Calendar} label="Open Slots" value={`${openSchedules.length}`} />
                    </div>

                    {/* ═══════ MAIN CONTENT ═══════ */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        {/* ─── Left: Details + Reviews ─── */}
                        <div className="lg:col-span-3 space-y-6">

                            {/* Info card */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                                            <Users className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        About
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-0">
                                    <InfoRow icon={Mail} label="Email" value={doctor.email} />
                                    <InfoRow icon={Phone} label="Phone" value={doctor.contactNumber} />
                                    <InfoRow icon={MapPin} label="Address" value={doctor.address} />
                                    <InfoRow icon={Building2} label="Workplace" value={doctor.currentWorkingPlace} />
                                    <InfoRow icon={GraduationCap} label="Qualification" value={doctor.qualification} />
                                    <InfoRow icon={Hash} label="Registration" value={doctor.registrationNumber} />
                                    <InfoRow icon={CalendarDays} label="Member Since" value={new Date(doctor.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} />
                                </CardContent>
                            </Card>

                            {/* Reviews */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                                                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            Patient Reviews
                                        </CardTitle>
                                        {reviewStats.totalReviews > 0 && (
                                            <div className="flex items-center gap-2">
                                                <StarRating rating={Math.round(reviewStats.averageRating)} size="md" />
                                                <span className="text-sm font-semibold">{reviewStats.averageRating}</span>
                                                <span className="text-xs text-muted-foreground">({reviewStats.totalReviews})</span>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {reviews.length > 0 ? (
                                        <div className="space-y-3">
                                            {reviews.map((review: any) => (
                                                <div key={review.id} className="rounded-xl border bg-muted/30 p-4">
                                                    <div className="flex items-start gap-3">
                                                        <Avatar className="h-10 w-10 shrink-0">
                                                            {review.patient.profilePhoto && (
                                                                <AvatarImage src={review.patient.profilePhoto} alt={review.patient.name} />
                                                            )}
                                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                                                {getInitials(review.patient.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0 space-y-1.5">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-sm font-semibold">{review.patient.name}</span>
                                                                <span className="text-xs text-muted-foreground shrink-0">
                                                                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                            <StarRating rating={review.rating} />
                                                            {review.comment && (
                                                                <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">
                                                                    {review.comment}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 space-y-2">
                                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                                                <MessageSquare className="h-5 w-5 text-muted-foreground/50" />
                                            </div>
                                            <p className="text-sm text-muted-foreground">No reviews yet</p>
                                            <p className="text-xs text-muted-foreground/70">Be the first to leave a review!</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* ─── Right: Schedule + CTA ─── */}
                        <div className="lg:col-span-2">
                            <div className="lg:sticky lg:top-20 space-y-5">

                                {/* Schedules */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-md bg-emerald-500/10 flex items-center justify-center">
                                                    <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                Available Slots
                                            </CardTitle>
                                            {openSchedules.length > 0 && (
                                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 text-xs">
                                                    {openSchedules.length} open
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {openSchedules.length > 0 ? (
                                            <div className="space-y-2">
                                                {openSchedules.slice(0, 6).map((ds: any) => {
                                                    const start = formatScheduleDate(ds.schedule.startDateTime)
                                                    const end = formatScheduleDate(ds.schedule.endDateTime)
                                                    return (
                                                        <div
                                                            key={ds.schedule.id}
                                                            className="flex items-center gap-3 rounded-lg border bg-background p-3 hover:border-primary/30 transition-colors"
                                                        >
                                                            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                <span className="text-[10px] font-bold uppercase leading-none">{start.day}</span>
                                                                <span className="text-xs font-bold leading-tight">{start.date.split(' ')[1]}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium">{start.date}</p>
                                                                <p className="text-xs text-muted-foreground">{start.time} – {end.time}</p>
                                                            </div>
                                                            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                                                        </div>
                                                    )
                                                })}
                                                {openSchedules.length > 6 && (
                                                    <p className="text-xs text-center text-muted-foreground pt-1">
                                                        +{openSchedules.length - 6} more available
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 space-y-2">
                                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                                                    <Clock className="h-5 w-5 text-muted-foreground/50" />
                                                </div>
                                                <p className="text-sm text-muted-foreground">No upcoming schedules</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Booking CTA */}
                                <Card className="overflow-hidden">
                                    <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground text-center space-y-3">
                                        <Calendar className="h-8 w-8 mx-auto opacity-90" />
                                        <div>
                                            <p className="font-semibold text-sm">Book an Appointment</p>
                                            <p className="text-xs opacity-80">Consultation fee: ${doctor.appointmentFee}</p>
                                        </div>
                                        <Button size="lg" variant="secondary" className="w-full font-semibold shadow-lg" asChild>
                                            <Link to="/dashboard/patient/book-appointment">
                                                Schedule Visit
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* ═══════ SIMILAR DOCTORS ═══════ */}
                    {similarDoctors.length > 0 && (
                        <section className="space-y-4 pt-2 pb-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Similar Doctors
                                </h2>
                                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                                    <Link to="/consultation">View All →</Link>
                                </Button>
                            </div>
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {similarDoctors.map((doc: any) => (
                                    <DoctorCard key={doc.id} doctor={doc} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
