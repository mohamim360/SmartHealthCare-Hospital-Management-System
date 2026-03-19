import bcrypt from 'bcryptjs'
import { UserStatus } from '@/generated/prisma/client'
import { prisma } from '@/db'
import { jwtHelper } from '@/lib/utils/jwt'

export type LoginInput = { email: string; password: string }

export type LoginResult = {
  accessToken: string
  refreshToken: string
  needPasswordChange: boolean
}

export async function login(payload: LoginInput): Promise<LoginResult> {
  const user = await prisma.user.findFirst({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  })

  const invalidCredsError = new Error('Invalid email or password')
  if (!user) {
    throw invalidCredsError
  }

  const isCorrectPassword = await bcrypt.compare(payload.password, user.password)
  if (!isCorrectPassword) {
    throw invalidCredsError
  }

  const accessSecret = process.env.JWT_ACCESS_SECRET
  const refreshSecret = process.env.JWT_REFRESH_SECRET

  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT secrets are not configured')
  }

  const accessToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    accessSecret,
    '1h',
  )
  const refreshToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    refreshSecret,
    '90d',
  )

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  }
}
