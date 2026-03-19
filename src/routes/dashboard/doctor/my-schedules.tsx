

import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Plus, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { api, buildQuery } from '@/lib/api'

export const Route = createFileRoute('/dashboard/doctor/my-schedules')({
  component: DoctorMySchedulesPage,
})

function DoctorMySchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Book dialog state
  const [showBook, setShowBook] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [booking, setBooking] = useState(false)
  const [bookError, setBookError] = useState<string | null>(null)

  /** Fetch the doctor's own assigned schedules */
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

  /** Load available (un-assigned) slots for the booking dialog */
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
    setBookError(null)
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
    setBookError(null)
    const res = await api.post('/api/doctor-schedule', { scheduleIds: selectedIds })
    if (res.success) {
      setShowBook(false)
      setSelectedIds([])
      fetchSchedules()
    } else {
      setBookError(res.message || 'Failed to book schedules')
    }
    setBooking(false)
  }

  /** Group available slots by date for the dialog */
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Schedules</h1>
            <p className="text-muted-foreground">{total} schedule slots assigned to you</p>
          </div>
        </div>
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

          {bookError && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{bookError}</div>
          )}

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
    </div>
  )
}
