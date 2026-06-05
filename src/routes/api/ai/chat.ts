import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '../../../db'
import { verifyAuth } from '@/lib/auth/auth.middleware'
import { createAppointmentByActor } from '@/lib/appointment/appointment.service'
import { formatScheduleDateTime } from '@/lib/utils/schedule-datetime'

const SYSTEM_PROMPT = `You are HealthAI, a helpful and empathetic health assistant for Smart Health Care, a modern healthcare platform.

Your role:
- Answer general health questions with clear, easy-to-understand explanations
- Help users understand symptoms and suggest which type of specialist to consult
- Provide wellness tips, preventive care advice, and healthy lifestyle suggestions
- Guide users on when to seek emergency care vs. scheduling a regular appointment
- Recommend booking an appointment on our platform when appropriate
- Handle booking requests directly when possible, including booking for admin staff on behalf of patients

Important guidelines:
- NEVER diagnose conditions — always recommend consulting a qualified doctor
- ALWAYS include a disclaimer when discussing symptoms: "This is for informational purposes only. Please consult a healthcare professional for proper diagnosis."
- Be warm, professional, and reassuring in tone
- Keep responses concise (2-3 short paragraphs max)
- Use simple language, avoid excessive medical jargon
- If asked about emergencies, strongly advise calling emergency services immediately
- You can suggest specialist types (cardiologist, dermatologist, etc.) based on symptoms

Format:
- Use bullet points for lists
- Bold important terms with **asterisks**
- Keep paragraphs short and scannable
- Include navigation links naturally in your response text`

// Role-based navigation links
const SHARED_LINKS = [
  '- Browse all doctors: [Find Doctors](/consultation)',
  '- Account settings: [Settings](/dashboard/settings)',
]
const PATIENT_LINKS = [
  '- Book an appointment: [Book Appointment](/dashboard/patient/book-appointment)',
  '- View appointments: [My Appointments](/dashboard/patient/my-appointments)',
  '- Payment history: [Payment History](/dashboard/patient/payment-history)',
  '- View prescriptions: [My Prescriptions](/dashboard/patient/my-prescriptions)',
  '- Health records: [Health Records](/dashboard/patient/health-records)',
  '- Your reviews: [My Reviews](/dashboard/patient/reviews)',
]
const DOCTOR_LINKS = [
  '- My appointments: [Appointments](/dashboard/doctor/appointments)',
  '- My schedules: [My Schedules](/dashboard/doctor/my-schedules)',
  '- Prescriptions: [Prescriptions](/dashboard/doctor/prescriptions)',
]
const ADMIN_LINKS = [
  '- Manage doctors: [Doctors](/dashboard/admin/doctors-management)',
  '- Manage patients: [Patients](/dashboard/admin/patients-management)',
  '- Manage appointments: [Appointments](/dashboard/admin/appointments-management)',
  '- Manage schedules: [Schedules](/dashboard/admin/schedules-management)',
]

function getNavigationPrompt(role?: string): string {
  let links = [...SHARED_LINKS]
  if (role === 'PATIENT') links = [...links, ...PATIENT_LINKS]
  else if (role === 'DOCTOR') links = [...links, ...DOCTOR_LINKS]
  else if (role === 'ADMIN' || role === 'SUPER_ADMIN') links = [...links, ...ADMIN_LINKS]
  // No role = only shared links (safe default)

  return [
    'Navigation Links — IMPORTANT:',
    'When relevant, include helpful navigation links using markdown syntax [Link Text](/path). Here are the available pages:',
    ...links,
    'Always include at least one relevant link when it makes sense.',
  ].join('\n')
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const MAX_REQUESTS_PER_MINUTE = 10

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const key = ip || 'default'
  let entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + 60_000 }
    rateLimitMap.set(key, entry)
  }
  entry.count++
  if (entry.count > MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  return { allowed: true }
}

// Z.AI (glm-4.5) via OpenAI-compatible API──
async function callZai(messages: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = process.env.ZAI_API_KEY
  if (!apiKey) throw new Error('ZAI_API_KEY not set')

  const payload = {
    model: 'glm-4.5',
    messages: messages.map((m) => ({
      role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system',
      content: m.content,
    })),
    temperature: 0.7,
    stream: false,
  }

  const response = await fetch('https://api.z.ai/api/coding/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`ZAI API error: ${response.status} ${text}`)
  }

  const data: any = await response.json()
  const choice = data?.choices?.[0]
  const content = choice?.message?.content

  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((c: any) => {
        if (typeof c === 'string') return c
        if (typeof c?.text === 'string') return c.text
        return ''
      })
      .join('\n')
  }

  return ''
}

async function buildDoctorsContext() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isDeleted: false },
      select: {
        name: true,
        designation: true,
        currentWorkingPlace: true,
        averageRating: true,
        appointmentFee: true,
      },
      take: 30,
      orderBy: { averageRating: 'desc' },
    })

    if (!doctors.length) return ''

    const lines = doctors.map((d) => {
      const parts: Array<string> = [d.name]
      if (d.designation) parts.push(d.designation)
      if (d.currentWorkingPlace) parts.push(d.currentWorkingPlace)
      const tail: Array<string> = []
      if (typeof d.averageRating === 'number') tail.push(`Rating: ${d.averageRating.toFixed(1)}`)
      if (typeof d.appointmentFee === 'number') tail.push(`Fee: ${d.appointmentFee}`)
      const head = parts.join(' — ')
      return `- ${head}${tail.length ? ' (' + tail.join(', ') + ')' : ''}`
    })

    return [
      'Here is the current list of doctors available on the Smart Health Care platform:',
      ...lines,
      '',
      'When the user asks about doctors on THIS platform, you MUST answer ONLY using this list.',
      'Do not invent doctor names. If something is not in this list, say you do not see it in the system.',
    ].join('\n')
  } catch (err) {
    console.error('[AI] Failed to load doctors for context:', (err as any)?.message ?? err)
    return ''
  }
}

function isBookingIntent(text: string) {
  const normalized = text.toLowerCase()
  return normalized.includes('book') && (normalized.includes('appointment') || normalized.includes('slot'))
}

function isConfirmationIntent(text: string) {
  const normalized = text.toLowerCase().trim()
  return ['confirm', 'yes', 'yes confirm', 'book it', 'proceed'].includes(normalized)
}

function getSlotSelectionIndex(text: string): number | null {
  const trimmed = text.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const idx = Number(trimmed)
  if (!Number.isInteger(idx) || idx <= 0) return null
  return idx - 1
}

function isLikelyNameOnlyReply(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return false
  if (trimmed.includes('@')) return false
  if (trimmed.length > 40) return false
  return /^[a-zA-Z.\s'-]+$/.test(trimmed)
}

function shouldContinueBookingFlow(messages: Array<{ role: string; content: string }>, lastMessage: string) {
  if (isConfirmationIntent(lastMessage)) return true
  if (getSlotSelectionIndex(lastMessage) !== null) {
    const recentAssistantMsgs = messages
      .slice(-6)
      .filter((m) => m.role === 'assistant')
      .map((m) => m.content.toLowerCase())
    return recentAssistantMsgs.some((text) => text.includes('reply with slot number'))
  }
  if (isBookingIntent(lastMessage)) return true
  if (!isLikelyNameOnlyReply(lastMessage)) return false

  const recentAssistantMsgs = messages
    .slice(-6)
    .filter((m) => m.role === 'assistant')
    .map((m) => m.content.toLowerCase())

  return recentAssistantMsgs.some((text) =>
    text.includes('please tell me which doctor to book with'),
  )
}

function extractPatientEmail(text: string): string | undefined {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match?.[0]
}

function extractDoctorHint(text: string): string | undefined {
  const drMatch = text.match(/(?:with|for)\s+(?:dr\.?\s*)?([a-z][a-z\s.'-]{2,})/i)
  if (drMatch?.[1]) return drMatch[1].trim()
  return undefined
}

async function getDoctorsWithFreeSlots(limit: number = 3) {
  const rows = await prisma.doctorSchedules.findMany({
    where: {
      isBooked: false,
      schedule: { startDateTime: { gt: new Date() } },
      doctor: { isDeleted: false },
    },
    select: {
      doctor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    distinct: ['doctorId'],
    take: limit,
  })

  return rows.map((row) => row.doctor)
}

type PendingBooking = {
  doctorId: string
  doctorName: string
  slotOptions: Array<{ scheduleId: string; slotStartIso: string }>
  selectedOptionIndex?: number
  patientEmail?: string
  expiresAt: number
}

const pendingBookingByActor = new Map<string, PendingBooking>()
const PENDING_BOOKING_TTL_MS = 10 * 60 * 1000

function getActorBookingKey(actor: { role: string; email: string }) {
  return `${actor.role}:${actor.email.toLowerCase()}`
}

async function tryAiBooking({
  request,
  userRole,
  lastMessage,
  messages,
}: {
  request: Request
  userRole?: string
  lastMessage?: string
  messages: Array<{ role: string; content: string }>
}) {
  if (!lastMessage || !shouldContinueBookingFlow(messages, lastMessage)) return null

  const actor = verifyAuth(request)
  if (!actor) {
    return {
      text: [
        'I can book appointments for you, but you need to login first.',
        '- Login and try again',
        '- Then open [Book Appointment](/dashboard/patient/book-appointment) if you prefer manual booking',
      ].join('\n'),
    }
  }

  if (!['PATIENT', 'ADMIN', 'SUPER_ADMIN'].includes(userRole || actor.role)) {
    return {
      text: [
        'I can currently create bookings only for **patients** or **admin staff**.',
        '- You can still manage schedules from [My Schedules](/dashboard/doctor/my-schedules)',
      ].join('\n'),
    }
  }

  const doctorHint = extractDoctorHint(lastMessage) ?? (isLikelyNameOnlyReply(lastMessage) ? lastMessage.trim() : undefined)
  const patientEmail = extractPatientEmail(lastMessage)
  const now = new Date()
  const actorKey = getActorBookingKey(actor)
  const pending = pendingBookingByActor.get(actorKey)
  if (pending && pending.expiresAt < Date.now()) {
    pendingBookingByActor.delete(actorKey)
  }

  if (isConfirmationIntent(lastMessage)) {
    const currentPending = pendingBookingByActor.get(actorKey)
    if (!currentPending) {
      return {
        text: [
          'There is no pending booking to confirm right now.',
          '- Start a new booking by telling me the doctor name',
          '- Or open [Book Appointment](/dashboard/patient/book-appointment)',
        ].join('\n'),
      }
    }

    if (currentPending.selectedOptionIndex === undefined) {
      return {
        text: [
          `Please choose a time first for **${currentPending.doctorName}**.`,
          '- Reply with slot number (example: **1**)',
        ].join('\n'),
      }
    }

    try {
      const selected = currentPending.slotOptions[currentPending.selectedOptionIndex]

      const appointment = await createAppointmentByActor(actor, {
        doctorId: currentPending.doctorId,
        scheduleId: selected.scheduleId,
        patientEmail: currentPending.patientEmail,
      })
      pendingBookingByActor.delete(actorKey)
      const dateText = formatScheduleDateTime(selected.slotStartIso)
      return {
        text: [
          `Confirmed. I booked **${currentPending.doctorName}** for **${dateText}**.`,
          `- Appointment ID: \`${appointment.id}\``,
          '- View appointments: [My Appointments](/dashboard/patient/my-appointments)',
          '- Complete payment: [Payment History](/dashboard/patient/payment-history)',
        ].join('\n'),
      }
    } catch (err: any) {
      pendingBookingByActor.delete(actorKey)
      const message = String(err?.message || 'Booking failed')
      return {
        text: [
          `I tried to confirm the booking, but failed: **${message}**`,
          '- Please ask me to find the next available slot again',
          '- Or book manually: [Book Appointment](/dashboard/patient/book-appointment)',
        ].join('\n'),
      }
    }
  }

  const selectedSlotIndex = getSlotSelectionIndex(lastMessage)
  if (selectedSlotIndex !== null) {
    const currentPending = pendingBookingByActor.get(actorKey)
    if (!currentPending) {
      return {
        text: [
          'There is no active slot list right now.',
          '- Ask me to book an appointment first',
        ].join('\n'),
      }
    }
    if (selectedSlotIndex >= currentPending.slotOptions.length) {
      return {
        text: [
          `Please choose a valid slot number between 1 and ${currentPending.slotOptions.length}.`,
        ].join('\n'),
      }
    }

    currentPending.selectedOptionIndex = selectedSlotIndex
    pendingBookingByActor.set(actorKey, currentPending)
    const chosen = currentPending.slotOptions[selectedSlotIndex]
    const dateText = formatScheduleDateTime(chosen.slotStartIso)

    return {
      text: [
        `Selected: **${currentPending.doctorName}** at **${dateText}**.`,
        '- Reply **Confirm** to create this appointment',
        '- Reply with another slot number to change time',
      ].join('\n'),
    }
  }

  if ((actor.role === 'ADMIN' || actor.role === 'SUPER_ADMIN') && !patientEmail) {
    return {
      text: [
        'I can book this for staff/patients, but I need the patient email first.',
        '- Please send: **book appointment for patient@example.com with Dr. Name**',
        '- Or use manual flow: [Book Appointment](/dashboard/patient/book-appointment)',
      ].join('\n'),
    }
  }

  if (!doctorHint) {
    const availableDoctors = await getDoctorsWithFreeSlots(3)
    const suggestions = availableDoctors.length
      ? availableDoctors.map((d) => `- ${d.name}`).join('\n')
      : '- No doctors with free slots found right now'
    return {
      text: [
        'Please tell me which doctor to book with (example: **with Dr. Name**).',
        'Doctors with free slots now:',
        suggestions,
        '- Or browse doctors: [Find Doctors](/consultation)',
      ].join('\n'),
    }
  }

  const doctor = await prisma.doctor.findFirst({
    where: {
      isDeleted: false,
      name: { contains: doctorHint, mode: 'insensitive' },
    },
    orderBy: { averageRating: 'desc' },
  })

  if (!doctor) {
    return {
      text: [
        'I could not find a matching doctor for that request.',
        '- Browse doctors: [Find Doctors](/consultation)',
        '- Book manually: [Book Appointment](/dashboard/patient/book-appointment)',
      ].join('\n'),
    }
  }

  const slots = await prisma.doctorSchedules.findMany({
    where: {
      doctorId: doctor.id,
      isBooked: false,
      schedule: {
        startDateTime: { gt: now },
      },
    },
    include: {
      schedule: true,
    },
    orderBy: {
      schedule: {
        startDateTime: 'asc',
      },
    },
    take: 5,
  })

  if (slots.length === 0) {
    // Fallback for admin staff:
    // if the doctor has no assigned future slots, auto-assign the earliest
    // unassigned future schedule slot so AI booking can proceed.
    if (actor.role === 'ADMIN' || actor.role === 'SUPER_ADMIN') {
      const unassignedSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: { gt: now },
          doctorSchedules: {
            none: {},
          },
        },
        orderBy: { startDateTime: 'asc' },
      })

      if (unassignedSchedule) {
        await prisma.doctorSchedules.create({
          data: {
            doctorId: doctor.id,
            scheduleId: unassignedSchedule.id,
          },
        })

        pendingBookingByActor.set(actorKey, {
          doctorId: doctor.id,
          doctorName: doctor.name,
          slotOptions: [
            {
              scheduleId: unassignedSchedule.id,
              slotStartIso: new Date(unassignedSchedule.startDateTime).toISOString(),
            },
          ],
          selectedOptionIndex: 0,
          patientEmail,
          expiresAt: Date.now() + PENDING_BOOKING_TTL_MS,
        })

        const dateText = formatScheduleDateTime(unassignedSchedule.startDateTime)
        return {
          text: [
            `I found a slot for **${doctor.name}** at **${dateText}** and prepared the booking.`,
            '- Reply **Confirm** to create this appointment',
            '- Reply with another doctor name to change doctor',
            '- Or book manually: [Book Appointment](/dashboard/patient/book-appointment)',
          ].join('\n'),
        }
      }
    }

    const otherDoctors = await getDoctorsWithFreeSlots(3)
    const otherDoctorLines = otherDoctors
      .filter((d) => d.id !== doctor.id)
      .map((d) => `- ${d.name}`)
      .join('\n')

    const noSlotAdvice = otherDoctorLines
      ? `Doctors with free slots now:\n${otherDoctorLines}`
      : 'No other doctors with free slots found right now.'

    return {
      text: [
        `I found **${doctor.name}**, but there are no free future slots right now.`,
        '- If you just created schedules, make sure they are assigned to this doctor',
        noSlotAdvice,
        '- Try another doctor: [Find Doctors](/consultation)',
        '- Manage appointments: [My Appointments](/dashboard/patient/my-appointments)',
      ].join('\n'),
    }
  }

  const slotOptions = slots.map((s) => ({
    scheduleId: s.scheduleId,
    slotStartIso: new Date(s.schedule.startDateTime).toISOString(),
  }))

  pendingBookingByActor.set(actorKey, {
    doctorId: doctor.id,
    doctorName: doctor.name,
    slotOptions,
    selectedOptionIndex: slotOptions.length === 1 ? 0 : undefined,
    patientEmail,
    expiresAt: Date.now() + PENDING_BOOKING_TTL_MS,
  })

  if (slotOptions.length === 1) {
    const dateText = formatScheduleDateTime(slotOptions[0].slotStartIso)
    return {
      text: [
        `I found one available slot with **${doctor.name}** at **${dateText}**.`,
        '- Reply **Confirm** to create this appointment',
        '- Reply with another doctor name to change doctor',
      ].join('\n'),
    }
  }

  const slotLines = slotOptions
    .map((option, i) => `- ${i + 1}. ${formatScheduleDateTime(option.slotStartIso)}`)
    .join('\n')

  return {
    text: [
      `I found multiple free times with **${doctor.name}**.`,
      'Available slots:',
      slotLines,
      '- Reply with slot number (example: **1**) to choose time',
      '- Then reply **Confirm** to create this appointment',
      '- Or choose another doctor: [Find Doctors](/consultation)',
    ].join('\n'),
  }
}

export const Route = createFileRoute('/api/ai/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Rate limiting
        const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
        const rateCheck = checkRateLimit(clientIp)
        if (!rateCheck.allowed) {
          return new Response(
            JSON.stringify({ error: `Rate limited. Please wait ${rateCheck.retryAfter}s.`, retryAfter: rateCheck.retryAfter }),
            { status: 429, headers: { 'Content-Type': 'application/json' } },
          )
        }

        let body: { messages: Array<{ role: string; content: string }>; role?: string }
        try {
          body = await request.json()
        } catch {
          return new Response(
            JSON.stringify({ error: 'Invalid JSON' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          )
        }

        if (!body.messages.length) {
          return new Response(
            JSON.stringify({ error: 'messages array is required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          )
        }

        // Validate role if provided (only accept known values)
        const validRoles = ['PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN']
        const userRole = validRoles.includes(body.role ?? '') ? body.role : undefined
        const lastMessage = body.messages[body.messages.length - 1]?.content

        const bookingResult = await tryAiBooking({
          request,
          userRole,
          lastMessage,
          messages: body.messages,
        })
        if (bookingResult) {
          return new Response(
            JSON.stringify({ text: bookingResult.text, provider: 'booking-assistant' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        const recentMessages = body.messages.slice(-6)

        const doctorsContext = await buildDoctorsContext()
        const zaiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          {
            role: 'system',
            content: SYSTEM_PROMPT + '\n\n' + getNavigationPrompt(userRole),
          },
        ]

        if (doctorsContext) {
          zaiMessages.push({
            role: 'system',
            content: doctorsContext,
          })
        }

        zaiMessages.push(
          ...recentMessages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        )

        try {
          console.log('[AI] Calling Z.AI (glm-4.5)...')
          const text = await callZai(zaiMessages)
          return new Response(
            JSON.stringify({ text, provider: 'zai' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (err: any) {
          console.error('[AI] Z.AI error:', err?.message || err)

          const msg = String(err?.message || '').toLowerCase()
          if (msg.includes('429') || msg.includes('rate limit') || msg.includes('quota')) {
            return new Response(
              JSON.stringify({
                error: 'AI is temporarily unavailable due to provider rate limits/quota. Please try again in a minute.',
                retryAfter: 60,
              }),
              { status: 429, headers: { 'Content-Type': 'application/json' } },
            )
          }

          return new Response(
            JSON.stringify({ error: 'AI service unavailable. Please try again later.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
