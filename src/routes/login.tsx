
import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LoginForm } from '@/components/forms/LoginForm'
import type { TLoginForm } from '@/lib/validators'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/login')({
    component: LoginPage,
})

function LoginPage() {
    const navigate = useNavigate()
    const { refresh } = useAuth()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (data: TLoginForm) => {
        setError(null)
        setIsLoading(true)
        try {
            const res = await api.post('/api/auth/login', data)

            if (res.success) {
                const { accessToken, role } = res.data as any

                // Store token for Bearer header fallback
                if (accessToken) {
                    sessionStorage.setItem('accessToken', accessToken)
                }

                // Re-fetch user into AuthContext so dashboard sees authenticated user
                await refresh()

                // Redirect based on role
                const dashboardPath =
                    role === 'ADMIN' || role === 'SUPER_ADMIN'
                        ? '/dashboard/admin'
                        : role === 'DOCTOR'
                            ? '/dashboard/doctor'
                            : '/dashboard/patient'

                await navigate({ to: dashboardPath })
            } else {
                setError(res.message || 'Login failed')
            }
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return <LoginForm onSubmit={handleSubmit} error={error} isLoading={isLoading} />
}
