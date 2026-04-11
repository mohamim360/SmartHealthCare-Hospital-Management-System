import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/dashboard/patient')({
  component: PatientGuard,
})

function PatientGuard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user && user.role !== 'PATIENT') {
      // Redirect non-patients to their own dashboard
      if (user.role === 'DOCTOR') {
        navigate({ to: '/dashboard/doctor' })
      } else {
        navigate({ to: '/dashboard/admin' })
      }
    }
  }, [loading, user, navigate])

  if (loading) return null
  if (!user || user.role !== 'PATIENT') return null

  return <Outlet />
}
