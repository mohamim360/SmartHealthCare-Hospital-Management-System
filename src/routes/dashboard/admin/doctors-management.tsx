

import { useState, useEffect, useCallback } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Search, Trash2, Eye, Plus, Loader2 } from 'lucide-react'
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
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useDebounce } from '@/hooks'
import { api, buildQuery } from '@/lib/api'
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog'

export const Route = createFileRoute('/dashboard/admin/doctors-management')({
    component: DoctorsManagementPage,
})

const emptyDoctor = {
    name: '', email: '', password: '', contactNumber: '', address: '',
    registrationNumber: '', experience: 0, gender: 'MALE' as const,
    appointmentFee: 0, qualification: '', currentWorkingPlace: '', designation: '',
}

function DoctorsManagementPage() {
    const getFirstWordInitial = (name?: string) =>
        name?.trim()?.split(' ')[0]?.charAt(0)?.toUpperCase() || 'D'

    const [doctors, setDoctors] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [showCreate, setShowCreate] = useState(false)
    const [form, setForm] = useState(emptyDoctor)
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const debouncedSearch = useDebounce(search, 400)

    const fetchDoctors = useCallback(async () => {
        setLoading(true)
        const qs = buildQuery({ page, limit: 10, searchTerm: debouncedSearch || undefined })
        const res = await api.get<any[]>(`/api/doctor${qs}`)
        if (res.success) {
            setDoctors(res.data ?? [])
            setTotal(res.meta?.total ?? 0)
        }
        setLoading(false)
    }, [page, debouncedSearch])

    useEffect(() => { fetchDoctors() }, [fetchDoctors])

    const handleDelete = async () => {
        if (!deleteId) return
        const res = await api.delete(`/api/doctor/${deleteId}`)
        if (res.success) {
            setDeleteId(null)
            fetchDoctors()
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
                doctor: {
                    name: form.name,
                    email: form.email,
                    contactNumber: form.contactNumber,
                    address: form.address,
                    registrationNumber: form.registrationNumber,
                    experience: form.experience,
                    gender: form.gender,
                    appointmentFee: form.appointmentFee,
                    qualification: form.qualification,
                    currentWorkingPlace: form.currentWorkingPlace,
                    designation: form.designation,
                },
            }),
        )
        if (profilePhoto) {
            payload.append('profilePhoto', profilePhoto)
        }

        const res = await api.postForm('/api/user/create-doctor', payload)
        if (res.success) {
            setShowCreate(false)
            setForm(emptyDoctor)
            setProfilePhoto(null)
            fetchDoctors()
        } else {
            setCreateError(res.message || 'Failed to create doctor')
        }
        setCreating(false)
    }

    const updateField = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

    const totalPages = Math.ceil(total / 10)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Doctors Management</h1>
                    <p className="text-muted-foreground">{total} total doctors</p>
                </div>
                <Button onClick={() => setShowCreate(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Doctor
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or speciality…"
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
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>Experience</TableHead>
                                    <TableHead>Fee</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {doctors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                                            No doctors found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    doctors.map((d: any) => (
                                        <TableRow key={d.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        {d.profilePhoto ? (
                                                            <AvatarImage src={d.profilePhoto} alt={d.name || 'Doctor'} />
                                                        ) : null}
                                                        <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                                                            {getFirstWordInitial(d.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">{d.name}</p>
                                                        <p className="text-xs text-muted-foreground">{d.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{d.designation}</TableCell>
                                            <TableCell>{d.experience} yrs</TableCell>
                                            <TableCell>৳{d.appointmentFee}</TableCell>
                                            <TableCell>⭐ {d.averageRating?.toFixed(1) ?? '—'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-1 justify-end">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link to="/doctor/$id" params={{ id: d.id }}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(d.id)}>
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

            {/* Create Doctor Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Doctor</DialogTitle>
                        <DialogDescription>Fill in the details to register a new doctor.</DialogDescription>
                    </DialogHeader>

                    {createError && (
                        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{createError}</div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name *</Label>
                            <Input value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Dr. John Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="doctor@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Password *</Label>
                            <Input type="password" value={form.password} onChange={e => updateField('password', e.target.value)} placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                            <Label>Contact Number *</Label>
                            <Input value={form.contactNumber} onChange={e => updateField('contactNumber', e.target.value)} placeholder="+880..." />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Address *</Label>
                            <Input value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="123 Medical St, Dhaka" />
                        </div>
                        <div className="space-y-2">
                            <Label>Registration Number *</Label>
                            <Input value={form.registrationNumber} onChange={e => updateField('registrationNumber', e.target.value)} placeholder="BMDC-12345" />
                        </div>
                        <div className="space-y-2">
                            <Label>Experience (years)</Label>
                            <Input type="number" value={form.experience} onChange={e => updateField('experience', parseInt(e.target.value) || 0)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Gender *</Label>
                            <Select value={form.gender} onValueChange={v => updateField('gender', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Appointment Fee (৳) *</Label>
                            <Input type="number" value={form.appointmentFee} onChange={e => updateField('appointmentFee', parseInt(e.target.value) || 0)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Qualification *</Label>
                            <Input value={form.qualification} onChange={e => updateField('qualification', e.target.value)} placeholder="MBBS, FCPS" />
                        </div>
                        <div className="space-y-2">
                            <Label>Designation *</Label>
                            <Input value={form.designation} onChange={e => updateField('designation', e.target.value)} placeholder="Senior Consultant" />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Current Working Place *</Label>
                            <Input value={form.currentWorkingPlace} onChange={e => updateField('currentWorkingPlace', e.target.value)} placeholder="Dhaka Medical College" />
                        </div>
                        <div className="col-span-2 space-y-2">
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
                            {creating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating…</> : 'Create Doctor'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <DeleteConfirmationDialog
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Doctor"
                description="Are you sure you want to delete this doctor? This action cannot be undone."
            />
        </div>
    )
}
