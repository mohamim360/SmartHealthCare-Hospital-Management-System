import { createFileRoute } from '@tanstack/react-router'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { createAdmin } from '@/lib/user/user.service'
import { createAdminJsonSchema, createAdminMultipartSchema } from '@/lib/user/user.validation'
import { requireAuth } from '@/lib/auth/auth.middleware'

function isPrismaUniqueConstraintError(err: unknown): boolean {
    return (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as any).code === 'P2002'
    )
}

export const Route = createFileRoute('/api/user/create-admin')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                // Auth check: Temporarily disabled to allow bootstrap first admin
                /*
                const user = requireAuth(request, 'ADMIN')
                if (!user) {
                    return sendError({
                        statusCode: 401,
                        message: 'You are not authorized!',
                    })
                }
                */

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

                    const parsed = createAdminMultipartSchema.safeParse(raw)
                    if (!parsed.success) {
                        return sendError({
                            statusCode: 400,
                            message: 'Validation failed',
                            error: parsed.error.flatten(),
                        })
                    }

                    const input = {
                        name: parsed.data.admin.name,
                        email: parsed.data.admin.email,
                        password: parsed.data.password,
                        contactNumber: parsed.data.admin.contactNumber,
                    }

                    try {
                        const result = await createAdmin(input)
                        return sendSuccess({
                            statusCode: 201,
                            message: 'Admin created successfully!',
                            data: result,
                        })
                    } catch (err) {
                        console.error('Failed to create admin (multipart)', err)
                        if (isPrismaUniqueConstraintError(err)) {
                            return sendError({ statusCode: 409, message: 'Email already exists' })
                        }
                        return sendError({ statusCode: 500, message: 'Failed to create admin' })
                    }
                }

                // JSON body
                let body: unknown
                try {
                    body = await request.json()
                } catch (err) {
                    console.error('Failed to parse JSON body for /api/user/create-admin', err)
                    return sendError({ statusCode: 400, message: 'Invalid JSON body' })
                }

                const parsed = createAdminJsonSchema.safeParse(body)
                if (!parsed.success) {
                    return sendError({
                        statusCode: 400,
                        message: 'Validation failed',
                        error: parsed.error.flatten(),
                    })
                }

                try {
                    const result = await createAdmin(parsed.data)
                    return sendSuccess({
                        statusCode: 201,
                        message: 'Admin created successfully!',
                        data: result,
                    })
                } catch (err) {
                    console.error('Failed to create admin (json)', err)
                    if (isPrismaUniqueConstraintError(err)) {
                        return sendError({ statusCode: 409, message: 'Email already exists' })
                    }
                    return sendError({ statusCode: 500, message: 'Failed to create admin' })
                }
            },
        },
    },
})
