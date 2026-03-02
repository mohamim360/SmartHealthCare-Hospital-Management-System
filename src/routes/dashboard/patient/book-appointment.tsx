

import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Stethoscope, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'

export const Route = createFileRoute('/dashboard/patient/book-appointment')({
  component: BookAppointmentPage,
})

function BookAppointmentPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Fetch doctors
  useEffect(() => {
    api.get<any[]>('/api/doctor?limit=50').then((res) => {
      if (res.success) setDoctors(res.data ?? [])
      setLoading(false)
    })
  }, [])

  // Step 2: When doctor selected, fetch their detail with schedules
  const selectDoctor = async (doctor: any) => {
    setError(null)
    setSelectedSchedule(null)
    const res = await api.get(`/api/doctor/${doctor.id}`)
    if (res.success) {
      setSelectedDoctor(res.data)
    }
  }

  // Step 3: Submit appointment
  const handleBooking = async () => {
    if (!selectedDoctor || !selectedSchedule) return

    setSubmitting(true)
    setError(null)

    const res = await api.post('/api/appointment', {
      doctorId: selectedDoctor.id,
      scheduleId: selectedSchedule,
    })

    if (res.success) {
      setSuccess(true)
    } else {
      setError(res.message || 'Failed to book appointment')
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-4">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold">Appointment Booked!</h2>
        <p className="text-muted-foreground">
          Your appointment with {selectedDoctor?.name} has been successfully scheduled.
        </p>
        <Button onClick={() => { setSuccess(false); setSelectedDoctor(null); setSelectedSchedule(null) }}>
          Book Another
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Book Appointment</h1>
          <p className="text-muted-foreground">
            {!selectedDoctor ? 'Step 1: Choose a doctor' : 'Step 2: Choose a time slot'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!selectedDoctor ? (
        /* Doctor Selection */
        loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d: any) => (
              <Card
                key={d.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all"
                onClick={() => selectDoctor(d)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {d.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{d.name}</p>
                      <p className="text-xs text-primary">{d.designation}</p>
                      <p className="text-xs text-muted-foreground">{d.experience} yrs • ⭐ {d.averageRating?.toFixed(1) ?? '—'}</p>
                      <p className="text-sm font-bold text-primary mt-1">৳{d.appointmentFee}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Schedule Selection */
        <div className="space-y-6">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {selectedDoctor.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold">{selectedDoctor.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.designation} • ৳{selectedDoctor.appointmentFee}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedDoctor(null)}>
                  Change Doctor
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-4 w-4" />
                Available Time Slots
              </CardTitle>
              <CardDescription>Select a schedule to book your appointment</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDoctor.doctorSchedules?.filter((ds: any) => !ds.isBooked).length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No available slots for this doctor. Please try another doctor.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedDoctor.doctorSchedules
                    ?.filter((ds: any) => !ds.isBooked && ds.schedule?.startDateTime && new Date(ds.schedule.startDateTime) > new Date())
                    .sort((a: any, b: any) => new Date(a.schedule.startDateTime).getTime() - new Date(b.schedule.startDateTime).getTime())
                    .map((ds: any) => {
                      const start = new Date(ds.schedule.startDateTime)
                      const end = new Date(ds.schedule.endDateTime)
                      const dateStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      const startTime = start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                      const endTime = end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                      return (
                        <Button
                          key={ds.scheduleId}
                          variant={selectedSchedule === ds.scheduleId ? 'default' : 'outline'}
                          className="h-auto py-3"
                          onClick={() => setSelectedSchedule(ds.scheduleId)}
                        >
                          <div className="text-center">
                            <p className="text-xs font-medium">{dateStr}</p>
                            <p className="font-bold text-xs">{startTime} – {endTime}</p>
                          </div>
                        </Button>
                      )
                    })}
                </div>
              )}

              {selectedSchedule && (
                <div className="mt-6 pt-4 border-t">
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                    onClick={handleBooking}
                  >
                    {submitting ? 'Booking…' : 'Confirm Booking'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
