/**
 * Environment configuration module
 * Connects frontend directly to Supabase backend & OpenRouter LLM.
 * Sourced securely from environment variables.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cgkdtqtrbkrcmymzvuaa.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const openrouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY || ''
const openrouterModel = import.meta.env.VITE_OPENROUTER_MODEL || 'openai/gpt-4o-mini'
const isProd = import.meta.env.PROD

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  openrouterApiKey,
  openrouterModel,
  isOpenRouterConfigured: Boolean(openrouterApiKey && openrouterApiKey.startsWith('sk-or-')),
  isSupabaseConfigured: Boolean(
    supabaseAnonKey &&
    supabaseAnonKey !== 'your_supabase_anon_or_publishable_key' &&
    supabaseAnonKey !== 'placeholder-anon-key-unconfigured'
  ),
  isDemoMode: import.meta.env.VITE_DEMO_MODE === 'true' || !isProd,
  defaultRefreshIntervalMs: 5000,
}
