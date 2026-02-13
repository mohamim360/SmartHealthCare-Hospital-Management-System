import { createFileRoute } from '@tanstack/react-router'
import { fileUploader } from '@/lib/utils/cloudinary'

// ...

export const Route = createFileRoute('/api/user/create-doctor')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Auth check: Only ADMIN or SUPER_ADMIN can create doctors
        const user = requireAuth(request, 'ADMIN', 'SUPER_ADMIN')
        if (!user) {
          return sendError({
            statusCode: 401,
            message: 'You are not authorized!',
          })
        }

        const contentType = request.headers.get('content-type') ?? ''

        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData()
          const dataField = formData.get('data')
          const file = formData.get('profilePhoto') as File | null

          if (typeof dataField !== 'string') {
            return sendError({
              statusCode: 400,
              message: 'Invalid payload: missing data field',
            })
          }

          let raw: unknown
          try {
            raw = JSON.parse(dataField)
          } catch {
            return sendError({
              statusCode: 400,
              message: 'Invalid payload: data must be valid JSON',
            })
          }

          const parsed = createDoctorMultipartSchema.safeParse(raw)
          if (!parsed.success) {
            return sendError({
              statusCode: 400,
              message: 'Validation failed',
              error: parsed.error.flatten(),
            })
          }

          let profilePhotoUrl: string | undefined
          if (file) {
            const uploadResult = await fileUploader.uploadToCloudinary(file)
            profilePhotoUrl = uploadResult?.secure_url
          }

          const input = {
            name: parsed.data.doctor.name,
            email: parsed.data.doctor.email,
            password: parsed.data.password,
            contactNumber: parsed.data.doctor.contactNumber,
            address: parsed.data.doctor.address,
            registrationNumber: parsed.data.doctor.registrationNumber,
            experience: parsed.data.doctor.experience,
            gender: parsed.data.doctor.gender,
            appointmentFee: parsed.data.doctor.appointmentFee,
            qualification: parsed.data.doctor.qualification,
            currentWorkingPlace: parsed.data.doctor.currentWorkingPlace,
            designation: parsed.data.doctor.designation,
            profilePhoto: profilePhotoUrl,
          }

          try {
            const result = await createDoctor(input)
            return sendSuccess({
              statusCode: 201,
              message: 'Doctor created successfully!',
              data: result,
            })
          } catch (err) {
            console.error('Failed to create doctor (multipart)', err)
            if (isPrismaUniqueConstraintError(err)) {
              return sendError({
                statusCode: 409,
                message: 'Email already exists',
              })
            }
            return sendError({
              statusCode: 500,
              message: 'Failed to create doctor',
            })
          }
        }

        // JSON body
        let body: unknown
        try {
          body = await request.json()
        } catch (err) {
          console.error(
            'Failed to parse JSON body for /api/user/create-doctor',
            err,
          )
          return sendError({ statusCode: 400, message: 'Invalid JSON body' })
        }

        const parsed = createDoctorJsonSchema.safeParse(body)
        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }

        try {
          const result = await createDoctor(parsed.data)
          return sendSuccess({
            statusCode: 201,
            message: 'Doctor created successfully!',
            data: result,
          })
        } catch (err) {
          console.error('Failed to create doctor (json)', err)
          if (isPrismaUniqueConstraintError(err)) {
            return sendError({
              statusCode: 409,
              message: 'Email already exists',
            })
          }
          return sendError({
            statusCode: 500,
            message: 'Failed to create doctor',
          })
        }
      },
    },
  },
})
