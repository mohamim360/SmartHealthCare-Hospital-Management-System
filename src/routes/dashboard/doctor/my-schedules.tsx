


import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Plus, Loader2, Check, RefreshCw, Ban, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { api, buildQuery } from '@/lib/api'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/doctor/my-schedules')({
  component: DoctorMySchedulesPage,
})

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type WeeklySlot = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

function DoctorMySchedulesPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'weekly'>('manual')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Schedules</h1>
          <p className="text-muted-foreground">Manage your schedule slots and weekly availability</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'manual'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Manual Schedules
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'weekly'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Weekly Availability
        </button>
      </div>

      {activeTab === 'manual' ? <ManualSchedulesTab /> : <WeeklyAvailabilityTab />}
    </div>
  )
}

/* ─── Manual Schedules Tab ─── */
function ManualSchedulesTab() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [showBook, setShowBook] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [booking, setBooking] = useState(false)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    const qs = buildQuery({ page, limit: 10 })
    const res = await api.get<any[]>(`/api/doctor-schedule${qs}`)
    if (res.success) {
      setSchedules(res.data ?? [])
      setTotal(res.meta?.total ?? 0)
    }
    setLoading(false)
  }, [page])

  useEffect(() => { fetchSchedules() }, [fetchSchedules])

  const loadAvailableSlots = async () => {
    setLoadingSlots(true)
    const res = await api.get<any[]>('/api/doctor-schedule/available?limit=100')
    if (res.success) {
      setAvailableSlots(res.data ?? [])
    }
    setLoadingSlots(false)
  }

  const openBookDialog = () => {
    setShowBook(true)
    setSelectedIds([])
    loadAvailableSlots()
  }

  const toggleSlot = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    )
  }

  const handleBook = async () => {
    if (selectedIds.length === 0) return
    setBooking(true)
    const res = await api.post('/api/doctor-schedule', { scheduleIds: selectedIds })
    if (res.success) {
      setShowBook(false)
      setSelectedIds([])
      fetchSchedules()
      toast.success(`${selectedIds.length} schedule(s) booked successfully`)
    } else {
      toast.error(res.message || 'Failed to book schedules')
    }
    setBooking(false)
  }

  const groupByDate = (slots: any[]) => {
    const grouped: Record<string, any[]> = {}
    for (const s of slots) {
      const dateKey = new Date(s.startDateTime).toLocaleDateString()
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(s)
    }
    return Object.entries(grouped).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
    )
  }

  const totalPages = Math.ceil(total / 10)

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} schedule slots assigned to you</p>
        <Button onClick={openBookDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Book Schedules
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Slots</CardTitle>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Date Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                      No schedules assigned yet. Click "Book Schedules" to pick available slots.
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((ds: any) => {
                    const s = ds.schedule ?? ds
                    return (
                      <TableRow key={ds.id ?? ds.scheduleId}>
                        <TableCell>{new Date(s.startDateTime).toLocaleString()}</TableCell>
                        <TableCell>{new Date(s.endDateTime).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={ds.isBooked ? 'secondary' : 'default'}>
                            {ds.isBooked ? 'Booked' : 'Available'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(ds.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    )
                  })
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

      {/* Book Schedules Dialog */}
      <Dialog open={showBook} onOpenChange={setShowBook}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Schedules</DialogTitle>
            <DialogDescription>
              Select time slots from available schedules to add to your calendar.
            </DialogDescription>
          </DialogHeader>

          {loadingSlots ? (
            <div className="text-center py-8 text-muted-foreground">Loading available schedules…</div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No available schedules found.</p>
              <p className="text-sm text-muted-foreground mt-1">Ask the admin to create schedule time slots first.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {groupByDate(availableSlots).map(([date, daySlots]) => (
                <div key={date}>
                  <h3 className="font-medium mb-2 text-sm text-muted-foreground">{date}</h3>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {daySlots.map((slot: any) => {
                      const selected = selectedIds.includes(slot.id)
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => toggleSlot(slot.id)}
                          className={`flex items-center gap-2 p-3 border rounded-lg text-left text-sm transition-colors
                            ${selected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'hover:bg-accent'
                            }`}
                        >
                          <div className={`flex h-5 w-5 items-center justify-center rounded border
                            ${selected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                            {selected && <Check className="h-3 w-3" />}
                          </div>
                          <span>
                            {new Date(slot.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' — '}
                            {new Date(slot.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedIds.length} schedule{selectedIds.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowBook(false)} disabled={booking}>Cancel</Button>
              <Button onClick={handleBook} disabled={selectedIds.length === 0 || booking}>
                {booking ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Booking…</> : 'Book Schedules'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ─── Weekly Availability Tab ─── */
function WeeklyAvailabilityTab() {
  const [slots, setSlots] = useState<WeeklySlot[]>([])
  const [cancellations, setCancellations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0) // 0 = current 4 weeks, 1 = next 4, etc.

  const fetchAvailability = useCallback(async () => {
    setLoading(true)
    const res = await api.get<any>('/api/weekly-availability')
    if (res.success && res.data) {
      const data = res.data as any
      const existing: WeeklySlot[] = (data.availability || []).map((a: any) => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        isActive: a.isActive,
      }))

      const allSlots: WeeklySlot[] = []
      for (let d = 0; d < 7; d++) {
        const found = existing.find(s => s.dayOfWeek === d)
        if (found) {
          allSlots.push(found)
        } else {
          allSlots.push({ dayOfWeek: d, startTime: '09:00', endTime: '17:00', isActive: false })
        }
      }
      setSlots(allSlots)
      setCancellations(data.cancellations || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAvailability() }, [fetchAvailability])

  const updateSlot = (dayOfWeek: number, field: string, value: any) => {
    setSlots(prev => prev.map(s =>
      s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    const activeSlots = slots.filter(s => s.isActive)
    if (activeSlots.length === 0) {
      toast.error('Please enable at least one day')
      setSaving(false)
      return
    }

    const res = await api.put('/api/weekly-availability', { slots: activeSlots })
    if (res.success) {
      toast.success('Weekly availability saved successfully!')
    } else {
      toast.error(res.message || 'Failed to save availability')
    }
    setSaving(false)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    const res = await api.post('/api/weekly-availability/generate', { weeksAhead: 4 })
    if (res.success) {
      const data = res.data as any
      toast.success(data?.message || 'Slots generated successfully!')
    } else {
      toast.error(res.message || 'Failed to generate slots')
    }
    setGenerating(false)
  }

  const handleCancelDay = async (dateStr: string) => {
    // Optimistic update — add to cancellations immediately
    setCancellations(prev => [...prev, { date: dateStr + 'T00:00:00.000Z', doctorId: '' }])

    const res = await api.post('/api/weekly-availability/cancel', { date: dateStr, action: 'cancel' })
    if (res.success) {
      toast.success(res.message || 'Day cancelled')
    } else {
      // Revert on failure
      setCancellations(prev => prev.filter(c => formatDateStr(new Date(c.date)) !== dateStr))
      toast.error(res.message || 'Failed to cancel day')
    }
  }

  const handleRestoreDay = async (dateStr: string) => {
    // Optimistic update — remove from cancellations immediately
    const backup = [...cancellations]
    setCancellations(prev => prev.filter(c => formatDateStr(new Date(c.date)) !== dateStr))

    const res = await api.post('/api/weekly-availability/cancel', { date: dateStr, action: 'restore' })
    if (res.success) {
      toast.success(`${new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} restored`)
    } else {
      // Revert on failure
      setCancellations(backup)
      toast.error(res.message || 'Failed to restore day')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    )
  }

  // Build calendar data for the visible range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatDateStr(today)

  const rangeStart = new Date(today)
  rangeStart.setDate(rangeStart.getDate() + weekOffset * 28)

  // Snap rangeStart back to Sunday so weeks align properly
  const startDow = rangeStart.getDay()
  const calStart = new Date(rangeStart)
  calStart.setDate(calStart.getDate() - startDow)

  // Build 5 complete weeks (35 cells = 5 rows × 7 cols) to cover the 28-day range
  const rangeEnd = new Date(rangeStart)
  rangeEnd.setDate(rangeEnd.getDate() + 27)

  // Calculate how many weeks we need (from calStart Sunday to cover rangeEnd)
  const diffDays = Math.ceil((rangeEnd.getTime() - calStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const totalWeeks = Math.ceil(diffDays / 7)
  const totalCells = totalWeeks * 7

  // Get the month(s) for the title
  const monthTitle = rangeStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) +
    (rangeStart.getMonth() !== rangeEnd.getMonth()
      ? ' – ' + rangeEnd.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : '')

  type CalDay = {
    date: Date
    dateStr: string
    dayOfWeek: number
    isActive: boolean
    isCancelled: boolean
    isPast: boolean
    isOutOfRange: boolean
  }

  const calendarCells: CalDay[] = []
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(calStart)
    d.setDate(d.getDate() + i)
    const dayOfWeek = d.getDay()
    const dateStr = formatDateStr(d)
    const slot = slots.find(s => s.dayOfWeek === dayOfWeek)
    const isActive = slot?.isActive ?? false
    const isCancelled = cancellations.some((c: any) => {
      const cDate = formatDateStr(new Date(c.date))
      return cDate === dateStr
    })
    const isPast = d < today
    const isOutOfRange = d < rangeStart || d > rangeEnd
    calendarCells.push({ date: d, dateStr, dayOfWeek, isActive, isCancelled, isPast, isOutOfRange })
  }

  // Group into rows of 7
  const weeks: CalDay[][] = []
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7))
  }

  return (
    <div className="space-y-6">
      {/* Weekly Template Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Weekly Schedule Template
          </CardTitle>
          <CardDescription>
            Set your fixed availability for each day of the week. This is a one-time setup — times can be changed later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot.dayOfWeek}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-200 ${
                  slot.isActive
                    ? 'bg-background border-border shadow-sm'
                    : 'bg-muted/30 border-transparent'
                }`}
              >
                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => updateSlot(slot.dayOfWeek, 'isActive', !slot.isActive)}
                  className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    slot.isActive ? 'bg-primary' : 'bg-muted-foreground/20'
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                      slot.isActive ? 'translate-x-[22px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>

                {/* Day name */}
                <span className={`w-28 font-medium text-sm select-none ${!slot.isActive ? 'text-muted-foreground' : ''}`}>
                  {DAY_NAMES[slot.dayOfWeek]}
                </span>

                {/* Time inputs */}
                {slot.isActive ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={e => updateSlot(slot.dayOfWeek, 'startTime', e.target.value)}
                      className="w-[130px]"
                    />
                    <span className="text-muted-foreground text-xs font-medium">to</span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={e => updateSlot(slot.dayOfWeek, 'endTime', e.target.value)}
                      className="w-[130px]"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground/60 italic">Day off</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : 'Save Availability'}
            </Button>
            <Button variant="outline" onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating…</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-2" />Generate Next 4 Weeks</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Schedule Calendar</CardTitle>
              <CardDescription>
                Click an active day to cancel it · Click a cancelled day to restore it
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={weekOffset <= 0}
                onClick={() => setWeekOffset(w => w - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[200px] text-center">{monthTitle}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWeekOffset(w => w + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Column headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {DAY_SHORT.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Weeks — each row is always Sun through Sat */}
          <div className="space-y-2">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-2">
                {week.map((day) => {
                  const isToday = day.dateStr === todayStr
                  const slot = slots.find(s => s.dayOfWeek === day.dayOfWeek)
                  const monthDay = day.date.getDate()
                  const showMonth = monthDay === 1

                  // Out-of-range filler cell (padding days from prev/next range)
                  if (day.isOutOfRange) {
                    return (
                      <div
                        key={day.dateStr}
                        className="aspect-square rounded-xl flex flex-col items-center justify-center select-none"
                      >
                        <span className="text-sm text-muted-foreground/20 font-medium">{monthDay}</span>
                      </div>
                    )
                  }

                  // Day off
                  if (!day.isActive) {
                    return (
                      <div
                        key={day.dateStr}
                        className="aspect-square rounded-xl border border-dashed border-muted-foreground/15 flex flex-col items-center justify-center select-none"
                      >
                        <span className="text-sm text-muted-foreground/30 font-medium">{monthDay}</span>
                        <span className="text-[9px] text-muted-foreground/25 font-medium uppercase mt-0.5">Off</span>
                      </div>
                    )
                  }

                  // Past day
                  if (day.isPast) {
                    return (
                      <div
                        key={day.dateStr}
                        className="aspect-square rounded-xl border border-muted/50 bg-muted/20 flex flex-col items-center justify-center select-none opacity-50"
                      >
                        <span className="text-sm text-muted-foreground font-medium">{monthDay}</span>
                        {slot && (
                          <span className="text-[9px] text-muted-foreground mt-0.5">{slot.startTime}</span>
                        )}
                      </div>
                    )
                  }

                  // Cancelled day
                  if (day.isCancelled) {
                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        onClick={() => handleRestoreDay(day.dateStr)}
                        className="aspect-square rounded-xl border-2 border-dashed border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center cursor-pointer group transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 relative overflow-hidden"
                        title={`Cancelled — click to restore ${DAY_NAMES[day.dayOfWeek]}, ${day.date.toLocaleDateString()}`}
                      >
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(239,68,68,0.04)_4px,rgba(239,68,68,0.04)_8px)]" />
                        <span className="text-sm text-destructive/60 font-medium line-through relative z-10">{monthDay}</span>
                        <Ban className="h-3 w-3 text-destructive/40 mt-0.5 group-hover:hidden relative z-10" />
                        <RefreshCw className="h-3 w-3 text-primary hidden group-hover:block mt-0.5 relative z-10" />
                        <span className="text-[8px] text-destructive/40 group-hover:text-primary font-medium uppercase mt-0.5 relative z-10">
                          <span className="group-hover:hidden">Off</span>
                          <span className="hidden group-hover:inline">Restore</span>
                        </span>
                      </button>
                    )
                  }

                  // Active day
                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => handleCancelDay(day.dateStr)}
                      className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer group transition-all duration-200 relative ${
                        isToday
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/10 ring-2 ring-primary/20'
                          : 'border-border bg-background hover:border-destructive/40 hover:bg-destructive/5 shadow-sm'
                      }`}
                      title={`${DAY_NAMES[day.dayOfWeek]}, ${day.date.toLocaleDateString()} — click to cancel`}
                    >
                      {isToday && (
                        <span className="absolute top-1 right-1.5 text-[7px] font-bold text-primary uppercase">Today</span>
                      )}
                      {showMonth && (
                        <span className="absolute top-1 left-1.5 text-[7px] font-bold text-muted-foreground uppercase">
                          {day.date.toLocaleDateString(undefined, { month: 'short' })}
                        </span>
                      )}
                      <span className={`text-base font-semibold ${isToday ? 'text-primary' : 'text-foreground group-hover:text-destructive'}`}>
                        {monthDay}
                      </span>
                      {slot && (
                        <span className={`text-[9px] mt-0.5 ${isToday ? 'text-primary/70' : 'text-muted-foreground group-hover:text-destructive/60'}`}>
                          {slot.startTime}–{slot.endTime}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-4 w-4 rounded-md border-2 border-border bg-background shadow-sm" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-4 w-4 rounded-md border-2 border-primary bg-primary/10 ring-1 ring-primary/20" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-4 w-4 rounded-md border-2 border-dashed border-destructive/30 bg-destructive/5" />
              <span>Cancelled</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-4 w-4 rounded-md border border-dashed border-muted-foreground/15" />
              <span>Day Off</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-4 w-4 rounded-md border border-muted/50 bg-muted/20 opacity-50" />
              <span>Past</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/** Format a Date to YYYY-MM-DD string in local timezone */
function formatDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

