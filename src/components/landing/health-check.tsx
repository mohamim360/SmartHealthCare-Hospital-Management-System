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

export function HealthCheck() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ApiTestResult | null>(null)

    const testHealthApi = async () => {
        setLoading(true)
        setResult(null)

        try {
            const res = await fetch('/api/health', {
                method: 'GET',
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
                        GET /api/health
                        <Badge variant="outline" className="text-xs">
                            GET
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Check server health and status information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium mb-2">Request</h3>
                            <div className="bg-slate-50 rounded-md p-3 text-xs font-mono">
                                <div className="text-slate-600">Method: GET</div>
                                <div className="text-slate-600">Endpoint: /api/health</div>
                                <div className="text-slate-600">Headers: None</div>
                                <div className="text-slate-600">Body: None</div>
                            </div>
                        </div>
                        <button
                            onClick={testHealthApi}
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Testing...' : 'Test API'}
                        </button>
                    </div>
                </CardContent>
            </Card>

            <ApiResponsePreview result={result} formatJSON={formatJSON} />
        </div>
    )
}
