import { UserStatus } from '@/generated/prisma/client'
import { prisma } from '../../db'
import bcrypt from 'bcryptjs'
import { jwtHelper } from '../utils/jwt'

const login = async (payload: { email: string; password: string }) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE,
        },
    })

    const isCorrectPassword = await bcrypt.compare(payload.password, user.password)
    if (!isCorrectPassword) {
        throw new Error('Password is incorrect!')
    }

    const accessToken = jwtHelper.generateToken(
        { email: user.email, role: user.role },
        'abcd', // TODO: Use env variable
        '1h',
    )

    const refreshToken = jwtHelper.generateToken(
        { email: user.email, role: user.role },
        'abcdefgh', // TODO: Use env variable
        '90d',
    )

    return {
        accessToken,
        refreshToken,
        needPasswordChange: user.needPasswordChange,
    }
}

export const AuthService = {
    login,
}
