import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiResponsePreview, type ApiTestResult } from '@/components/shared/api-response-preview'

export function DoctorManagement() {
  const [doctorId, setDoctorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiTestResult | null>(null)

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null

  const headersWithAuth = (extra?: Record<string, string>) => ({
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  })

  const setResultFromResponse = async (res: Response) => {
    const data = await res.json().catch(() => null)
    setResult({
      status: res.status,
      response: data,
      error: !res.ok ? data?.message || `Request failed with status ${res.status}` : null,
      timestamp: new Date().toISOString(),
    })
  }

  const formatJSON = (obj: unknown) => {
    try {
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(obj)
    }
  }

  const getDoctor = async () => {
    if (!doctorId.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/doctor/${doctorId.trim()}`, {
        method: 'GET',
        headers: headersWithAuth(),
        credentials: 'include',
      })
      await setResultFromResponse(res)
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

  const deleteDoctor = async () => {
    if (!doctorId.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/doctor/${doctorId.trim()}`, {
        method: 'DELETE',
        headers: headersWithAuth(),
        credentials: 'include',
      })
      await setResultFromResponse(res)
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            /api/doctor/:id <Badge variant="outline" className="text-xs">GET/DELETE</Badge>
          </CardTitle>
          <CardDescription>Get or delete doctor by ID (ADMIN only).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Doctor ID (UUID)"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={getDoctor} disabled={loading || !doctorId.trim()} className="rounded-md bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-60">GET</button>
            <button type="button" onClick={deleteDoctor} disabled={loading || !doctorId.trim()} className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700 disabled:opacity-60">DELETE</button>
          </div>
        </CardContent>
      </Card>

      <ApiResponsePreview result={result} formatJSON={formatJSON} />
    </div>
  )
}

