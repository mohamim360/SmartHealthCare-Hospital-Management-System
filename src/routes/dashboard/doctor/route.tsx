import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/dashboard/doctor')({
  component: DoctorGuard,
})

function DoctorGuard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user && user.role !== 'DOCTOR') {
      if (user.role === 'PATIENT') {
        navigate({ to: '/dashboard/patient' })
      } else {
        navigate({ to: '/dashboard/admin' })
      }
    }
  }, [loading, user, navigate])

  if (loading) return null
  if (!user || user.role !== 'DOCTOR') return null

  return <Outlet />
}
