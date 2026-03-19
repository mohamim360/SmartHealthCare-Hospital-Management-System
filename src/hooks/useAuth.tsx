
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/lib/api'

export interface AuthUser {
    email: string
    role: string
    name: string
}

interface AuthContextValue {
    user: AuthUser | null
    loading: boolean
    logout: () => Promise<void>
    refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    loading: true,
    logout: async () => { },
    refresh: async () => { },
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const fetchUser = useCallback(async () => {
        try {
            const res = await api.get<AuthUser>('/api/auth/me')
            if (res.success && res.data) {
                setUser(res.data as AuthUser)
            } else {
                setUser(null)
            }
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    const logout = useCallback(async () => {
        await api.post('/api/auth/logout', {})
        sessionStorage.removeItem('accessToken')
        setUser(null)
        await navigate({ to: '/login' })
    }, [navigate])

    return (
        <AuthContext.Provider value={{ user, loading, logout, refresh: fetchUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
