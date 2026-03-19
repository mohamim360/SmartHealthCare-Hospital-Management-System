import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiResponsePreview, type ApiTestResult } from '@/components/shared/api-response-preview'

export function Patients() {
  const [page, setPage] = useState('1')
  const [limit, setLimit] = useState('10')
  const [searchTerm, setSearchTerm] = useState('')
  const [patientId, setPatientId] = useState('')
  const [updateName, setUpdateName] = useState('')
  const [updateAddress, setUpdateAddress] = useState('')
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

  const listPatients = async () => {
    setLoading(true)
    setResult(null)
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(searchTerm ? { searchTerm } : {}),
      })
      const res = await fetch(`/api/patient?${params.toString()}`, {
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

  const getPatient = async () => {
    if (!patientId.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/patient/${patientId.trim()}`, {
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

  const updatePatient = async () => {
    if (!patientId.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/patient/${patientId.trim()}`, {
        method: 'PATCH',
        headers: headersWithAuth({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({
          name: updateName || undefined,
          address: updateAddress || undefined,
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

  const deletePatient = async () => {
    if (!patientId.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/patient/${patientId.trim()}`, {
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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              GET /api/patient <Badge variant="outline" className="text-xs">GET</Badge>
            </CardTitle>
            <CardDescription>List patients (ADMIN only). Supports pagination and searchTerm.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm" type="number" min={1} value={page} onChange={(e) => setPage(e.target.value)} />
              <input className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm" type="number" min={1} max={100} value={limit} onChange={(e) => setLimit(e.target.value)} />
              <input className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm" placeholder="searchTerm (optional)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button
              type="button"
              onClick={listPatients}
              disabled={loading}
              className="w-full rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {loading ? 'Loading...' : 'Fetch patients'}
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              /api/patient/:id <Badge variant="outline" className="text-xs">GET/PATCH/DELETE</Badge>
            </CardTitle>
            <CardDescription>Get, update, or delete a patient by ID (ADMIN only).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Patient ID (UUID)"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={getPatient} disabled={loading || !patientId.trim()} className="rounded-md bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-60">GET</button>
              <button type="button" onClick={deletePatient} disabled={loading || !patientId.trim()} className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700 disabled:opacity-60">DELETE</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="name (optional)" value={updateName} onChange={(e) => setUpdateName(e.target.value)} />
              <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="address (optional)" value={updateAddress} onChange={(e) => setUpdateAddress(e.target.value)} />
            </div>
            <button
              type="button"
              onClick={updatePatient}
              disabled={loading || !patientId.trim()}
              className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
            >
              PATCH (update)
            </button>
          </CardContent>
        </Card>
      </div>

      <ApiResponsePreview result={result} formatJSON={formatJSON} />
    </div>
  )
}

