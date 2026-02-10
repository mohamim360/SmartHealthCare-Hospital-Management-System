import { createFileRoute } from '@tanstack/react-router'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { createPatient } from '@/lib/user/user.service'
import {
  createPatientJsonSchema,
  createPatientMultipartSchema,
} from '@/lib/user/user.validation'

function isPrismaUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    // PrismaClientKnownRequestError code for unique constraint
    (err as any).code === 'P2002'
  )
}

export const Route = createFileRoute('/api/user/create-patient')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get('content-type') ?? ''

        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData()
          const dataField = formData.get('data')

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

          const parsed = createPatientMultipartSchema.safeParse(raw)

          if (!parsed.success) {
            return sendError({
              statusCode: 400,
              message: 'Validation failed',
              error: parsed.error.flatten(),
            })
          }

          const input = {
            name: parsed.data.patient.name,
            email: parsed.data.patient.email,
            password: parsed.data.password,
            address: parsed.data.patient.address,
          }

          try {
            const result = await createPatient(input)
            return sendSuccess({
              statusCode: 201,
              message: 'Patient created successfully!',
              data: result,
            })
          } catch (err) {
            console.error('Failed to create patient (multipart)', err)
            if (isPrismaUniqueConstraintError(err)) {
              return sendError({
                statusCode: 409,
                message: 'Email already exists',
              })
            }
            return sendError({
              statusCode: 500,
              message: 'Failed to create patient',
            })
          }
        }

        let body: unknown
        try {
          body = await request.json()
        } catch (err) {
          console.error('Failed to parse JSON body for /api/user/create-patient', err)
          return sendError({
            statusCode: 400,
            message: 'Invalid JSON body',
          })
        }
        const parsed = createPatientJsonSchema.safeParse(body)

        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }

        try {
          const result = await createPatient(parsed.data)
          return sendSuccess({
            statusCode: 201,
            message: 'Patient created successfully!',
            data: result,
          })
        } catch (err) {
          console.error('Failed to create patient (json)', err)
          if (isPrismaUniqueConstraintError(err)) {
            return sendError({
              statusCode: 409,
              message: 'Email already exists',
            })
          }
          return sendError({
            statusCode: 500,
            message: 'Failed to create patient',
          })
        }
      },
    },
  },
})
