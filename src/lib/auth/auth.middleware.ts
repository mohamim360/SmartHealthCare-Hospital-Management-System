import { jwtHelper } from '@/lib/utils/jwt'

export type UserPayload = {
    email: string
    role: string
}

/**
 * Parse cookies from a Request header.
 */
function parseCookies(request: Request): Record<string, string> {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return {}

    return Object.fromEntries(
        cookieHeader.split('; ').map((c) => {
            const [key, ...rest] = c.split('=')
            return [key, rest.join('=')]
        }),
    )
}

/**
 * Verify the access token from the request cookies.
 * Returns the decoded user payload or null if unauthorized.
 */
export function verifyAuth(request: Request) {
    // 1. Check Authorization header
    const authHeader = request.headers.get('authorization')

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        try {
            const secret = process.env.JWT_ACCESS_SECRET
            if (!secret) return null

            return jwtHelper.verifyToken(token, secret)
        } catch (err) {
            // Log only generic error message, no token or user details
            console.error('[verifyAuth] Header token verification failed')
        }
    }

    // 2. Check cookies
    const cookies = parseCookies(request)
    const token = cookies['accessToken']

    if (!token) return null

    try {
        const secret = process.env.JWT_ACCESS_SECRET
        if (!secret) return null

        return jwtHelper.verifyToken(token, secret)
    } catch (err) {
        console.error('[verifyAuth] Cookie token verification failed')
        return null
    }
}

/**
 * Check if the request has the required role(s).
 * Returns the user payload if authorized, or null if not.
 */
export function requireAuth(
    request: Request,
    ...roles: string[]
): UserPayload | null {
    const user = verifyAuth(request)
    if (!user) return null

    if (roles.length > 0 && !roles.includes(user.role)) {
        return null
    }

    return user
}
