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

export function CreatePatient() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ApiTestResult | null>(null)

    const testCreatePatientApi = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        try {
            const res = await fetch('/api/user/create-patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    address: address || undefined,
                }),
            })

            const data = await res.json().catch(() => null)

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
                        POST /api/user/create-patient
                        <Badge variant="outline" className="text-xs">
                            POST
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Create a new patient account in the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={testCreatePatientApi}>
                        <div className="space-y-1">
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-1">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Email <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="john.doe@example.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Password <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-1">
                            <label
                                htmlFor="address"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Address <span className="text-slate-400 text-xs">(optional)</span>
                            </label>
                            <input
                                id="address"
                                type="text"
                                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="123 Main St, City, State"
                            />
                        </div>

                        <div className="pt-2">
                            <h3 className="text-sm font-medium mb-2">Request Body</h3>
                            <div className="bg-slate-50 rounded-md p-3 text-xs font-mono">
                                <pre className="whitespace-pre-wrap">
                                    {formatJSON({
                                        name: name || '...',
                                        email: email || '...',
                                        password: password ? '••••••••' : '...',
                                        ...(address && { address }),
                                    })}
                                </pre>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Patient'}
                        </button>
                    </form>
                </CardContent>
            </Card>

            <ApiResponsePreview result={result} formatJSON={formatJSON} />
        </div>
    )
}
