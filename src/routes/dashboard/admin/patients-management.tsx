


import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search, Trash2, Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { useDebounce } from '@/hooks'
import { api, buildQuery } from '@/lib/api'
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog'

export const Route = createFileRoute('/dashboard/admin/patients-management')({
  component: PatientsManagementPage,
})

function PatientsManagementPage() {
  const getFirstWordInitial = (name?: string) =>
    name?.trim()?.split(' ')[0]?.charAt(0)?.toUpperCase() || 'P'

  const [patients, setPatients] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 400)

  // Edit state
  const [editPatient, setEditPatient] = useState<any>(null)
  const [editForm, setEditForm] = useState<Record<string, any>>({})
  const [editing, setEditing] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    const qs = buildQuery({ page, limit: 10, searchTerm: debouncedSearch || undefined })
    const res = await api.get<any[]>(`/api/patient${qs}`)
    if (res.success) {
      setPatients(res.data ?? [])
      setTotal(res.meta?.total ?? 0)
    }
    setLoading(false)
  }, [page, debouncedSearch])

  useEffect(() => { fetchPatients() }, [fetchPatients])

  const handleDelete = async () => {
    if (!deleteId) return
    const res = await api.delete(`/api/patient/${deleteId}`)
    if (res.success) {
      setDeleteId(null)
      fetchPatients()
      toast.success('Patient deleted successfully')
    } else {
      toast.error('Failed to delete patient')
    }
  }

  const openEditDialog = (patient: any) => {
    setEditPatient(patient)
    setEditForm({
      name: patient.name || '',
      contactNumber: patient.contactNumber || '',
      address: patient.address || '',
    })
    setEditError(null)
  }

  const handleEdit = async () => {
    if (!editPatient) return
    setEditing(true)
    setEditError(null)

    const res = await api.patch(`/api/patient/${editPatient.id}`, editForm)
    if (res.success) {
      setEditPatient(null)
      fetchPatients()
      toast.success('Patient updated successfully')
    } else {
      setEditError(res.message || 'Failed to update patient')
      toast.error(res.message || 'Failed to update patient')
    }
    setEditing(false)
  }

  const updateEditField = (field: string, value: any) => setEditForm(prev => ({ ...prev, [field]: value }))

  const totalPages = Math.ceil(total / 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Patients Management</h1>
        <p className="text-muted-foreground">{total} total patients</p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      No patients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {p.profilePhoto ? (
                              <AvatarImage src={p.profilePhoto} alt={p.name || 'Patient'} />
                            ) : null}
                            <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                              {getFirstWordInitial(p.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{p.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{p.contactNumber || '—'}</TableCell>
                      <TableCell>{p.address || '—'}</TableCell>
                      <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Patient Dialog */}
      <Dialog open={!!editPatient} onOpenChange={(open) => { if (!open) setEditPatient(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Update the patient's information.</DialogDescription>
          </DialogHeader>

          {editError && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{editError}</div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editForm.name || ''} onChange={e => updateEditField('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <Input value={editForm.contactNumber || ''} onChange={e => updateEditField('contactNumber', e.target.value)} placeholder="+880..." />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={editForm.address || ''} onChange={e => updateEditField('address', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setEditPatient(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={editing}>
              {editing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Patient"
        description="Are you sure you want to delete this patient? This action cannot be undone."
      />
    </div>
  )
}
