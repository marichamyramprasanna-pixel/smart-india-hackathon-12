import { supabase, isSupabaseReady } from '../lib/supabase'
import { handleSupabaseError } from '../lib/supabaseError'
import { env } from '../config/env'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: string | null
}

export const authService = {
  /**
   * Sign in with Email and Password
   */
  async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    if (!isSupabaseReady()) {
      if (env.isDemoMode) {
        return {
          user: {
            id: 'demo-analyst-uuid',
            email,
            user_metadata: { full_name: 'Lead SOC Analyst', callsign: 'TACTICAL-01' },
          } as any,
          session: { access_token: 'demo-session-token' } as any,
          error: null,
        }
      }
      return {
        user: null,
        session: null,
        error: 'Authentication service unavailable. Please configure Supabase credentials.',
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { user: data.user, session: data.session, error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { user: null, session: null, error: appErr.message }
    }
  },

  /**
   * Sign up a new Analyst Account
   */
  async signUp(
    email: string,
    password: string,
    metadata?: { full_name?: string; callsign?: string }
  ): Promise<AuthResponse> {
    if (!isSupabaseReady()) {
      if (env.isDemoMode) {
        return {
          user: {
            id: 'demo-analyst-uuid',
            email,
            user_metadata: metadata || {},
          } as any,
          session: { access_token: 'demo-session-token' } as any,
          error: null,
        }
      }
      return {
        user: null,
        session: null,
        error: 'Registration service unavailable.',
      }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) throw error
      return { user: data.user, session: data.session, error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { user: null, session: null, error: appErr.message }
    }
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: string | null }> {
    if (!isSupabaseReady()) {
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { error: appErr.message }
    }
  },

  /**
   * Get currently authenticated session
   */
  async getSession(): Promise<{ session: Session | null; error: string | null }> {
    if (!isSupabaseReady()) {
      if (env.isDemoMode) {
        return {
          session: {
            user: {
              id: 'demo-analyst-uuid',
              email: 'analyst@sentinelx.security',
              user_metadata: { full_name: 'Lead SOC Analyst', callsign: 'TACTICAL-01' },
            },
          } as any,
          error: null,
        }
      }
      return { session: null, error: null }
    }

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return { session: data.session, error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { session: null, error: appErr.message }
    }
  },

  /**
   * Listen to auth state changes (sign-in, sign-out, token refresh)
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    if (!isSupabaseReady()) {
      return { unsubscribe: () => {} }
    }

    const { data } = supabase.auth.onAuthStateChange(callback)
    return {
      unsubscribe: () => data.subscription.unsubscribe(),
    }
  },

  /**
   * Request password reset link
   */
  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseReady()) {
      return { success: true, error: null }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      return { success: true, error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { success: false, error: appErr.message }
    }
  },
}
