import { useEffect, useState } from 'react'
import { Calendar, Loader2, Stethoscope, User } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { formatScheduleDateTime } from '@/lib/utils/schedule-datetime'

type PrescriptionDetailDialogProps = {
  prescriptionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'view' | 'edit'
  onSaved?: () => void
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PrescriptionDetailDialog({
  prescriptionId,
  open,
  onOpenChange,
  mode,
  onSaved,
}: PrescriptionDetailDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [prescription, setPrescription] = useState<any>(null)
  const [instructions, setInstructions] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')

  useEffect(() => {
    if (!open || !prescriptionId) {
      setPrescription(null)
      return
    }

    let cancelled = false
    setLoading(true)

    api.get(`/api/prescription/${prescriptionId}`).then((res) => {
      if (cancelled) return
      if (res.success && res.data) {
        setPrescription(res.data)
        setInstructions(res.data.instructions ?? '')
        setFollowUpDate(
          res.data.followUpDate
            ? new Date(res.data.followUpDate).toISOString().slice(0, 10)
            : '',
        )
      } else {
        toast.error(res.message || 'Failed to load prescription')
        onOpenChange(false)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [open, prescriptionId, onOpenChange])

  const handleSave = async () => {
    if (!prescriptionId) return
    setSaving(true)

    const res = await api.patch(`/api/prescription/${prescriptionId}`, {
      instructions,
      followUpDate: followUpDate || null,
    })

    if (res.success) {
      toast.success('Prescription updated successfully')
      onSaved?.()
      onOpenChange(false)
    } else {
      toast.error(res.message || 'Failed to update prescription')
    }

    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Prescription' : 'Prescription Details'}
          </DialogTitle>
          <DialogDescription>
            {prescription
              ? `Issued ${formatDate(prescription.createdAt)}`
              : 'Loading prescription...'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : prescription ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  Doctor
                </div>
                <p className="font-semibold">{prescription.doctor?.name ?? '—'}</p>
                <p className="text-sm text-muted-foreground">
                  {prescription.doctor?.designation ?? ''}
                </p>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4 text-primary" />
                  Patient
                </div>
                <p className="font-semibold">{prescription.patient?.name ?? '—'}</p>
                <p className="text-sm text-muted-foreground">
                  {prescription.patient?.email ?? ''}
                </p>
              </div>
            </div>

            {prescription.appointment?.schedule && (
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-primary" />
                  Appointment
                </div>
                <p className="text-sm">
                  {formatScheduleDateTime(prescription.appointment.schedule.startDateTime)}
                  {' — '}
                  {formatScheduleDateTime(prescription.appointment.schedule.endDateTime)}
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">{prescription.appointment.status}</Badge>
                  <Badge variant="outline">{prescription.appointment.paymentStatus}</Badge>
                </div>
              </div>
            )}

            {mode === 'edit' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prescription-instructions">Instructions</Label>
                  <Textarea
                    id="prescription-instructions"
                    rows={8}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Medication, dosage, lifestyle advice..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prescription-follow-up">Follow-up Date</Label>
                  <Input
                    id="prescription-follow-up"
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving || !instructions.trim()}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/40 p-4">
                  <p className="text-sm font-medium mb-2">Instructions</p>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {prescription.instructions}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Follow-up Date</p>
                    <p className="font-medium">{formatDate(prescription.followUpDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{formatDate(prescription.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
