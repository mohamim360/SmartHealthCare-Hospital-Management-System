


import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { LogOut, User, Mail, Shield, Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { user, loading, logout, refresh } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [editForm, setEditForm] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  // Determine API endpoint based on role
  const getProfileEndpoint = () => {
    if (!user) return ''
    switch (user.role) {
      case 'PATIENT': return '/api/patient/profile'
      case 'DOCTOR': return '/api/doctor/profile'
      case 'ADMIN':
      case 'SUPER_ADMIN': return '/api/admin/profile'
      default: return ''
    }
  }

  // Fetch full profile when entering edit mode
  useEffect(() => {
    if (user && isEditing && !profile) {
      const endpoint = getProfileEndpoint()
      if (!endpoint) return
      api.get<any>(endpoint).then((res) => {
        if (res.success && res.data) {
          setProfile(res.data)
          setEditForm(buildFormFromProfile(user.role, res.data as any))
        }
      })
    }
  }, [user, isEditing, profile])

  const handleSave = async () => {
    setSaving(true)
    const endpoint = getProfileEndpoint()
    const res = await api.patch(endpoint, editForm)
    if (res.success) {
      setIsEditing(false)
      setProfile(null)
      await refresh()
      toast.success('Profile updated successfully')
    } else {
      toast.error(res.message || 'Failed to update profile')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const roleBadgeVariant = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    ? 'default'
    : user.role === 'DOCTOR'
      ? 'secondary'
      : 'outline'

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user.profilePhoto && (
                <AvatarImage src={user.profilePhoto} alt={user.name} />
              )}
              <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <Badge variant={roleBadgeVariant} className="mt-1">
                {user.role.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {isEditing ? (
            <EditForm
              role={user.role}
              editForm={editForm}
              setEditForm={setEditForm}
              onSave={handleSave}
              onCancel={() => { setIsEditing(false); setProfile(null) }}
              saving={saving}
            />
          ) : (
            <ReadOnlyView user={user} />
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sign out</p>
              <p className="text-sm text-muted-foreground">End your current session and return to login.</p>
            </div>
            <Button variant="destructive" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ReadOnlyView({ user }: { user: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Email:</span>
        <span className="font-medium">{user.email}</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Role:</span>
        <span className="font-medium">{user.role.replace('_', ' ')}</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Name:</span>
        <span className="font-medium">{user.name}</span>
      </div>
    </div>
  )
}

function EditForm({
  role, editForm, setEditForm, onSave, onCancel, saving,
}: {
  role: string
  editForm: Record<string, any>
  setEditForm: React.Dispatch<React.SetStateAction<Record<string, any>>>
  onSave: () => void
  onCancel: () => void
  saving: boolean
}) {
  const updateField = (field: string, value: any) =>
    setEditForm((prev: any) => ({ ...prev, [field]: value }))

  return (
    <div className="space-y-4 pt-2">
      {/* Common fields for all roles */}
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input value={editForm.name || ''} onChange={e => updateField('name', e.target.value)} placeholder="Full name" />
      </div>

      <div className="space-y-2">
        <Label>Contact Number</Label>
        <Input value={editForm.contactNumber || ''} onChange={e => updateField('contactNumber', e.target.value)} placeholder="+1..." />
      </div>

      {/* Patient-specific fields */}
      {role === 'PATIENT' && (
        <div className="space-y-2">
          <Label>Address</Label>
          <Input value={editForm.address || ''} onChange={e => updateField('address', e.target.value)} placeholder="Your address" />
        </div>
      )}

      {/* Doctor-specific fields */}
      {role === 'DOCTOR' && (
        <>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={editForm.address || ''} onChange={e => updateField('address', e.target.value)} placeholder="Address" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Qualification</Label>
              <Input value={editForm.qualification || ''} onChange={e => updateField('qualification', e.target.value)} placeholder="MBBS, MD..." />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input value={editForm.designation || ''} onChange={e => updateField('designation', e.target.value)} placeholder="Cardiologist..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Experience (years)</Label>
              <Input type="number" value={editForm.experience || 0} onChange={e => updateField('experience', Number(e.target.value))} min={0} />
            </div>
            <div className="space-y-2">
              <Label>Appointment Fee ($)</Label>
              <Input type="number" value={editForm.appointmentFee || 0} onChange={e => updateField('appointmentFee', Number(e.target.value))} min={0} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Current Working Place</Label>
            <Input value={editForm.currentWorkingPlace || ''} onChange={e => updateField('currentWorkingPlace', e.target.value)} placeholder="Hospital name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input value={editForm.registrationNumber || ''} onChange={e => updateField('registrationNumber', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={editForm.gender || ''}
                onChange={e => updateField('gender', e.target.value)}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Admin-specific: just name + contact (already above) */}

      <div className="flex gap-3 pt-2">
        <Button onClick={onSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : 'Save Changes'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function buildFormFromProfile(role: string, profile: any): Record<string, any> {
  switch (role) {
    case 'PATIENT':
      return {
        name: profile.name || '',
        contactNumber: profile.contactNumber || '',
        address: profile.address || '',
      }
    case 'DOCTOR':
      return {
        name: profile.name || '',
        contactNumber: profile.contactNumber || '',
        address: profile.address || '',
        qualification: profile.qualification || '',
        designation: profile.designation || '',
        experience: profile.experience || 0,
        appointmentFee: profile.appointmentFee || 0,
        currentWorkingPlace: profile.currentWorkingPlace || '',
        registrationNumber: profile.registrationNumber || '',
        gender: profile.gender || 'MALE',
      }
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return {
        name: profile.name || '',
        contactNumber: profile.contactNumber || '',
      }
    default:
      return { name: profile.name || '' }
  }
}
