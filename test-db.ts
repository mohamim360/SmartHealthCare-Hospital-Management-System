import bcrypt from 'bcryptjs'
import { prisma } from './src/db.js'
import { UserRole } from './src/generated/prisma/enums.js'

async function test() {
    const email = `test-doctor-${Date.now()}@example.com`
    const password = 'password123'
    const hashPassword = await bcrypt.hash(password, 10)

    try {
        const result = await prisma.$transaction(async (tnx) => {
            console.log('Creating user...')
            await tnx.user.create({
                data: {
                    email,
                    password: hashPassword,
                    role: UserRole.DOCTOR,
                },
            })

            console.log('Creating doctor...')
            return await tnx.doctor.create({
                data: {
                    name: 'Test Doctor',
                    email,
                    contactNumber: '01711111111',
                    address: 'Test Address',
                    registrationNumber: 'REG-TEST-123',
                    experience: 5,
                    gender: 'MALE',
                    appointmentFee: 500,
                    qualification: 'MBBS',
                    currentWorkingPlace: 'Test Hospital',
                    designation: 'Test Consultant',
                },
            })
        })

        console.log('Success:', result)
    } catch (err) {
        console.error('Failure:', err)
    } finally {
        await prisma.$disconnect()
    }
}

test()
