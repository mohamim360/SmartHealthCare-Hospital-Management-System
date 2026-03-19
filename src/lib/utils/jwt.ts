import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken'

export type UserPayload = {
    email: string
    role: string
}

const generateToken = (
    payload: UserPayload,
    secret: Secret,
    expiresIn: string,
): string => {
    return jwt.sign(payload, secret, {
        algorithm: 'HS256',
        expiresIn,
    } as SignOptions)
}

const verifyToken = (token: string, secret: Secret): UserPayload => {
    const decoded = jwt.verify(token, secret) as JwtPayload
    if (
        typeof decoded === 'object' &&
        decoded !== null &&
        'email' in decoded &&
        'role' in decoded &&
        typeof decoded.email === 'string' &&
        typeof decoded.role === 'string'
    ) {
        return {
            email: decoded.email,
            role: decoded.role,
        }
    }
    throw new Error('Invalid token payload')
}

export const jwtHelper = {
    generateToken,
    verifyToken,
}
