import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ApiTestResult, ApiResponsePreview } from '@/components/shared/api-response-preview'

export function Metadata() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiTestResult | null>(null)

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null

  const fetchMetadata = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/metadata', {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
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
            GET /api/metadata
            <Badge variant="outline" className="text-xs">GET</Badge>
          </CardTitle>
          <CardDescription>
            Fetch dashboard metadata based on your role (ADMIN/DOCTOR/PATIENT). Returns different
            data for each role. Login first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Request</h3>
              <div className="bg-slate-50 rounded-md p-3 text-xs font-mono">
                <div className="text-slate-600">Method: GET</div>
                <div className="text-slate-600">Endpoint: /api/metadata</div>
                <div className="text-slate-600">Headers: Authorization (Bearer token or cookie)</div>
                <div className="text-slate-600">Body: None</div>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchMetadata}
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Fetch metadata'}
            </button>
          </div>
        </CardContent>
      </Card>

      <ApiResponsePreview result={result} formatJSON={formatJSON} />
    </div>
  )
}
