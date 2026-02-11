import { z } from 'zod'

export const createPatientJsonSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  address: z.string().optional(),
})

export const createPatientMultipartSchema = z.object({
  password: z.string().min(1),
  patient: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address: z.string().optional(),
  }),
})

export const createAdminJsonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
})

export const createAdminMultipartSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  admin: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
  }),
})

export const createDoctorJsonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  address: z.string().min(1, 'Address is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  experience: z.number().optional().default(0),
  gender: z.enum(['MALE', 'FEMALE']),
  appointmentFee: z.number().min(0, 'Appointment fee is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  currentWorkingPlace: z.string().min(1, 'Current working place is required'),
  designation: z.string().min(1, 'Designation is required'),
})

export const createDoctorMultipartSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  doctor: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
    address: z.string().min(1, 'Address is required'),
    registrationNumber: z.string().min(1, 'Registration number is required'),
    experience: z.number().optional().default(0),
    gender: z.enum(['MALE', 'FEMALE']),
    appointmentFee: z.number().min(0, 'Appointment fee is required'),
    qualification: z.string().min(1, 'Qualification is required'),
    currentWorkingPlace: z.string().min(1, 'Current working place is required'),
    designation: z.string().min(1, 'Designation is required'),
  }),
})
