import bcrypt from 'bcryptjs'
import { UserStatus } from '@/generated/prisma/enums'
import { prisma } from '@/db'
import { generateToken } from './jwt'

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

  const accessToken = generateToken(
    { email: user.email, role: user.role },
    'access',
  )
  const refreshToken = generateToken(
    { email: user.email, role: user.role },
    'refresh',
  )

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  }
}
