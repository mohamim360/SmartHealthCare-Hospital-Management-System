

import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/dashboard')({
    component: DashboardLayout,
})

function DashboardLayout() {
    const { user, loading, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && !user) {
            navigate({ to: '/login' })
        }
    }, [loading, user, navigate])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="space-y-4 text-center">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                </div>
            </div>
        )
    }

    if (!user) {
        return null // will redirect via useEffect
    }

    return (
        <AppShell
            role={user.role}
            userName={user.name}
            onLogout={logout}
        >
            <Outlet />
        </AppShell>
    )
}
