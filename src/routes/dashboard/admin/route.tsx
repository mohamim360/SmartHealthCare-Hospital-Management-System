import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/dashboard/admin')({
  component: AdminGuard,
})

function AdminGuard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      if (user.role === 'PATIENT') {
        navigate({ to: '/dashboard/patient' })
      } else {
        navigate({ to: '/dashboard/doctor' })
      }
    }
  }, [loading, user, navigate])

  if (loading) return null
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) return null

  return <Outlet />
}
