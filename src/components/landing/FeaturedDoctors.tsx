import { Star, Stethoscope, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { MotionStaggerList, staggerItem } from '@/components/ui/motion'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import type { LandingPageData } from '@/lib/landing/landing.service'

interface FeaturedDoctorsProps {
    doctors: LandingPageData['featuredDoctors'] | null
    isLoading: boolean
}

function DoctorCardSkeleton() {
    return (
        <Card className="h-full">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-4 pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </CardContent>
        </Card>
    )
}

export function FeaturedDoctors({ doctors, isLoading }: FeaturedDoctorsProps) {
    return (
        <section className="py-20">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                        <Stethoscope className="h-4 w-4" />
                        <span>Top Rated Professionals</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Featured Doctors</h2>
                    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                        Meet our highest-rated healthcare professionals trusted by patients.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <DoctorCardSkeleton key={i} />
                        ))}
                    </div>
                ) : doctors && doctors.length > 0 ? (
                    <MotionStaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {doctors.map((doctor) => (
                            <motion.div key={doctor.id} variants={staggerItem}>
                                <Link to={`/doctor/${doctor.id}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl">
                                <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
                                    <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
                                        <Avatar className="h-20 w-20 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                                            {doctor.profilePhoto ? (
                                                <AvatarImage src={doctor.profilePhoto} alt={doctor.name} />
                                            ) : null}
                                            <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                                {doctor.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div>
                                            <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{doctor.name}</h3>
                                            <p className="text-sm text-primary font-medium">{doctor.designation}</p>
                                        </div>

                                        <p className="text-xs text-muted-foreground">{doctor.qualification}</p>

                                        <div className="flex items-center gap-4 pt-2 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                                <span className="font-medium">
                                                    {doctor.averageRating > 0 ? doctor.averageRating.toFixed(1) : 'New'}
                                                </span>
                                            </div>
                                            <div className="text-muted-foreground">
                                                {doctor.experience}+ yrs
                                            </div>
                                            <div className="text-primary font-medium">
                                                ${doctor.appointmentFee}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </MotionStaggerList>
                ) : (
                    <div className="text-center py-12">
                        <User className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                        <p className="text-muted-foreground">No featured doctors available yet.</p>
                    </div>
                )}
            </div>
        </section>
    )
}
