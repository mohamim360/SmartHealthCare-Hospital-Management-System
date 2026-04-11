

import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search, MoreHorizontal, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDebounce } from '@/hooks'
import { api, buildQuery } from '@/lib/api'

export const Route = createFileRoute('/dashboard/admin/appointments-management')({
  component: AppointmentsManagementPage,
})

const STATUS_VARIANTS: Record<string, string> = {
  SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
  INPROGRESS: 'bg-orange-50 text-orange-700 border-orange-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  CANCEL: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_FILTERS = ['ALL', 'SCHEDULED', 'INPROGRESS', 'COMPLETED', 'CANCEL'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

const STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'INPROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCEL', label: 'Cancelled' },
]

function AppointmentsManagementPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [loading, setLoading] = useState(true)
  const debouncedSearch = useDebounce(search, 400)

  // Status change dialog
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; appointment: any | null }>({ open: false, appointment: null })
  const [newStatus, setNewStatus] = useState('')
  const [statusSubmitting, setStatusSubmitting] = useState(false)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    const qs = buildQuery({
      page,
      limit: 10,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
    })
    const res = await api.get<any[]>(`/api/appointment${qs}`)
    if (res.success) {
      setAppointments(res.data ?? [])
      setTotal(res.meta?.total ?? 0)
    }
    setLoading(false)
  }, [page, statusFilter])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  // Client-side name search
  const filtered = debouncedSearch
    ? appointments.filter((a) =>
      a.patient?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      a.doctor?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : appointments

  const totalPages = Math.ceil(total / 10)

  // --- Status change ---
  const openStatusDialog = (appointment: any) => {
    setNewStatus(appointment.status)
    setStatusDialog({ open: true, appointment })
  }

  const handleStatusChange = async () => {
    if (!statusDialog.appointment || !newStatus) return
    if (newStatus === statusDialog.appointment.status) {
      setStatusDialog({ open: false, appointment: null })
      return
    }
    setStatusSubmitting(true)
    const res = await api.patch(`/api/appointment/${statusDialog.appointment.id}`, {
      action: 'change-status',
      status: newStatus,
    })
    setStatusSubmitting(false)
    if (res.success) {
      setStatusDialog({ open: false, appointment: null })
      fetchAppointments()
    } else {
      alert(res.message || 'Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments Management</h1>
          <p className="text-muted-foreground">{total} total appointments</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAppointments} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setStatusFilter(s); setPage(1) }}
          >
            {s === 'ALL' ? 'All' : s === 'CANCEL' ? 'Cancelled' : s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient or doctor…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      No appointments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((appt: any) => (
                    <TableRow key={appt.id}>
                      <TableCell className="font-medium">{appt.patient?.name ?? '—'}</TableCell>
                      <TableCell>{appt.doctor?.name ?? '—'}</TableCell>
                      <TableCell>
                        {appt.schedule?.startDateTime
                          ? new Date(appt.schedule.startDateTime).toLocaleString()
                          : new Date(appt.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${appt.doctor?.appointmentFee ?? '—'}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_VARIANTS[appt.status] ?? ''}`}>
                          {appt.status === 'CANCEL' ? 'Cancelled' : appt.status === 'INPROGRESS' ? 'In Progress' : appt.status?.charAt(0) + appt.status?.slice(1).toLowerCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium ${appt.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                          {appt.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openStatusDialog(appt)}>
                              <RefreshCw className="mr-2 h-4 w-4" /> Change Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* --- Change Status Dialog --- */}
      <Dialog open={statusDialog.open} onOpenChange={(open) => !open && setStatusDialog({ open: false, appointment: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Appointment Status</DialogTitle>
            <DialogDescription>
              Update status for {statusDialog.appointment?.patient?.name ?? 'patient'}&apos;s appointment
              with Dr. {statusDialog.appointment?.doctor?.name ?? ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="text-sm font-medium">
                {STATUS_OPTIONS.find(o => o.value === statusDialog.appointment?.status)?.label ?? statusDialog.appointment?.status}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-new-status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus} disabled={statusSubmitting}>
                <SelectTrigger id="admin-new-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog({ open: false, appointment: null })} disabled={statusSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={statusSubmitting}>
              {statusSubmitting ? 'Updating…' : 'Confirm Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
