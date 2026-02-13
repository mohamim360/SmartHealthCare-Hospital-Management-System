import { useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ApiTestResult, ApiResponsePreview } from '@/components/shared/api-response-preview'

export function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ApiTestResult | null>(null)

    const testLoginApi = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
                credentials: 'include',
            })

            const data = await res.json().catch(() => null)

            if (res.ok && data?.data?.accessToken) {
                localStorage.setItem('accessToken', data.data.accessToken)
            }

            setResult({
                status: res.status,
                response: data,
                error: !res.ok
                    ? data?.message || `Request failed with status ${res.status}`
                    : null,
                timestamp: new Date().toISOString(),
            })
        } catch (err) {
            setResult({
                status: 0,
                response: null,
                error: err instanceof Error ? err.message : 'Something went wrong',
                timestamp: new Date().toISOString(),
            })
        } finally {
            setLoading(false)
        }
    }

    const formatJSON = (obj: unknown): string => {
        try {
            return JSON.stringify(obj, null, 2)
        } catch {
            return String(obj)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        POST /api/auth/login
                        <Badge variant="outline" className="text-xs">
                            POST
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Sign in with email and password. Sets accessToken and
                        refreshToken cookies.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={testLoginApi}>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-700">
                                Email <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="email"
                                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="john.doe@example.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-700">
                                Password <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="pt-2">
                            <h3 className="text-sm font-medium mb-2">Request Body</h3>
                            <div className="bg-slate-50 rounded-md p-3 text-xs font-mono">
                                <pre className="whitespace-pre-wrap">
                                    {formatJSON({
                                        email: email || '...',
                                        password: password ? '••••••••' : '...',
                                    })}
                                </pre>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Login'}
                        </button>
                    </form>
                </CardContent>
            </Card>

            <ApiResponsePreview result={result} formatJSON={formatJSON} />
        </div>
    )
}
