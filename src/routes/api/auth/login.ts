import { createFileRoute } from '@tanstack/react-router'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { login } from '@/lib/auth/auth.service'
import { loginSchema } from '@/lib/auth/auth.validation'

const ACCESS_TOKEN_MAX_AGE = 60 * 60 // 1h
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 90 // 90d

function responseWithCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): Response {
  const headers = new Headers(res.headers)
  headers.append(
    'Set-Cookie',
    `accessToken=${accessToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${ACCESS_TOKEN_MAX_AGE}`,
  )
  headers.append(
    'Set-Cookie',
    `refreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${REFRESH_TOKEN_MAX_AGE}`,
  )
  return new Response(res.body, { status: res.status, headers })
}

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()
        const parsed = loginSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }

        try {
          const result = await login(parsed.data)
          const res = sendSuccess({
            statusCode: 201,
            message: 'User logged in successfully!',
            data: { needPasswordChange: result.needPasswordChange },
          })
          return responseWithCookies(
            res,
            result.accessToken,
            result.refreshToken,
          )
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed'
          return sendError({ statusCode: 401, message, error: message })
        }
      },
    },
  },
})
