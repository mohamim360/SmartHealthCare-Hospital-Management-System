import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CreditCard, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api, buildQuery } from '@/lib/api'

export const Route = createFileRoute('/dashboard/patient/payment-history')({
  component: PaymentHistoryPage,
})

function PaymentHistoryPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [payingId, setPayingId] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    const qs = buildQuery({ page, limit: 15, status: statusFilter || undefined })
    const res = await api.get<any[]>(`/api/payment${qs}`)
    if (res.success) {
      setPayments(res.data ?? [])
      setTotal(res.meta?.total ?? 0)
    }
    setLoading(false)
  }, [page, statusFilter])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const totalPages = Math.ceil(total / 15)

  const handlePayNow = async (appointmentId: string) => {
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
        <CreditCard className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">{total} total payments</p>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2">
        {['', 'PAID', 'UNPAID'].map((s) => (
          <Button
            key={s || 'all'}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setStatusFilter(s); setPage(1) }}
          >
            {s || 'All'}
          </Button>
        ))}
      </div>

      <Card>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="text-sm font-semibold">{p.appointment?.doctor?.name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">{p.appointment?.doctor?.designation ?? ''}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="font-semibold">৳{p.amount}</TableCell>
                      <TableCell>
                        {p.status === 'PAID' ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Paid
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0 gap-1">
                            <Clock className="h-3 w-3" />
                            Unpaid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {p.transactionId?.slice(0, 12)}…
                      </TableCell>
                      <TableCell className="text-right">
                        {p.status === 'UNPAID' && p.appointment?.status !== 'CANCEL' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={payingId === p.appointment?.id}
                            onClick={() => handlePayNow(p.appointment?.id)}
                            className="gap-1"
                          >
                            {payingId === p.appointment?.id ? (
                              <><Loader2 className="h-3 w-3 animate-spin" />Paying…</>
                            ) : (
                              <><CreditCard className="h-3 w-3" />Pay</>
                            )}
                          </Button>
                        )}
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
    </div>
  )
}
