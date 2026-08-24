import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { env } from '../config/env'

/**
 * Singleton Supabase Client
 * Authenticates using public publishable/anon API key against the PostgREST Data API.
 * Base Project URL: https://cgkdtqtrbkrcmymzvuaa.supabase.co
 * Data API URL: https://cgkdtqtrbkrcmymzvuaa.supabase.co/rest/v1/
 */
export const supabase = createClient<Database>(
  env.supabaseUrl,
  env.supabaseAnonKey || 'placeholder-anon-key-unconfigured',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

/**
 * Direct fetch helper to interact with the Supabase PostgREST Data API endpoint:
 * https://cgkdtqtrbkrcmymzvuaa.supabase.co/rest/v1/
 */
export async function supabaseRestFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const cleanPath = endpoint.replace(/^\//, '')
    const url = `${env.supabaseRestUrl}/${cleanPath}`
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        apikey: env.supabaseAnonKey,
        Authorization: `Bearer ${env.supabaseAnonKey}`,
        ...(options.headers || {}),
      },
    })

    if (!res.ok) {
      const errBody = await res.text()
      throw new Error(`Data API Error (${res.status}): ${errBody}`)
    }

    const data = (await res.json()) as T
    return { data, error: null }
  } catch (err: any) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Returns true if real Supabase credentials are configured in the environment
 */
export function isSupabaseReady(): boolean {
  return env.isSupabaseConfigured
}
