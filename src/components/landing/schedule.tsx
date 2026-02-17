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

export function Schedule() {
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [deleteId, setDeleteId] = useState('')
  const [listPage, setListPage] = useState('1')
  const [listLimit, setListLimit] = useState('10')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiTestResult | null>(null)

  const setResultFromResponse = async (res: Response) => {
    const data = await res.json().catch(() => null)
    setResult({
      status: res.status,
      response: data,
      error: !res.ok ? data?.message || `Request failed with status ${res.status}` : null,
      timestamp: new Date().toISOString(),
    })
  }

  const createSchedules = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime,
          endTime,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
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

  const fetchSchedules = async () => {
    setLoading(true)
    setResult(null)
    const token = sessionStorage.getItem('accessToken')
    try {
      const params = new URLSearchParams({ page: listPage, limit: listLimit })
      const res = await fetch(`/api/schedule?${params}`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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

  const deleteSchedule = async () => {
    if (!deleteId.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/schedule/${deleteId.trim()}`, { method: 'DELETE' })
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

  const formatJSON = (obj: unknown): string => {
    try {
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(obj)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              POST /api/schedule
              <Badge variant="outline" className="text-xs">POST</Badge>
            </CardTitle>
            <CardDescription>
              Create 30-minute time slots between start/end date and time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={createSchedules}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Start time</label>
                  <input
                    type="time"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">End time</label>
                  <input
                    type="time"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Start date</label>
                  <input
                    type="date"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">End date</label>
                  <input
                    type="date"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
              >
                {loading ? 'Creating...' : 'Create slots'}
              </button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              GET /api/schedule
              <Badge variant="outline" className="text-xs">GET</Badge>
            </CardTitle>
            <CardDescription>
              List schedules not assigned to current doctor (requires DOCTOR auth)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                placeholder="Page"
                value={listPage}
                onChange={(e) => setListPage(e.target.value)}
              />
              <input
                type="number"
                min={1}
                max={100}
                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                placeholder="Limit"
                value={listLimit}
                onChange={(e) => setListLimit(e.target.value)}
              />
              <button
                type="button"
                onClick={fetchSchedules}
                disabled={loading}
                className="rounded-md bg-slate-600 px-3 py-1 text-sm text-white hover:bg-slate-700 disabled:opacity-60"
              >
                Fetch
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              DELETE /api/schedule/:id
              <Badge variant="outline" className="text-xs">DELETE</Badge>
            </CardTitle>
            <CardDescription>Delete a schedule by ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <input
              type="text"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Schedule ID (UUID)"
              value={deleteId}
              onChange={(e) => setDeleteId(e.target.value)}
            />
            <button
              type="button"
              onClick={deleteSchedule}
              disabled={loading || !deleteId.trim()}
              className="w-full rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              Delete
            </button>
          </CardContent>
        </Card>
      </div>

      <ApiResponsePreview result={result} formatJSON={formatJSON} />
    </div>
  )
}
