
import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api, buildQuery } from '@/lib/api'

export const Route = createFileRoute('/dashboard/patient/reviews')({
  component: PatientReviewsPage,
})

function PatientReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    const qs = buildQuery({ page, limit: 10 })
    const res = await api.get<any[]>(`/api/review${qs}`)
    if (res.success) {
      setReviews(res.data ?? [])
      setTotal(res.meta?.total ?? 0)
    }
    setLoading(false)
  }, [page])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const totalPages = Math.ceil(total / 10)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Star className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Reviews</h1>
          <p className="text-muted-foreground">{total} reviews given</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            You haven't reviewed any doctors yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{r.doctor?.name ?? 'Unknown Doctor'}</CardTitle>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.doctor?.designation ?? ''} • Reviewed on {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </CardHeader>
              {r.comment && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                </CardContent>
              )}
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
