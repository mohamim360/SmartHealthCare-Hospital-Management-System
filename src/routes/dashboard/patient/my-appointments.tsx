

import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Star, XCircle, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { api, buildQuery } from '@/lib/api'

export const Route = createFileRoute('/dashboard/patient/my-appointments')({
  component: PatientMyAppointmentsPage,
})

const STATUS_VARIANTS: Record<string, string> = {
  SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
  INPROGRESS: 'bg-orange-50 text-orange-700 border-orange-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  CANCEL: 'bg-red-50 text-red-700 border-red-200',
}

function PatientMyAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Cancel dialog
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appointment: any | null }>({ open: false, appointment: null })
  const [cancelSubmitting, setCancelSubmitting] = useState(false)

  // Review dialog
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; appointment: any | null }>({ open: false, appointment: null })
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  // Pay state
  const [payingId, setPayingId] = useState<string | null>(null)

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

  // --- Cancel ---
  const handleCancel = async () => {
    if (!cancelDialog.appointment) return
    setCancelSubmitting(true)
    const res = await api.patch(`/api/appointment/${cancelDialog.appointment.id}`, {
      action: 'change-status',
      status: 'CANCEL',
    })
    setCancelSubmitting(false)
    if (res.success) {
      setCancelDialog({ open: false, appointment: null })
      fetchAppointments()
    } else {
      alert(res.message || 'Failed to cancel appointment')
    }
  }

  // --- Review ---
  const openReviewDialog = (appointment: any) => {
    setRating(0)
    setHoveredRating(0)
    setComment('')
    setReviewDialog({ open: true, appointment })
  }

  const handleReview = async () => {
    if (!reviewDialog.appointment || rating === 0) return
    if (comment.trim().length < 10) {
      alert('Comment must be at least 10 characters')
      return
    }
    setReviewSubmitting(true)
    const res = await api.post('/api/review', {
      appointmentId: reviewDialog.appointment.id,
      rating,
      comment: comment.trim(),
    })
    setReviewSubmitting(false)
    if (res.success) {
      setReviewDialog({ open: false, appointment: null })
      fetchAppointments()
    } else {
      alert(res.message || 'Failed to submit review')
    }
  }

  // --- Pay via Stripe ---
  const handlePay = async (appointmentId: string) => {
    setPayingId(appointmentId)
    const res = await api.post('/api/payment/checkout', { appointmentId })
    if (res.success && res.data?.url) {
      window.location.href = res.data.url
    } else {
      setPayingId(null)
      alert(res.message || 'Failed to create payment session')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground">{total} total appointments</p>
        </div>
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
                  <TableHead>Doctor</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      No appointments yet. Book your first appointment!
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.doctor?.name ?? '—'}</TableCell>
                      <TableCell>{a.doctor?.designation ?? '—'}</TableCell>
                      <TableCell>
                        {a.schedule?.startDateTime
                          ? new Date(a.schedule.startDateTime).toLocaleString()
                          : new Date(a.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>৳{a.doctor?.appointmentFee ?? '—'}</TableCell>
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
                        <div className="flex items-center justify-end gap-1">
                          {/* Cancel: only for SCHEDULED */}
                          {a.status === 'SCHEDULED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setCancelDialog({ open: true, appointment: a })}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                          )}

                          {/* Pay: only when UNPAID */}
                          {a.paymentStatus === 'UNPAID' && a.status !== 'CANCEL' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              disabled={payingId === a.id}
                              onClick={() => handlePay(a.id)}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              {payingId === a.id ? 'Paying…' : 'Pay Now'}
                            </Button>
                          )}

                          {/* Review: only for COMPLETED without existing review */}
                          {a.status === 'COMPLETED' && !a.review && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReviewDialog(a)}
                            >
                              <Star className="h-4 w-4 mr-1" /> Review
                            </Button>
                          )}
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

      {/* --- Cancel Confirmation Dialog --- */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog({ open: false, appointment: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your appointment with Dr. {cancelDialog.appointment?.doctor?.name ?? ''}?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Warning:</strong> This action cannot be undone. The time slot will be released for other patients.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, appointment: null })} disabled={cancelSubmitting}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelSubmitting}>
              {cancelSubmitting ? 'Cancelling…' : 'Yes, Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Review Dialog --- */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => {
        if (!open && !reviewSubmitting) {
          setRating(0); setHoveredRating(0); setComment(''); setReviewDialog({ open: false, appointment: null })
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with Dr. {reviewDialog.appointment?.doctor?.name ?? ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Rating stars */}
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${star <= (hoveredRating || rating)
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-gray-300'
                        }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm font-medium">
                    {rating}/5 — {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="review-comment">Comment * (min 10 characters)</Label>
              <Textarea
                id="review-comment"
                placeholder="Share your experience with this doctor…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                disabled={reviewSubmitting}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">{comment.length} characters</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Reviews cannot be edited or deleted once submitted.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewDialog({ open: false, appointment: null }); setRating(0); setComment('') }} disabled={reviewSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={reviewSubmitting || rating === 0 || comment.trim().length < 10}>
              {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
