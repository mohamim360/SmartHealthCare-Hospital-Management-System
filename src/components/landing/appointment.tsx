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

export function Appointment() {
  const [doctorId, setDoctorId] = useState('')
  const [scheduleId, setScheduleId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiTestResult | null>(null)

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null

  const createAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          doctorId: doctorId.trim(),
          scheduleId: scheduleId.trim(),
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
            POST /api/appointment
            <Badge variant="outline" className="text-xs">POST</Badge>
          </CardTitle>
          <CardDescription>
            Create an appointment (PATIENT only). Requires doctorId and scheduleId; slot must be
            assigned to the doctor and not yet booked. Login as patient first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={createAppointment}>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Doctor ID (UUID) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
                placeholder="Doctor UUID"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Schedule ID (UUID) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
                placeholder="Schedule UUID"
                value={scheduleId}
                onChange={(e) => setScheduleId(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create appointment'}
            </button>
          </form>
        </CardContent>
      </Card>

      <ApiResponsePreview result={result} formatJSON={formatJSON} />
    </div>
  )
}
