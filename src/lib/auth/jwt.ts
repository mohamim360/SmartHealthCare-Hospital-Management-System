import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'

const defaultAccessSecret = 'access-secret-change-in-production'
const defaultRefreshSecret = 'refresh-secret-change-in-production'

export function generateToken(
  payload: { email: string; role: string },
  kind: 'access' | 'refresh',
): string {
  const secret: Secret =
    kind === 'access'
      ? process.env.JWT_ACCESS_SECRET ?? defaultAccessSecret
      : process.env.JWT_REFRESH_SECRET ?? defaultRefreshSecret
  const expiresIn = kind === 'access' ? '1h' : '90d'
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn,
  } as SignOptions)
}
