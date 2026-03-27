
import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { RegisterForm } from '@/components/forms/RegisterForm'
import type { TRegisterPatientForm } from '@/lib/validators'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { handleApiResponse, handleNetworkError } from '@/lib/utils/error-handler'

export const Route = createFileRoute('/register')({
    component: RegisterPage,
})

function RegisterPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Redirect authenticated users away from register
    if (user) {
        const dashboardPath =
            user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                ? '/dashboard/admin'
                : user.role === 'DOCTOR'
                    ? '/dashboard/doctor'
                    : '/dashboard/patient'
        navigate({ to: dashboardPath })
        return null
    }

    const handleSubmit = async (data: TRegisterPatientForm, profilePhoto?: File) => {
        setError(null)
        setIsLoading(true)
        try {
            let res: any

            if (profilePhoto) {
                // Use multipart form data when there's a photo
                const formData = new FormData()
                formData.append(
                    'data',
                    JSON.stringify({
                        password: data.password,
                        patient: {
                            name: data.name,
                            email: data.email,
                            contactNumber: data.contactNumber || undefined,
                            address: data.address || undefined,
                        },
                    }),
                )
                formData.append('profilePhoto', profilePhoto)

                const response = await fetch('/api/user/create-patient', {
                    method: 'POST',
                    body: formData,
                })
                res = await response.json()
            } else {
                // Use JSON when no photo
                res = await api.post('/api/user/create-patient', {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    contactNumber: data.contactNumber || undefined,
                    address: data.address || undefined,
                })
            }

            if (handleApiResponse(res, 'Account created successfully! Please log in.')) {
                await navigate({ to: '/login' })
            } else {
                setError(res.message || 'Registration failed')
            }
        } catch (err) {
            handleNetworkError(err)
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return <RegisterForm onSubmit={handleSubmit} error={error} isLoading={isLoading} />
}
