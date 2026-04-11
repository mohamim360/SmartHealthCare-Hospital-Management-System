

import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Trash2, Plus, Loader2, Clock, CalendarDays, User2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { api, buildQuery } from '@/lib/api'
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/admin/schedules-management')({
  component: SchedulesManagementPage,
})

// --- AM/PM time helpers ---
const AM_PM_HOURS = Array.from({ length: 12 }, (_, i) => {
  const display = i === 0 ? 12 : i
  return { value12: i, label: String(display).padStart(2, '0') }
})
const MINUTES = ['00', '15', '30', '45']

/** Convert 12h + period back to 24h two-digit string */
function to24h(hour12: number, period: 'AM' | 'PM'): string {
  let h = hour12
  if (period === 'PM') h += 12
  if (h === 24) h = 12 // 12 PM stays 12
  if (period === 'AM' && hour12 === 0) h = 0 // 12 AM = 0
  return String(h).padStart(2, '0')
}

/** Format a Date to locale string with AM/PM */
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/** Get today's date in YYYY-MM-DD for min attribute */
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function SchedulesManagementPage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Form state — stored as 12h internally
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startHour12, setStartHour12] = useState(9)   // 0-11
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM')
  const [startMinute, setStartMinute] = useState('00')
  const [endHour12, setEndHour12] = useState(5)        // 0-11
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('PM')
  const [endMinute, setEndMinute] = useState('00')
  const [doctorId, setDoctorId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Doctor list for dropdown
  const [doctors, setDoctors] = useState<any[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)

  // Derived 24h values for payload & preview
  const startHour24 = to24h(startHour12, startPeriod)
  const endHour24 = to24h(endHour12, endPeriod)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    const qs = buildQuery({ page, limit: 10 })
    const res = await api.get<any[]>(`/api/schedule${qs}`)
    if (res.success) {
      setSchedules(res.data ?? [])
      setTotal(res.meta?.total ?? 0)
    }
    setLoading(false)
  }, [page])

  useEffect(() => { fetchSchedules() }, [fetchSchedules])

  // Fetch doctors when dialog opens
  useEffect(() => {
    if (showCreate && doctors.length === 0) {
      setLoadingDoctors(true)
      api.get<any[]>('/api/doctor?limit=100').then((res) => {
        if (res.success) setDoctors(res.data ?? [])
        setLoadingDoctors(false)
      })
    }
  }, [showCreate])

  const handleDelete = async () => {
    if (!deleteId) return
    const res = await api.delete(`/api/schedule/${deleteId}`)
    if (res.success) {
      setDeleteId(null)
      fetchSchedules()
      toast.success('Schedule deleted')
    } else {
      toast.error('Failed to delete schedule')
    }
  }

  const resetForm = () => {
    setStartDate('')
    setEndDate('')
    setStartHour12(9)
    setStartPeriod('AM')
    setStartMinute('00')
    setEndHour12(5)
    setEndPeriod('PM')
    setEndMinute('00')
    setDoctorId('')
    setCreateError(null)
  }

  const handleCreate = async () => {
    if (!startDate || !endDate) {
      setCreateError('Please select both start and end dates')
      return
    }

    // Validate end time > start time
    const s24 = parseInt(startHour24) * 60 + parseInt(startMinute)
    const e24 = parseInt(endHour24) * 60 + parseInt(endMinute)
    if (e24 <= s24) {
      setCreateError('End time must be after start time')
      return
    }

    setCreating(true)
    setCreateError(null)

    const payload: any = {
      startDate,
      endDate,
      startTime: `${startHour24}:${startMinute}`,
      endTime: `${endHour24}:${endMinute}`,
    }
    if (doctorId) {
      payload.doctorId = doctorId
    }

    const res = await api.post('/api/schedule', payload)
    if (res.success) {
      setShowCreate(false)
      resetForm()
      fetchSchedules()
      const result = res.data as any
      const newSlots = result?.newSlots ?? 0
      const linkedSlots = result?.linkedSlots ?? 0
      const totalSlots = result?.totalSlots ?? (res.data as any[])?.length ?? 0
      if (newSlots > 0 || linkedSlots > 0) {
        let msg = ''
        if (newSlots > 0) msg += `${newSlots} new slot(s) created`
        if (linkedSlots > 0) msg += `${msg ? ', ' : ''}${linkedSlots} slot(s) linked to doctor`
        toast.success(msg)
      } else if (totalSlots > 0) {
        toast.success(`${totalSlots} schedule slot(s) created${doctorId ? ' and assigned to doctor' : ''}`)
      } else {
        toast.info('All slots already exist — no new slots created')
      }
    } else {
      setCreateError(res.message || 'Failed to create schedule')
      toast.error(res.message || 'Failed to create schedule')
    }
    setCreating(false)
  }

  const totalPages = Math.ceil(total / 10)

  // Preview label for the helper text
  const previewStart = `${AM_PM_HOURS[startHour12].label}:${startMinute} ${startPeriod}`
  const previewEnd = `${AM_PM_HOURS[endHour12].label}:${endMinute} ${endPeriod}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Schedules Management</h1>
            <p className="text-muted-foreground">{total} total schedule slots</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Schedule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Slots</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                      No schedule slots found. Create your first schedule above.
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell>{formatDateTime(s.startDateTime)}</TableCell>
                      <TableCell>{formatDateTime(s.endDateTime)}</TableCell>
                      <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(s.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Schedule Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Create Schedule</DialogTitle>
                <DialogDescription>
                  Generate 30-minute time slots for the selected date range and time window.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {createError && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{createError}</div>
          )}

          <div className="space-y-5">
            {/* Assign to Doctor */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User2 className="h-4 w-4 text-muted-foreground" />
                Assign to Doctor <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={doctorId}
                onChange={e => setDoctorId(e.target.value)}
              >
                <option value="">— No doctor (general schedule) —</option>
                {loadingDoctors ? (
                  <option disabled>Loading doctors...</option>
                ) : (
                  doctors.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.name} — {d.designation}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Date Range
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">From</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => {
                      setStartDate(e.target.value)
                      // Auto-set endDate if empty or before new startDate
                      if (!endDate || e.target.value > endDate) {
                        setEndDate(e.target.value)
                      }
                    }}
                    min={todayStr()}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">To</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    min={startDate || todayStr()}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 You can set both dates to the same day to create slots for a single day.
              </p>
            </div>

            {/* Time Window — AM/PM */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Daily Time Window
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {/* Start Time */}
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Start Time</span>
                  <div className="flex gap-1">
                    <select
                      value={startHour12}
                      onChange={e => setStartHour12(Number(e.target.value))}
                      className="flex h-10 w-[4.5rem] rounded-lg border border-input bg-background px-2 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {AM_PM_HOURS.map(h => (
                        <option key={h.value12} value={h.value12}>{h.label}</option>
                      ))}
                    </select>
                    <span className="flex items-center text-muted-foreground font-bold">:</span>
                    <select
                      value={startMinute}
                      onChange={e => setStartMinute(e.target.value)}
                      className="flex h-10 w-[4rem] rounded-lg border border-input bg-background px-2 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {MINUTES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={startPeriod}
                      onChange={e => setStartPeriod(e.target.value as 'AM' | 'PM')}
                      className="flex h-10 w-[4.5rem] rounded-lg border border-input bg-background px-2 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                {/* End Time */}
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">End Time</span>
                  <div className="flex gap-1">
                    <select
                      value={endHour12}
                      onChange={e => setEndHour12(Number(e.target.value))}
                      className="flex h-10 w-[4.5rem] rounded-lg border border-input bg-background px-2 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {AM_PM_HOURS.map(h => (
                        <option key={h.value12} value={h.value12}>{h.label}</option>
                      ))}
                    </select>
                    <span className="flex items-center text-muted-foreground font-bold">:</span>
                    <select
                      value={endMinute}
                      onChange={e => setEndMinute(e.target.value)}
                      className="flex h-10 w-[4rem] rounded-lg border border-input bg-background px-2 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {MINUTES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={endPeriod}
                      onChange={e => setEndPeriod(e.target.value as 'AM' | 'PM')}
                      className="flex h-10 w-[4.5rem] rounded-lg border border-input bg-background px-2 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Slots will be created every 30 minutes from {previewStart} to {previewEnd} each day.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => { setShowCreate(false); resetForm() }}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating…</> : <><Plus className="h-4 w-4 mr-2" />Create Schedule</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Schedule"
        description="Are you sure you want to delete this schedule slot?"
      />
    </div>
  )
}
