
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Smart Health Care API</h1>
        <p className="text-gray-600">Server is running successfully</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Visit <code className="bg-gray-100 px-2 py-1 rounded">/api/health</code> for
            server status
          </p>
        </div>
      </div>
    )
  },
})
