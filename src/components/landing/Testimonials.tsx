import { Star, MessageCircle, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { MotionStaggerList, staggerItem } from '@/components/ui/motion'
import { motion } from 'framer-motion'
import type { LandingPageData } from '@/lib/landing/landing.service'

interface TestimonialsProps {
    testimonials: LandingPageData['testimonials'] | null
    isLoading: boolean
}

function TestimonialSkeleton() {
    return (
        <Card className="h-full">
            <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-4 rounded" />
                    ))}
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-3 pt-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating
                            ? 'fill-warning text-warning'
                            : 'text-muted-foreground/30'
                        }`}
                />
            ))}
        </div>
    )
}

export function Testimonials({ testimonials, isLoading }: TestimonialsProps) {
    return (
        <section className="py-20 bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                        <MessageCircle className="h-4 w-4" />
                        <span>Patient Feedback</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">What Our Patients Say</h2>
                    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                        Real experiences from patients who trust Smart Health Care.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <TestimonialSkeleton key={i} />
                        ))}
                    </div>
                ) : testimonials && testimonials.length > 0 ? (
                    <MotionStaggerList className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {testimonials.slice(0, 6).map((review) => (
                            <motion.div key={review.id} variants={staggerItem}>
                                <Card className="h-full transition-shadow hover:shadow-md relative">
                                    <CardContent className="pt-6 space-y-4">
                                        <Quote className="h-8 w-8 text-primary/15 absolute top-4 right-4" />

                                        <StarRating rating={review.rating} />

                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                                            "{review.comment}"
                                        </p>

                                        <div className="flex items-center gap-3 pt-2 border-t">
                                            <Avatar className="h-10 w-10">
                                                {review.patient.profilePhoto ? (
                                                    <AvatarImage
                                                        src={review.patient.profilePhoto}
                                                        alt={review.patient.name}
                                                    />
                                                ) : null}
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                    {review.patient.name
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .join('')
                                                        .slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {review.patient.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    Patient of Dr. {review.doctor.name}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </MotionStaggerList>
                ) : (
                    <div className="text-center py-12">
                        <MessageCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                        <p className="text-muted-foreground">No patient reviews yet.</p>
                    </div>
                )}
            </div>
        </section>
    )
}
