import { createFileRoute } from '@tanstack/react-router'
import { sendError, sendSuccess } from '@/lib/utils/response'
import { deleteScheduleFromDB } from '@/lib/schedule/schedule.service'

export const Route = createFileRoute('/api/schedule/$id')({
  server: {
    handlers: {
      DELETE: async ({ params }) => {
        const { id } = params
        try {
          await deleteScheduleFromDB(id)
          return sendSuccess({
            statusCode: 200,
            message: 'Schedule deleted',
          })
        } catch (err: unknown) {
          const isNotFound =
            typeof err === 'object' &&
            err !== null &&
            'code' in err &&
            (err as { code: string }).code === 'P2025'
          if (isNotFound) {
            return sendError({
              statusCode: 404,
              message: 'Schedule not found',
            })
          }
          console.error('Failed to delete schedule', err)
          return sendError({
            statusCode: 500,
            message: 'Failed to delete schedule',
          })
        }
      },
    },
  },
})
