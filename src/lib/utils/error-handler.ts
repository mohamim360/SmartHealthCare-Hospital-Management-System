import { toast } from 'sonner'
import type { ApiResponse } from '@/lib/api'

/**
 * Shows a success toast notification.
 */
export function showSuccess(message: string) {
    toast.success(message)
}

/**
 * Shows an error toast notification.
 */
export function showError(message: string) {
    toast.error(message)
}

/**
 * Handles an API response: shows error toast if failed, returns success boolean.
 * Use after any API call to centralize error presentation.
 */
export function handleApiResponse<T>(
    res: ApiResponse<T>,
    successMessage?: string,
): boolean {
    if (res.success) {
        if (successMessage) {
            toast.success(successMessage)
        }
        return true
    }

    // Validation error (usually from Zod)
    if (res.statusCode === 400 && res.data && typeof res.data === 'object') {
        const data = res.data as Record<string, unknown>
        if (data.fieldErrors && typeof data.fieldErrors === 'object') {
            const fieldErrors = data.fieldErrors as Record<string, string[]>
            const firstField = Object.keys(fieldErrors)[0]
            if (firstField && fieldErrors[firstField]?.length) {
                toast.error(`${firstField}: ${fieldErrors[firstField][0]}`)
                return false
            }
        }
    }

    // Generic API error
    toast.error(res.message || 'Something went wrong')
    return false
}

/**
 * Handles unexpected / network errors (catch block usage).
 */
export function handleNetworkError(error?: unknown) {
    console.error('Network error:', error)
    toast.error('Network error. Please check your connection and try again.')
}
