import { Link } from '@tanstack/react-router'
import { Star, MapPin, Briefcase, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface DoctorCardProps {
    doctor: {
        id: string
        name: string
        profilePhoto?: string | null
        designation: string
        qualification: string
        experience: number
        averageRating: number
        appointmentFee: number
        currentWorkingPlace?: string
        gender?: string
    }
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
}

export function DoctorCard({ doctor }: DoctorCardProps) {
    return (
        <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border hover:border-primary/30">
            <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 ring-2 ring-primary/20 shrink-0">
                        {doctor.profilePhoto ? (
                            <AvatarImage src={doctor.profilePhoto} alt={doctor.name} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {getInitials(doctor.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">{doctor.name}</h3>
                        <p className="text-sm text-primary font-medium">{doctor.designation}</p>
                        <p className="text-xs text-muted-foreground truncate">{doctor.qualification}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {doctor.experience} yrs
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {doctor.averageRating > 0 ? doctor.averageRating.toFixed(1) : 'New'}
                    </Badge>
                    {doctor.currentWorkingPlace && (
                        <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[100px]">{doctor.currentWorkingPlace}</span>
                        </Badge>
                    )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                        <p className="text-xs text-muted-foreground">Consultation Fee</p>
                        <p className="font-bold text-primary text-lg">${doctor.appointmentFee}</p>
                    </div>
                    <Button size="sm" asChild className="group-hover:shadow-md transition-shadow">
                        <Link to="/doctor/$id" params={{ id: doctor.id }}>
                            View Profile
                            <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
