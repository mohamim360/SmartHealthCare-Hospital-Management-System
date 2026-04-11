import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '../../../db'

const SYSTEM_PROMPT = `You are HealthAI, a helpful and empathetic health assistant for Smart Health Care, a modern healthcare platform.

Your role:
- Answer general health questions with clear, easy-to-understand explanations
- Help users understand symptoms and suggest which type of specialist to consult
- Provide wellness tips, preventive care advice, and healthy lifestyle suggestions
- Guide users on when to seek emergency care vs. scheduling a regular appointment
- Recommend booking an appointment on our platform when appropriate

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
      const parts: string[] = [d.name]
      if (d.designation) parts.push(d.designation)
      if (d.currentWorkingPlace) parts.push(d.currentWorkingPlace)
      const tail: string[] = []
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

        if (!body.messages?.length) {
          return new Response(
            JSON.stringify({ error: 'messages array is required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          )
        }

        // Validate role if provided (only accept known values)
        const validRoles = ['PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN']
        const userRole = validRoles.includes(body.role ?? '') ? body.role : undefined

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
            role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
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
