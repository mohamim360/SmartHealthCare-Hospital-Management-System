import { createFileRoute, Link } from '@tanstack/react-router'
import { XCircle, Calendar, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard/patient/payment-cancel')({
  component: PaymentCancelPage,
})

function PaymentCancelPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center shadow-lg border-0">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Payment Cancelled</h1>
            <p className="text-muted-foreground">
              Your appointment has been booked but the payment was not completed.
              You can pay later from your appointments page.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="text-muted-foreground">
              Don't worry — your time slot is reserved. Complete the payment to confirm.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 gap-2" asChild>
              <Link to="/dashboard/patient/my-appointments">
                <Calendar className="h-4 w-4" />
                My Appointments
              </Link>
            </Button>
            <Button variant="outline" className="flex-1 gap-2" asChild>
              <Link to="/dashboard/patient/book-appointment">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
