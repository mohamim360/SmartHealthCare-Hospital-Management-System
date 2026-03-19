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

export function DoctorSchedule() {
  const [scheduleIdsRaw, setScheduleIdsRaw] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiTestResult | null>(null)

  const assignSchedules = async (e: React.FormEvent) => {
    e.preventDefault()
    const ids = scheduleIdsRaw
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (ids.length === 0) {
      setResult({
        status: 400,
        response: null,
        error: 'Enter at least one schedule ID (comma or space separated)',
        timestamp: new Date().toISOString(),
      })
      return
    }
    setLoading(true)
    setResult(null)
    const token = sessionStorage.getItem('accessToken')
    try {
      const res = await fetch('/api/doctor-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify({ scheduleIds: ids }),
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
            POST /api/doctor-schedule
            <Badge variant="outline" className="text-xs">POST</Badge>
          </CardTitle>
          <CardDescription>
            Assign schedule IDs to the logged-in doctor. Requires DOCTOR role (login first or use
            Bearer token).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={assignSchedules}>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Schedule IDs <span className="text-rose-500">*</span>
              </label>
              <textarea
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
                rows={4}
                placeholder="UUID one per line or comma-separated"
                value={scheduleIdsRaw}
                onChange={(e) => setScheduleIdsRaw(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Assigning...' : 'Assign schedules'}
            </button>
          </form>
        </CardContent>
      </Card>

      <ApiResponsePreview result={result} formatJSON={formatJSON} />
    </div>
  )
}
