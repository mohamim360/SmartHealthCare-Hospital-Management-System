


import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search, Trash2, ShieldCheck, Plus, Loader2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { useDebounce } from '@/hooks'
import { api, buildQuery } from '@/lib/api'
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog'

export const Route = createFileRoute('/dashboard/admin/admins-management')({
  component: AdminsManagementPage,
})

const emptyAdmin = { name: '', email: '', password: '', contactNumber: '' }

function AdminsManagementPage() {
  const getFirstWordInitial = (name?: string) =>
    name?.trim()?.split(' ')[0]?.charAt(0)?.toUpperCase() || 'A'

  const [admins, setAdmins] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(emptyAdmin)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 400)

  // Edit state
  const [editAdmin, setEditAdmin] = useState<any>(null)
  const [editForm, setEditForm] = useState<Record<string, any>>({})
  const [editing, setEditing] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    const qs = buildQuery({ page, limit: 10, searchTerm: debouncedSearch || undefined })
    const res = await api.get<any[]>(`/api/admin${qs}`)
    if (res.success) {
      setAdmins(res.data ?? [])
      setTotal(res.meta?.total ?? 0)
    }
    setLoading(false)
  }, [page, debouncedSearch])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])

  const handleDelete = async () => {
    if (!deleteId) return
    const res = await api.delete(`/api/admin/${deleteId}`)
    if (res.success) {
      setDeleteId(null)
      fetchAdmins()
      toast.success('Admin deleted successfully')
    } else {
      toast.error('Failed to delete admin')
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    setCreateError(null)
    const payload = new FormData()
    payload.append(
      'data',
      JSON.stringify({
        password: form.password,
        admin: {
          name: form.name,
          email: form.email,
          contactNumber: form.contactNumber,
        },
      }),
    )
    if (profilePhoto) {
      payload.append('profilePhoto', profilePhoto)
    }

    const res = await api.postForm('/api/user/create-admin', payload)
    if (res.success) {
      setShowCreate(false)
      setForm(emptyAdmin)
      setProfilePhoto(null)
      fetchAdmins()
      toast.success('Admin created successfully')
    } else {
      setCreateError(res.message || 'Failed to create admin')
      toast.error(res.message || 'Failed to create admin')
    }
    setCreating(false)
  }

  const openEditDialog = (admin: any) => {
    setEditAdmin(admin)
    setEditForm({
      name: admin.name || '',
      contactNumber: admin.contactNumber || '',
    })
    setEditError(null)
  }

  const handleEdit = async () => {
    if (!editAdmin) return
    setEditing(true)
    setEditError(null)

    const res = await api.patch(`/api/admin/${editAdmin.id}`, editForm)
    if (res.success) {
      setEditAdmin(null)
      fetchAdmins()
      toast.success('Admin updated successfully')
    } else {
      setEditError(res.message || 'Failed to update admin')
      toast.error(res.message || 'Failed to update admin')
    }
    setEditing(false)
  }

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))
  const updateEditField = (field: string, value: string) => setEditForm(prev => ({ ...prev, [field]: value }))

  const totalPages = Math.ceil(total / 10)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admins Management</h1>
            <p className="text-muted-foreground">{total} total administrators</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Admin
        </Button>
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
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      No admins found.
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {a.profilePhoto ? (
                              <AvatarImage src={a.profilePhoto} alt={a.name || 'Admin'} />
                            ) : null}
                            <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                              {getFirstWordInitial(a.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{a.name}</span>
                          {a.email === 'super_admin@shc.com' && (
                            <Badge variant="default" className="text-[10px]">Super Admin</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{a.email}</TableCell>
                      <TableCell>{a.contactNumber || '—'}</TableCell>
                      <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={a.email === 'super_admin@shc.com'}
                            onClick={() => openEditDialog(a)}
                            aria-label={`Edit ${a.email}`}
                            title={`Edit ${a.email}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={a.email === 'super_admin@shc.com'}
                            onClick={() => setDeleteId(a.id)}
                            aria-label={`Delete ${a.email}`}
                            title={`Delete ${a.email}`}
                          >
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

      {/* Create Admin Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
            <DialogDescription>Fill in the details to create a new administrator.</DialogDescription>
          </DialogHeader>

          {createError && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{createError}</div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Admin Name" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="admin@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input type="password" value={form.password} onChange={e => updateField('password', e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Contact Number *</Label>
              <Input value={form.contactNumber} onChange={e => updateField('contactNumber', e.target.value)} placeholder="+880..." />
            </div>
            <div className="space-y-2">
              <Label>Profile Photo (optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={e => setProfilePhoto(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating…</> : 'Create Admin'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={!!editAdmin} onOpenChange={(open) => { if (!open) setEditAdmin(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>Update the administrator's information.</DialogDescription>
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
              <Input value={editForm.contactNumber || ''} onChange={e => updateEditField('contactNumber', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setEditAdmin(null)}>Cancel</Button>
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
        title="Delete Admin"
        description="Are you sure you want to delete this admin? This action cannot be undone."
      />
    </div>
  )
}
