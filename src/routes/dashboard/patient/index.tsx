import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Calendar, FileText, Star, Activity } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MotionStaggerList, staggerItem, MotionFadeIn } from '@/components/ui/motion'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'

export const Route = createFileRoute('/dashboard/patient/')({
  component: PatientDashboard,
})

function PatientDashboard() {
  const [meta, setMeta] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/metadata'),
      api.get('/api/appointment?limit=5'),
    ]).then(([metaRes, apptRes]) => {
      if (metaRes.success) setMeta(metaRes.data)
      if (apptRes.success) setAppointments((apptRes.data as any[]) ?? [])
      setLoading(false)
    })
  }, [])

  const stats = meta
    ? [
      { title: 'My Appointments', value: meta.appointmentCount ?? 0, icon: Calendar, description: 'Total booked' },
      { title: 'Prescriptions', value: meta.prescriptionCount ?? 0, icon: FileText, description: 'Received' },
      { title: 'Reviews Given', value: meta.reviewCount ?? 0, icon: Star, description: 'Doctor feedback' },
      { title: 'Active', value: appointments.filter((a: any) => a.status === 'SCHEDULED').length, icon: Activity, description: 'Upcoming appointments' },
    ]
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patient Dashboard</h1>
          <p className="text-muted-foreground">Your health at a glance.</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/patient/book-appointment">Book Appointment</Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <MotionStaggerList className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <motion.div key={stat.title} variants={staggerItem}>
              <StatCard {...stat} />
            </motion.div>
          ))}
        </MotionStaggerList>
      )}

      <MotionFadeIn>
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments yet. Book your first appointment!</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{a.doctor?.name ?? 'Unknown Doctor'}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.doctor?.designation ?? ''} •{' '}
                        {a.schedule?.startDateTime
                          ? new Date(a.schedule.startDateTime).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
                          : new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${a.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                      a.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        a.status === 'CANCEL' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </MotionFadeIn>
    </div>
  )
}
