
import { createFileRoute } from '@tanstack/react-router'
import { sendError } from '@/lib/utils/response'

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return sendError({
          statusCode: 404,
          message: 'API NOT FOUND!',
          error: {
            path: request.url,
            message: 'Your requested path is not found!',
          },
        })
      },
      POST: async ({ request, params }) => {
        return sendError({
          statusCode: 404,
          message: 'API NOT FOUND!',
          error: {
            path: request.url,
            message: 'Your requested path is not found!',
          },
        })
      },
      PUT: async ({ request, params }) => {
        return sendError({
          statusCode: 404,
          message: 'API NOT FOUND!',
          error: {
            path: request.url,
            message: 'Your requested path is not found!',
          },
        })
      },
      DELETE: async ({ request, params }) => {
        return sendError({
          statusCode: 404,
          message: 'API NOT FOUND!',
          error: {
            path: request.url,
            message: 'Your requested path is not found!',
          },
        })
      },
      PATCH: async ({ request, params }) => {
        return sendError({
          statusCode: 404,
          message: 'API NOT FOUND!',
          error: {
            path: request.url,
            message: 'Your requested path is not found!',
          },
        })
      },
    },
  },
})
