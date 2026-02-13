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
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  headers.append(
    'Set-Cookie',
    `accessToken=${accessToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${ACCESS_TOKEN_MAX_AGE}${secure}`,
  )
  headers.append(
    'Set-Cookie',
    `refreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${REFRESH_TOKEN_MAX_AGE}${secure}`,
  )
  return new Response(res.body, { status: res.status, headers })
}

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch (err) {
          console.error('Failed to parse JSON body for /api/auth/login', err)
          return sendError({
            statusCode: 400,
            message: 'Invalid JSON body',
          })
        }
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
            data: {
              needPasswordChange: result.needPasswordChange,
              accessToken: result.accessToken
            },
          })
          return responseWithCookies(
            res,
            result.accessToken,
            result.refreshToken,
          )
        } catch (err) {
          if (err instanceof Error && err.message === 'Invalid email or password') {
            return sendError({
              statusCode: 401,
              message: err.message,
            })
          }

          console.error('Login failed', err)
          return sendError({
            statusCode: 500,
            message: 'Login failed',
          })
        }
      },
    },
  },
})
