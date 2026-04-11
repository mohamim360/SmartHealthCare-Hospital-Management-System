
import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Users, Stethoscope, Calendar, FileText, Star, Heart } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MotionStaggerList, staggerItem, MotionFadeIn } from '@/components/ui/motion'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/dashboard/admin/')({
    component: AdminDashboard,
})

function AdminDashboard() {
    const [meta, setMeta] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/api/metadata').then((res) => {
            if (res.success) setMeta(res.data)
            setLoading(false)
        })
    }, [])

    const stats = meta
        ? [
            { title: 'Total Doctors', value: meta.doctorCount ?? 0, icon: Stethoscope, description: 'Active doctors' },
            { title: 'Total Patients', value: meta.patientCount ?? 0, icon: Users, description: 'Registered patients' },
            { title: 'Appointments', value: meta.appointmentCount ?? 0, icon: Calendar, description: 'All time' },
            { title: 'Prescriptions', value: meta.prescriptionCount ?? 0, icon: FileText, description: 'Total issued' },
            { title: 'Reviews', value: meta.reviewCount ?? 0, icon: Star, description: 'Patient feedback' },
            { title: 'Revenue', value: `$${meta.totalRevenue ?? 0}`, icon: Heart, description: 'All-time earnings' },
        ]
        : []

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Overview of the healthcare platform.</p>
            </div>

            {loading ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            ) : (
                <MotionStaggerList className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Use the sidebar navigation to manage doctors, patients, appointments, and more.
                        </p>
                    </CardContent>
                </Card>
            </MotionFadeIn>
        </div>
    )
}
