import { createFileRoute } from '@tanstack/react-router'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { createPatient } from '@/lib/user/user.service'
import {
  createPatientJsonSchema,
  createPatientMultipartSchema,
} from '@/lib/user/user.validation'

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

          const result = await createPatient(input)
          return sendSuccess({
            statusCode: 201,
            message: 'Patient created successfully!',
            data: result,
          })
        }

        const body = await request.json()
        const parsed = createPatientJsonSchema.safeParse(body)

        if (!parsed.success) {
          return sendError({
            statusCode: 400,
            message: 'Validation failed',
            error: parsed.error.flatten(),
          })
        }

        const result = await createPatient(parsed.data)
        return sendSuccess({
          statusCode: 201,
          message: 'Patient created successfully!',
          data: result,
        })
      },
    },
  },
})
