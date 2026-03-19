import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

export type ApiResponse = {
    success: boolean
    message: string
    data: unknown
    meta?: unknown
}

export type ApiTestResult = {
    status: number
    response: ApiResponse | null
    error: string | null
    timestamp: string
}

interface ApiResponsePreviewProps {
    result: ApiTestResult | null
    formatJSON: (obj: unknown) => string
}

export function ApiResponsePreview({
    result,
    formatJSON,
}: ApiResponsePreviewProps) {
    if (!result) return null

    return (
        <div className="space-y-6">
            <Card>
                <CardFooter className="flex-col items-start gap-2 pt-6">
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-medium">Response</h3>
                            <Badge
                                variant={
                                    result.status >= 200 && result.status < 300
                                        ? 'default'
                                        : 'destructive'
                                }
                                className="text-xs"
                            >
                                {result.status}
                            </Badge>
                            <span className="text-xs text-slate-500">
                                {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        {result.error ? (
                            <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-sm text-rose-800">
                                <strong>Error:</strong> {result.error}
                                {result.response && (
                                    <div className="mt-2 text-xs font-mono bg-rose-100 p-2 rounded">
                                        <pre className="whitespace-pre-wrap">
                                            {formatJSON(result.response)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-md p-3 text-xs font-mono overflow-x-auto">
                                <pre className="whitespace-pre-wrap">
                                    {formatJSON(result.response)}
                                </pre>
                            </div>
                        )}
                    </div>
                </CardFooter>
            </Card>

            {!result.error && (
                <Card>
                    <CardHeader>
                        <CardTitle>Response Preview</CardTitle>
                        <CardDescription>
                            Formatted response data visualization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {result.response && (
                                <div>
                                    <div className="text-sm font-medium mb-2">
                                        Status: {result.status}
                                    </div>
                                    <div className="text-sm text-slate-600 space-y-2">
                                        {result.response.success && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                                <span>
                                                    Success: {String(result.response.success)}
                                                </span>
                                            </div>
                                        )}
                                        {result.response.message && (
                                            <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
                                                <strong>Message:</strong>{' '}
                                                {result.response.message}
                                            </div>
                                        )}
                                        {result.response.data != null && (
                                            <div className="mt-2">
                                                <strong>Data:</strong>
                                                <div className="bg-slate-50 rounded p-2 mt-1 text-xs font-mono">
                                                    <pre className="whitespace-pre-wrap">
                                                        {formatJSON(result.response.data)}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
