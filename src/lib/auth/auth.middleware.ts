import jwt from 'jsonwebtoken'

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
export function verifyAuth(request: Request): UserPayload | null {
    // 1. Check Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('[verifyAuth] authHeader:', authHeader ? 'present' : 'missing')

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        try {
            const secret = process.env.JWT_ACCESS_SECRET
            if (!secret) {
                console.error('[verifyAuth] JWT_ACCESS_SECRET is missing')
                return null
            }
            const decoded = jwt.verify(token, secret) as UserPayload
            console.log('[verifyAuth] Header token verified for:', decoded.email)
            return decoded
        } catch (err) {
            console.error('[verifyAuth] Header token verification failed:', err instanceof Error ? err.message : err)
        }
    }

    // 2. Check cookies
    const cookies = parseCookies(request)
    const token = cookies['accessToken']
    console.log('[verifyAuth] cookie token:', token ? 'present' : 'missing')

    if (!token) return null

    try {
        const secret = process.env.JWT_ACCESS_SECRET
        if (!secret) {
            console.error('[verifyAuth] JWT_ACCESS_SECRET is missing')
            return null
        }
        const decoded = jwt.verify(token, secret) as UserPayload
        console.log('[verifyAuth] Cookie token verified for:', decoded.email)
        return decoded
    } catch (err) {
        console.error('[verifyAuth] Cookie token verification failed:', err instanceof Error ? err.message : err)
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
    if (!user) {
        console.log('[requireAuth] No valid user found by verifyAuth')
        return null
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        console.log(`[requireAuth] Role mismatch. User role: ${user.role}, Required: ${roles.join(', ')}`)
        return null
    }

    console.log('[requireAuth] Authorization successful for:', user.email)
    return user
}
