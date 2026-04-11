import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CreditCard, DollarSign, CheckCircle2, Clock, TrendingUp, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api, buildQuery } from '@/lib/api'

export const Route = createFileRoute('/dashboard/admin/payments')({
  component: AdminPaymentsPage,
})

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any
  label: string
  value: string | number
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [stats, setStats] = useState<any>(null)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    const qs = buildQuery({ page, limit: 20, status: statusFilter || undefined })
    const res = await api.get<any[]>(`/api/payment${qs}`)
    if (res.success) {
      setPayments(res.data ?? [])
      setTotal(res.meta?.total ?? 0)
      if (res.meta?.stats) setStats(res.meta.stats)
    }
    setLoading(false)
  }, [page, statusFilter])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">Overview of all payments in the system</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={TrendingUp}
            label="Total Revenue"
            value={`$${stats.totalRevenue?.toLocaleString() ?? 0}`}
            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          />
          <StatCard
            icon={Receipt}
            label="Total Payments"
            value={stats.totalPayments ?? 0}
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <StatCard
            icon={CheckCircle2}
            label="Paid"
            value={stats.paidCount ?? 0}
            color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.unpaidCount ?? 0}
            color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          />
        </div>
      )}

      {/* Filter + Table */}
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
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-semibold">{p.appointment?.patient?.name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">{p.appointment?.patient?.email ?? ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-semibold">{p.appointment?.doctor?.name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">{p.appointment?.doctor?.designation ?? ''}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.appointment?.schedule?.startDateTime
                          ? new Date(p.appointment.schedule.startDateTime).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                            })
                          : '—'}
                      </TableCell>
                      <TableCell className="font-semibold">${p.amount}</TableCell>
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
                      <TableCell className="text-xs text-muted-foreground font-mono max-w-[100px] truncate">
                        {p.transactionId}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {payments.length} of {total} • Page {page} of {totalPages}
              </p>
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
