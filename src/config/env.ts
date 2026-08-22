/**
 * Environment configuration module
 * Centralizes and validates client-side environment variables.
 * CRITICAL: NEVER include the Supabase service role key in frontend code.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cgkdtqtrbkrcmymzvuaa.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  isSupabaseConfigured: Boolean(supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_or_publishable_key'),
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  analyticsId: import.meta.env.VITE_ANALYTICS_ID || 'DEMO_ANALYTICS_ENABLED',
  isDemoMode: true,
  defaultRefreshIntervalMs: 5000,
}
