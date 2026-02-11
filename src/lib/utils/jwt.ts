import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken'

const generateToken = (
    payload: any,
    secret: Secret,
    expiresIn: string,
): string => {
    const token = jwt.sign(payload, secret, {
        algorithm: 'HS256',
        expiresIn,
    } as SignOptions)

    return token
}

const verifyToken = (token: string, secret: Secret): JwtPayload | string => {
    return jwt.verify(token, secret) as JwtPayload
}

export const jwtHelper = {
    generateToken,
    verifyToken,
}
