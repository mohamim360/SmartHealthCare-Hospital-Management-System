

import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { MapPin, Briefcase, Star, Phone, Mail, Award, Calendar, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'

export const Route = createFileRoute('/doctor/$id')({
    component: DoctorDetailPage,
})

function DoctorDetailPage() {
    const { id } = Route.useParams()
    const [doctor, setDoctor] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        api.get(`/api/doctor/${id}`).then((res) => {
            if (res.success) {
                setDoctor(res.data)
            } else {
                setError(res.message || 'Doctor not found')
            }
            setLoading(false)
        })
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <PublicNavbar />
                <div className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-6 w-full">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                </div>
                <PublicFooter />
            </div>
        )
    }

    if (error || !doctor) {
        return (
            <div className="min-h-screen flex flex-col">
                <PublicNavbar />
                <div className="flex-1 max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
                    <h1 className="text-2xl font-bold">Doctor not found</h1>
                    <p className="text-muted-foreground">{error}</p>
                    <Button asChild variant="outline">
                        <Link to="/consultation">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Doctors
                        </Link>
                    </Button>
                </div>
                <PublicFooter />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavbar />
            <div className="flex-1">
                <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
                    {/* Back button */}
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/consultation">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            All Doctors
                        </Link>
                    </Button>

                    {/* Profile Header */}
                    <Card className="border-2">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                                        {doctor.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <h1 className="text-3xl font-bold">{doctor.name}</h1>
                                        <p className="text-lg text-primary font-medium">{doctor.designation}</p>
                                        <p className="text-muted-foreground">{doctor.qualification}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">
                                            <Briefcase className="h-3 w-3 mr-1" />
                                            {doctor.experience} years experience
                                        </Badge>
                                        <Badge variant="secondary">
                                            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                            {doctor.averageRating?.toFixed(1) ?? '—'} rating
                                        </Badge>
                                        <Badge variant="secondary">{doctor.gender}</Badge>
                                        <Badge variant="secondary">
                                            <Award className="h-3 w-3 mr-1" />
                                            Reg: {doctor.registrationNumber}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Consultation Fee</p>
                                        <p className="text-3xl font-bold text-primary">৳{doctor.appointmentFee}</p>
                                    </div>
                                    <Button size="lg" className="w-full" asChild>
                                        <Link to="/dashboard/patient/book-appointment">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Book Appointment
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact & Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{doctor.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{doctor.contactNumber}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{doctor.address}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Professional Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Current Workplace</span>
                                    <span className="font-medium">{doctor.currentWorkingPlace}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Registration #</span>
                                    <span className="font-medium">{doctor.registrationNumber}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Joined</span>
                                    <span className="font-medium">{new Date(doctor.createdAt).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Schedule Information */}
                    {doctor.doctorSchedules && doctor.doctorSchedules.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Available Schedules ({doctor.doctorSchedules.filter((ds: any) => !ds.isBooked).length} open)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {doctor.doctorSchedules.filter((ds: any) => !ds.isBooked).slice(0, 8).map((ds: any) => (
                                        <Badge key={ds.scheduleId} variant="outline" className="justify-center py-2">
                                            Available
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            <PublicFooter />
        </div>
    )
}
