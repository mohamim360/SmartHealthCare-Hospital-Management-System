import { getStripe } from './stripe'
import { prisma } from '@/db'
import { PaymentStatus } from '@/generated/prisma/client'
import type { UserPayload } from '@/lib/auth/auth.middleware'

/**
 * Create a Stripe Checkout Session for an unpaid appointment.
 */
export async function createCheckoutSession(appointmentId: string, userEmail: string) {
  // Validate the appointment belongs to this patient and is unpaid
  const patient = await prisma.patient.findUniqueOrThrow({ where: { email: userEmail } })

  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    include: {
      payment: true,
      doctor: { select: { name: true, designation: true, appointmentFee: true } },
      schedule: { select: { startDateTime: true, endDateTime: true } },
    },
  })

  if (appointment.patientId !== patient.id) {
    throw new Error('This is not your appointment')
  }

  if (appointment.paymentStatus === PaymentStatus.PAID) {
    throw new Error('Payment already completed')
  }

  if (!appointment.payment) {
    throw new Error('No payment record found')
  }

  const amount = appointment.doctor.appointmentFee

  // Create Stripe Checkout Session
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    metadata: {
      appointmentId: appointment.id,
      paymentId: appointment.payment.id,
    },
    line_items: [
      {
        price_data: {
          currency: 'bdt',
          unit_amount: amount * 100, // Stripe expects smallest currency unit (paisa)
          product_data: {
            name: `Consultation — Dr. ${appointment.doctor.name}`,
            description: `${appointment.doctor.designation} • ${new Date(appointment.schedule.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.SITE_URL || 'http://localhost:3000'}/dashboard/patient/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL || 'http://localhost:3000'}/dashboard/patient/payment-cancel?appointment_id=${appointmentId}`,
  })

  return { url: session.url, sessionId: session.id }
}

/**
 * Handle Stripe webhook event — called by the webhook route.
 */
export async function handleStripeWebhook(rawBody: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured')

  console.log('[Webhook] Received event, verifying signature...')

  const event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret)

  console.log('[Webhook] Event type:', event.type)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const appointmentId = session.metadata?.appointmentId
    const paymentId = session.metadata?.paymentId

    if (!appointmentId || !paymentId) {
      console.error('[Stripe Webhook] Missing metadata on session', session.id)
      return { received: true }
    }

    await markPaymentAsPaid(paymentId, appointmentId, {
      stripeSessionId: session.id,
      paymentIntent: session.payment_intent,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      currency: session.currency,
    }, session.payment_intent || session.id)

    console.log(`[Stripe Webhook] Payment confirmed for appointment ${appointmentId}`)
  }

  return { received: true }
}

/**
 * Verify a Stripe Checkout Session and confirm payment in DB.
 * Called by the success page as a reliable fallback to the webhook.
 */
export async function verifyAndConfirmPayment(sessionId: string) {
  const session = await getStripe().checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    return { confirmed: false, message: 'Payment not completed on Stripe' }
  }

  const appointmentId = session.metadata?.appointmentId
  const paymentId = session.metadata?.paymentId

  if (!appointmentId || !paymentId) {
    return { confirmed: false, message: 'Session metadata missing' }
  }

  // Check if already paid
  const existing = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (existing?.status === PaymentStatus.PAID) {
    return { confirmed: true, message: 'Payment already confirmed' }
  }

  await markPaymentAsPaid(paymentId, appointmentId, {
    stripeSessionId: session.id,
    paymentIntent: session.payment_intent,
    customerEmail: session.customer_email,
    amountTotal: session.amount_total,
    currency: session.currency,
  }, (session.payment_intent as string) || session.id)

  return { confirmed: true, message: 'Payment confirmed successfully' }
}

/**
 * Shared helper to mark a payment as paid in the DB.
 */
async function markPaymentAsPaid(
  paymentId: string,
  appointmentId: string,
  gatewayData: Record<string, any>,
  transactionId: string,
) {
  await prisma.$transaction(async (tnx) => {
    await tnx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.PAID,
        transactionId,
        paymentGatewayData: gatewayData,
      },
    })

    await tnx.appointment.update({
      where: { id: appointmentId },
      data: { paymentStatus: PaymentStatus.PAID },
    })
  })
}

/**
 * Get payments based on user role.
 */
export async function getPayments(
  user: UserPayload,
  options: { page?: number; limit?: number; status?: string },
) {
  const page = options.page || 1
  const limit = options.limit || 20
  const skip = (page - 1) * limit

  const where: any = {}

  // Status filter
  if (options.status === 'PAID' || options.status === 'UNPAID') {
    where.status = options.status
  }

  // Role-based scoping
  if (user.role === 'PATIENT') {
    const patient = await prisma.patient.findUnique({ where: { email: user.email } })
    if (!patient) throw new Error('Patient not found')
    where.appointment = { patientId: patient.id }
  } else if (user.role === 'DOCTOR') {
    const doctor = await prisma.doctor.findUnique({ where: { email: user.email } })
    if (!doctor) throw new Error('Doctor not found')
    where.appointment = { doctorId: doctor.id }
  }
  // ADMIN sees all

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        appointment: {
          select: {
            id: true,
            status: true,
            patient: { select: { name: true, email: true } },
            doctor: { select: { name: true, designation: true } },
            schedule: { select: { startDateTime: true, endDateTime: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ])

  return { data, meta: { page, limit, total } }
}

/**
 * Get payment stats for admin dashboard.
 */
export async function getPaymentStats() {
  const [totalRevenue, totalPayments, paidCount, unpaidCount] = await Promise.all([
    prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.payment.count(),
    prisma.payment.count({ where: { status: 'PAID' } }),
    prisma.payment.count({ where: { status: 'UNPAID' } }),
  ])

  return {
    totalRevenue: totalRevenue._sum.amount || 0,
    totalPayments,
    paidCount,
    unpaidCount,
  }
}
