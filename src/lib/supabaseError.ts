import { PostgrestError, AuthError } from '@supabase/supabase-js'

export interface AppError {
  message: string
  code?: string
  status?: number
  isAuthError?: boolean
}

/**
 * Transforms raw Supabase / PostgreSQL errors into clear, user-friendly messages.
 * Prevents leakage of internal SQL structures, tokens, or raw stack traces.
 */
export function handleSupabaseError(error: unknown): AppError {
  if (!error) {
    return { message: 'An unknown error occurred.' }
  }

  // Debug log in development only without leaking sensitive payload
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[Supabase Error Diagnostic]', {
      code: (error as any).code,
      message: (error as any).message,
      status: (error as any).status,
    })
  }

  const postgrestErr = error as PostgrestError
  const authErr = error as AuthError

  // Row-Level Security Violation
  if (
    postgrestErr.code === '42501' ||
    postgrestErr.message?.toLowerCase().includes('row-level security') ||
    postgrestErr.message?.toLowerCase().includes('permission denied')
  ) {
    return {
      message: 'You do not have authorization to perform this security operation.',
      code: 'FORBIDDEN',
      status: 403,
    }
  }

  // Duplicate key error
  if (postgrestErr.code === '23505') {
    return {
      message: 'A record with this identifier or code already exists in the security database.',
      code: 'CONFLICT',
      status: 409,
    }
  }

  // Foreign key or check constraint error
  if (postgrestErr.code === '23503' || postgrestErr.code === '23514') {
    return {
      message: 'The submitted telemetry data violates security schema validation rules.',
      code: 'VALIDATION_FAILED',
      status: 400,
    }
  }

  // Auth: Invalid credentials
  if (authErr.message?.toLowerCase().includes('invalid login credentials')) {
    return {
      message: 'Invalid analyst email or password. Please verify your credentials.',
      code: 'INVALID_CREDENTIALS',
      isAuthError: true,
      status: 401,
    }
  }

  // Auth: User already registered
  if (authErr.message?.toLowerCase().includes('user already registered')) {
    return {
      message: 'An analyst account is already registered with this email address.',
      code: 'USER_EXISTS',
      isAuthError: true,
      status: 409,
    }
  }

  // Network offline / connection drops
  if (
    (error as Error).message?.toLowerCase().includes('failed to fetch') ||
    (error as Error).message?.toLowerCase().includes('network')
  ) {
    return {
      message: 'Unable to connect to the Supabase security database. Operating in local buffer mode.',
      code: 'NETWORK_ERROR',
      status: 503,
    }
  }

  return {
    message: postgrestErr.message || 'Operation failed. Please try again.',
    code: postgrestErr.code || 'UNKNOWN_ERROR',
  }
}
