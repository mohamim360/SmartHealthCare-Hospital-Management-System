

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async () => {
        const headers = new Headers()
        headers.set('Content-Type', 'application/json')
        // Clear both auth cookies
        headers.append(
          'Set-Cookie',
          'accessToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
        )
        headers.append(
          'Set-Cookie',
          'refreshToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
        )

        return new Response(
          JSON.stringify({ success: true, message: 'Logged out', data: null, meta: null }),
          { status: 200, headers },
        )
      },
    },
  },
})
