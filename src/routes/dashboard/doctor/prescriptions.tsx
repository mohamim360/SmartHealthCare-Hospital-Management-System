

import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api, buildQuery } from '@/lib/api'

export const Route = createFileRoute('/dashboard/doctor/prescriptions')({
    component: DoctorPrescriptionsPage,
})

function DoctorPrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const fetchPrescriptions = useCallback(async () => {
        setLoading(true)
        const qs = buildQuery({ page, limit: 10 })
        const res = await api.get<any[]>(`/api/prescription${qs}`)
        if (res.success) {
            setPrescriptions(res.data ?? [])
            setTotal(res.meta?.total ?? 0)
        }
        setLoading(false)
    }, [page])

    useEffect(() => { fetchPrescriptions() }, [fetchPrescriptions])

    const totalPages = Math.ceil(total / 10)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Prescriptions</h1>
                    <p className="text-muted-foreground">{total} prescriptions issued by you</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Prescription History</CardTitle>
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
                                    <TableHead>Instructions</TableHead>
                                    <TableHead>Follow-up</TableHead>
                                    <TableHead>Date Issued</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prescriptions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                                            No prescriptions issued yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    prescriptions.map((p: any) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.patient?.name ?? '—'}</TableCell>
                                            <TableCell className="max-w-xs truncate">{p.instructions}</TableCell>
                                            <TableCell>{p.followUpDate ? new Date(p.followUpDate).toLocaleDateString() : '—'}</TableCell>
                                            <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
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
