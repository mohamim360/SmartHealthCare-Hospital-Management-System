

import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Trash2, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export const Route = createFileRoute('/dashboard/admin/schedules-management')({
  component: SchedulesManagementPage,
})

const emptyForm = { startDate: '', endDate: '', startTime: '', endTime: '' }

function SchedulesManagementPage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

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

  const handleDelete = async () => {
    if (!deleteId) return
    const res = await api.delete(`/api/schedule/${deleteId}`)
    if (res.success) {
      setDeleteId(null)
      fetchSchedules()
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    setCreateError(null)
    const res = await api.post('/api/schedule', form)
    if (res.success) {
      setShowCreate(false)
      setForm(emptyForm)
      fetchSchedules()
    } else {
      setCreateError(res.message || 'Failed to create schedule')
    }
    setCreating(false)
  }

  const updateField = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const totalPages = Math.ceil(total / 10)

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
                      <TableCell>{new Date(s.startDateTime).toLocaleString()}</TableCell>
                      <TableCell>{new Date(s.endDateTime).toLocaleString()}</TableCell>
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
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Schedule</DialogTitle>
            <DialogDescription>
              Create 30-minute time slots between the specified dates and times.
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{createError}</div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" value={form.startDate} onChange={e => updateField('startDate', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="date" value={form.endDate} onChange={e => updateField('endDate', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input type="time" value={form.startTime} onChange={e => updateField('startTime', e.target.value)} />
                <p className="text-xs text-muted-foreground">e.g. 09:00</p>
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input type="time" value={form.endTime} onChange={e => updateField('endTime', e.target.value)} />
                <p className="text-xs text-muted-foreground">e.g. 17:00</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating…</> : 'Create Schedule'}
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
