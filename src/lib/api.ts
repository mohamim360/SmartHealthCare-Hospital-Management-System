

export type ApiResponse<T = unknown> = {
    success: boolean
    statusCode: number
    message: string
    data: T
    meta?: { page: number; limit: number; total: number }
}

export async function apiFetch<T = unknown>(
    url: string,
    options: RequestInit = {},
): Promise<ApiResponse<T>> {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

    const headers: Record<string, string> = {
        ...(!isFormData && options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
    }

    const res = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
    })

    const json = await res.json().catch(() => ({
        success: false,
        statusCode: res.status,
        message: 'Failed to parse response',
        data: null,
    }))

    return json as ApiResponse<T>
}


export const api = {
    get: <T = unknown>(url: string) => apiFetch<T>(url),

    post: <T = unknown>(url: string, body: unknown) =>
        apiFetch<T>(url, { method: 'POST', body: JSON.stringify(body) }),

    postForm: <T = unknown>(url: string, body: FormData) =>
        apiFetch<T>(url, { method: 'POST', body }),

    put: <T = unknown>(url: string, body: unknown) =>
        apiFetch<T>(url, { method: 'PUT', body: JSON.stringify(body) }),

    patch: <T = unknown>(url: string, body: unknown) =>
        apiFetch<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),

    delete: <T = unknown>(url: string) =>
        apiFetch<T>(url, { method: 'DELETE' }),
}


export function buildQuery(params: Record<string, string | number | undefined | null>): string {
    const entries = Object.entries(params).filter(([, v]) => v != null && v !== '')
    if (entries.length === 0) return ''
    return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}
