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
    const cookies = parseCookies(request)
    const token = cookies['accessToken']
    if (!token) return null

    try {
        const secret = process.env.JWT_ACCESS_SECRET
        if (!secret) return null
        const decoded = jwt.verify(token, secret) as UserPayload
        return decoded
    } catch {
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
    if (roles.length > 0 && !roles.includes(user.role)) return null
    return user
}
