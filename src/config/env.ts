/**
 * Environment configuration module
 * Centralizes and validates client-side environment variables.
 * CRITICAL: NEVER include the Supabase service role key in frontend code.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const isProd = import.meta.env.PROD

// Validate production environment configuration
if (isProd) {
  if (!supabaseUrl) {
    // eslint-disable-next-line no-console
    console.warn('Production Warning: Missing VITE_SUPABASE_URL environment variable.')
  }
  if (!supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn('Production Warning: Missing VITE_SUPABASE_ANON_KEY environment variable.')
  }
}

export const env = {
  supabaseUrl: supabaseUrl || 'https://cgkdtqtrbkrcmymzvuaa.supabase.co',
  supabaseAnonKey,
  isSupabaseConfigured: Boolean(
    supabaseAnonKey &&
    supabaseAnonKey !== 'your_supabase_anon_or_publishable_key' &&
    supabaseAnonKey !== 'placeholder-anon-key-unconfigured'
  ),
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  analyticsId: import.meta.env.VITE_ANALYTICS_ID || '',
  isDemoMode: import.meta.env.VITE_DEMO_MODE === 'true' || !isProd,
  defaultRefreshIntervalMs: 5000,
}
