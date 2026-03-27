import 'dotenv/config'
import { prisma } from '../src/db.js'
import { UserRole } from '../src/generated/prisma/enums'
import bcryptPkg from 'bcryptjs'
const bcrypt = bcryptPkg

const demoDoctors = [
  {
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    password: 'password123',
    designation: 'Cardiologist',
    qualification: 'MBBS, MD (Cardiology)',
    experience: 12,
    appointmentFee: 1500,
    gender: 'FEMALE',
    profilePhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
    address: '45 Heart Care St, Medical Block, Dhaka',
    contactNumber: '+8801700000001',
    currentWorkingPlace: 'National Heart Foundation',
    registrationNumber: 'BMDC-C1001',
    averageRating: 4.8,
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@example.com',
    password: 'password123',
    designation: 'Neurologist',
    qualification: 'MBBS, FCPS (Neurology)',
    experience: 15,
    appointmentFee: 2000,
    gender: 'MALE',
    profilePhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
    address: '12 Neuro Center, Dhaka',
    contactNumber: '+8801700000002',
    currentWorkingPlace: 'Dhaka Medical College Hospital',
    registrationNumber: 'BMDC-N2002',
    averageRating: 4.9,
  },
  {
    name: 'Dr. Emily Taylor',
    email: 'emily.taylor@example.com',
    password: 'password123',
    designation: 'Pediatrician',
    qualification: 'MBBS, DCH, MD (Pediatrics)',
    experience: 8,
    appointmentFee: 1200,
    gender: 'FEMALE',
    profilePhoto: 'https://randomuser.me/api/portraits/women/68.jpg',
    address: '88 Child Care Ave, Dhaka',
    contactNumber: '+8801700000003',
    currentWorkingPlace: 'Shishu Hospital',
    registrationNumber: 'BMDC-P3003',
    averageRating: 4.7,
  },
  {
    name: 'Dr. James Wilson',
    email: 'james.wilson@example.com',
    password: 'password123',
    designation: 'Orthopedic Surgeon',
    qualification: 'MBBS, MS (Ortho)',
    experience: 20,
    appointmentFee: 2500,
    gender: 'MALE',
    profilePhoto: 'https://randomuser.me/api/portraits/men/46.jpg',
    address: '2 Bone Joint Road, Dhaka',
    contactNumber: '+8801700000004',
    currentWorkingPlace: 'Square Hospital',
    registrationNumber: 'BMDC-O4004',
    averageRating: 4.6,
  },
  {
    name: 'Dr. Lisa Wong',
    email: 'lisa.wong@example.com',
    password: 'password123',
    designation: 'Dermatologist',
    qualification: 'MBBS, DDV',
    experience: 10,
    appointmentFee: 1000,
    gender: 'FEMALE',
    profilePhoto: 'https://randomuser.me/api/portraits/women/12.jpg',
    address: '9 Skin Clinic, Dhaka',
    contactNumber: '+8801700000005',
    currentWorkingPlace: 'Popular Diagnostic Center',
    registrationNumber: 'BMDC-D5005',
    averageRating: 4.5,
  },
  {
    name: 'Dr. Robert Fox',
    email: 'robert.fox@example.com',
    password: 'password123',
    designation: 'Psychiatrist',
    qualification: 'MBBS, M.Phil (Psychiatry)',
    experience: 14,
    appointmentFee: 1800,
    gender: 'MALE',
    profilePhoto: 'https://randomuser.me/api/portraits/men/22.jpg',
    address: '3 Mind Wellness, Dhaka',
    contactNumber: '+8801700000006',
    currentWorkingPlace: 'Labaid Hospital',
    registrationNumber: 'BMDC-M6006',
    averageRating: 4.9,
  }
]

async function main() {
  console.log('🩺 Seeding demo doctors...')
  const hashPassword = await bcrypt.hash('password123', 10)

  for (const doc of demoDoctors) {
    const existing = await prisma.user.findUnique({ where: { email: doc.email } })
    if (existing) {
      console.log(`Skipping ${doc.name} - already exists.`)
      continue
    }

    await prisma.$transaction(async (tnx) => {
      await tnx.user.create({
        data: {
          email: doc.email,
          password: hashPassword,
          role: UserRole.DOCTOR,
        },
      })

      await tnx.doctor.create({
        data: {
          name: doc.name,
          email: doc.email,
          contactNumber: doc.contactNumber,
          address: doc.address,
          registrationNumber: doc.registrationNumber,
          experience: doc.experience,
          // Use any for Gender to avoid typing issues if mismatch
          gender: doc.gender as any,
          appointmentFee: doc.appointmentFee,
          qualification: doc.qualification,
          currentWorkingPlace: doc.currentWorkingPlace,
          designation: doc.designation,
          profilePhoto: doc.profilePhoto,
          averageRating: doc.averageRating,
        },
      })
    })

    console.log(`✅ Seeded ${doc.name} (${doc.designation})`)
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding doctors:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
