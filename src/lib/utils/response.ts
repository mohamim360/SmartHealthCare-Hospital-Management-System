
export function sendResponse<T>({
  statusCode,
  success,
  message,
  data,
  meta,
  headers,
}: {
  statusCode: number
  success: boolean
  message: string
  data?: T | null
  meta?: {
    page: number
    limit: number
    total: number
  }
  headers?: HeadersInit
}): Response {
  const responseHeaders = new Headers(headers)
  responseHeaders.set('Content-Type', 'application/json')

  return Response.json(
    {
      success,
      message,
      meta: meta || null,
      data: data ?? null,
    },
    {
      status: statusCode,
      headers: responseHeaders,
    },
  )
}

/**
 * Success response helper
 */
export function sendSuccess<T>({
  statusCode = 200,
  message = 'Success',
  data,
  meta,
  headers,
}: {
  statusCode?: number
  message?: string
  data?: T
  meta?: { page: number; limit: number; total: number }
  headers?: HeadersInit
}): Response {
  return sendResponse({
    statusCode,
    success: true,
    message,
    data,
    meta,
    headers,
  })
}

/**
 * Error response helper
 */
export function sendError({
  statusCode = 500,
  message = 'Something went wrong!',
  error,
}: {
  statusCode?: number
  message?: string
  error?: unknown
}): Response {
  return sendResponse({
    statusCode,
    success: false,
    message,
    data: error || null,
  })
}
