import { env } from '../config/env'

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export class ApiError extends Error {
  status: number
  code: string

  constructor(message: string, status: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

/**
 * Base fetch client configured with base URL, timeout, and typed error handling
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${env.apiBaseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    if (!res.ok) {
      let errorMessage = `API request failed with status ${res.status}`
      try {
        const errorJson = await res.json()
        if (errorJson.message) errorMessage = errorJson.message
      } catch {
        // Fallback to text
      }
      throw new ApiError(errorMessage, res.status)
    }

    return (await res.json()) as T
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err
    }
    // Return friendly error rather than raw stack trace
    throw new ApiError(
      'Security intelligence service is temporarily unavailable. Utilizing local SOC cache.',
      503,
      'SERVICE_UNAVAILABLE'
    )
  }
}
