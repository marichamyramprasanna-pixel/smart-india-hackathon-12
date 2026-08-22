import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { env } from '../config/env'

/**
 * Singleton Supabase Client
 * Authenticates using public anonymous key.
 * Service role keys MUST NEVER be placed here or in frontend code.
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
 * Returns true if real Supabase credentials are configured in the environment
 */
export function isSupabaseReady(): boolean {
  return env.isSupabaseConfigured
}
