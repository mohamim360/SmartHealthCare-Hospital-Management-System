import { useState, useEffect } from 'react'
import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { CheckCircle2, Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'

export const Route = createFileRoute('/dashboard/patient/payment-success')({
  component: PaymentSuccessPage,
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: (search.session_id as string) || '',
  }),
})

function PaymentSuccessPage() {
  const { session_id } = useSearch({ from: '/dashboard/patient/payment-success' })
  const [verifying, setVerifying] = useState(!!session_id)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // On mount, verify the payment with Stripe and update DB
  useEffect(() => {
    if (!session_id) {
      setConfirmed(true) // No session_id = already confirmed (e.g. navigated here manually)
      return
    }

    api.post('/api/payment/verify', { sessionId: session_id })
      .then((res) => {
        if (res.success && res.data?.confirmed) {
          setConfirmed(true)
        } else {
          setError(res.message || 'Could not verify payment')
        }
      })
      .catch(() => setError('Failed to verify payment'))
      .finally(() => setVerifying(false))
  }, [session_id])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center shadow-lg border-0">
        <CardContent className="p-8 space-y-6">
          {verifying ? (
            <>
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Verifying Payment...</h1>
                <p className="text-muted-foreground">
                  Please wait while we confirm your payment with Stripe.
                </p>
              </div>
            </>
          ) : confirmed ? (
            <>
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Payment Successful!</h1>
                <p className="text-muted-foreground">
                  Your appointment has been confirmed and payment processed successfully.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
                <p className="text-muted-foreground">You'll receive a confirmation shortly.</p>
                <p className="text-muted-foreground">View your appointments for full details.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 gap-2" asChild>
                  <Link to="/dashboard/patient/my-appointments">
                    <Calendar className="h-4 w-4" />
                    My Appointments
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1 gap-2" asChild>
                  <Link to="/consultation">
                    Book Another
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Verification Issue</h1>
                <p className="text-muted-foreground">
                  {error || 'We could not verify your payment. If you were charged, please contact support.'}
                </p>
              </div>
              <Button className="gap-2" asChild>
                <Link to="/dashboard/patient/my-appointments">
                  <Calendar className="h-4 w-4" />
                  Check Appointments
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
