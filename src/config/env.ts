/**
 * Environment configuration module
 * Connects frontend directly to the Supabase backend.
 * Sourced securely from VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cgkdtqtrbkrcmymzvuaa.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const isProd = import.meta.env.PROD

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  isSupabaseConfigured: Boolean(
    supabaseAnonKey &&
    supabaseAnonKey !== 'your_supabase_anon_or_publishable_key' &&
    supabaseAnonKey !== 'placeholder-anon-key-unconfigured'
  ),
  isDemoMode: import.meta.env.VITE_DEMO_MODE === 'true' || !isProd,
  defaultRefreshIntervalMs: 5000,
}
