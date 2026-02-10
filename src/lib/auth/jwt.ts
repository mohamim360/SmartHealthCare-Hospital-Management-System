import jwt from 'jsonwebtoken'
import type { Secret, SignOptions } from 'jsonwebtoken'

function requireEnv(name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET'): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} environment variable is not set`)
  }
  return value
}

export function generateToken(
  payload: { email: string; role: string },
  kind: 'access' | 'refresh',
): string {
  const secret: Secret =
    kind === 'access'
      ? requireEnv('JWT_ACCESS_SECRET')
      : requireEnv('JWT_REFRESH_SECRET')
  const expiresIn = kind === 'access' ? '1h' : '90d'
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn,
  } as SignOptions)
}
