
import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { MoreHorizontal, FileText, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { api, buildQuery } from '@/lib/api'

export const Route = createFileRoute('/dashboard/doctor/appointments')({
    component: DoctorAppointmentsPage,
})

const STATUS_VARIANTS: Record<string, string> = {
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
    INPROGRESS: 'bg-orange-50 text-orange-700 border-orange-200',
    COMPLETED: 'bg-green-50 text-green-700 border-green-200',
    CANCEL: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_OPTIONS = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'INPROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCEL', label: 'Cancelled' },
]

function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    // Status change dialog
    const [statusDialog, setStatusDialog] = useState<{ open: boolean; appointment: any | null }>({ open: false, appointment: null })
    const [newStatus, setNewStatus] = useState('')
    const [statusSubmitting, setStatusSubmitting] = useState(false)

    // Prescription dialog
    const [rxDialog, setRxDialog] = useState<{ open: boolean; appointment: any | null }>({ open: false, appointment: null })
    const [rxInstructions, setRxInstructions] = useState('')
    const [rxFollowUp, setRxFollowUp] = useState('')
    const [rxSubmitting, setRxSubmitting] = useState(false)

    const fetchAppointments = useCallback(async () => {
        setLoading(true)
        const qs = buildQuery({ page, limit: 10 })
        const res = await api.get<any[]>(`/api/appointment${qs}`)
        if (res.success) {
            setAppointments(res.data ?? [])
            setTotal(res.meta?.total ?? 0)
        }
        setLoading(false)
    }, [page])

    useEffect(() => { fetchAppointments() }, [fetchAppointments])

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

    // --- Prescription ---
    const openRxDialog = (appointment: any) => {
        setRxInstructions('')
        setRxFollowUp('')
        setRxDialog({ open: true, appointment })
    }

    const handleCreatePrescription = async () => {
        if (!rxDialog.appointment || !rxInstructions.trim()) return
        setRxSubmitting(true)
        const res = await api.post('/api/prescription', {
            appointmentId: rxDialog.appointment.id,
            instructions: rxInstructions.trim(),
            followUpDate: rxFollowUp || null,
        })
        setRxSubmitting(false)
        if (res.success) {
            setRxDialog({ open: false, appointment: null })
            fetchAppointments()
        } else {
            alert(res.message || 'Failed to create prescription')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
                    <p className="text-muted-foreground">{total} total appointments</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchAppointments} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Appointment History</CardTitle>
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
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                                            No appointments yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    appointments.map((a: any) => (
                                        <TableRow key={a.id}>
                                            <TableCell className="font-medium">{a.patient?.name ?? '—'}</TableCell>
                                            <TableCell>
                                                {a.schedule?.startDateTime
                                                    ? new Date(a.schedule.startDateTime).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
                                                    : new Date(a.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_VARIANTS[a.status] ?? ''}`}>
                                                    {a.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs font-medium ${a.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {a.paymentStatus}
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
                                                        <DropdownMenuItem onClick={() => openStatusDialog(a)}>
                                                            <RefreshCw className="mr-2 h-4 w-4" /> Change Status
                                                        </DropdownMenuItem>
                                                        {a.status === 'COMPLETED' && !a.prescription && (
                                                            <DropdownMenuItem onClick={() => openRxDialog(a)}>
                                                                <FileText className="mr-2 h-4 w-4" /> Write Prescription
                                                            </DropdownMenuItem>
                                                        )}
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
                            <Label htmlFor="new-status">New Status</Label>
                            <Select value={newStatus} onValueChange={setNewStatus} disabled={statusSubmitting}>
                                <SelectTrigger id="new-status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map(o => (
                                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {newStatus === 'COMPLETED' && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-sm text-amber-800">
                                    <strong>Reminder:</strong> After marking as completed, please provide a prescription for this patient.
                                </p>
                            </div>
                        )}
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

            {/* --- Write Prescription Dialog --- */}
            <Dialog open={rxDialog.open} onOpenChange={(open) => !open && setRxDialog({ open: false, appointment: null })}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Write Prescription</DialogTitle>
                        <DialogDescription>
                            Prescription for {rxDialog.appointment?.patient?.name ?? 'patient'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rx-instructions">Instructions *</Label>
                            <Textarea
                                id="rx-instructions"
                                placeholder="Enter medication, dosage, and other instructions…"
                                value={rxInstructions}
                                onChange={(e) => setRxInstructions(e.target.value)}
                                rows={5}
                                disabled={rxSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rx-followup">Follow-up Date (optional)</Label>
                            <Input
                                id="rx-followup"
                                type="date"
                                value={rxFollowUp}
                                onChange={(e) => setRxFollowUp(e.target.value)}
                                disabled={rxSubmitting}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRxDialog({ open: false, appointment: null })} disabled={rxSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreatePrescription} disabled={rxSubmitting || !rxInstructions.trim()}>
                            {rxSubmitting ? 'Creating…' : 'Create Prescription'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
