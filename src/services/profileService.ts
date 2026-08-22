import { supabase, isSupabaseReady } from '../lib/supabase'
import { handleSupabaseError } from '../lib/supabaseError'
import { Tables, UpdateDto } from '../types/database'

export interface AnalystProfile {
  id: string
  userId: string
  fullName: string
  callsign: string
  role: string
  clearanceLevel: string
  avatarUrl: string | null
}

export const profileService = {
  /**
   * Fetch profile by Supabase Auth User ID
   */
  async getProfile(userId: string): Promise<{ data: AnalystProfile | null; error: string | null }> {
    if (!isSupabaseReady()) {
      return {
        data: {
          id: 'demo-profile-id',
          userId,
          fullName: 'Agent Alex Rivera',
          callsign: 'SPECTRE-09',
          role: 'Lead Incident Responder',
          clearanceLevel: 'LEVEL 4 TACTICAL',
          avatarUrl: null,
        },
        error: null,
      }
    }

    try {
      const { data, error } = await supabase
        .from('analyst_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error
      if (!data) return { data: null, error: null }

      const row = data as Tables<'analyst_profiles'>
      return {
        data: {
          id: row.id,
          userId: row.user_id,
          fullName: row.full_name,
          callsign: row.callsign,
          role: row.role,
          clearanceLevel: row.clearance_level,
          avatarUrl: row.avatar_url,
        },
        error: null,
      }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { data: null, error: appErr.message }
    }
  },

  /**
   * Update analyst profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<Omit<AnalystProfile, 'id' | 'userId'>>
  ): Promise<{ data: AnalystProfile | null; error: string | null }> {
    if (!isSupabaseReady()) {
      return {
        data: {
          id: 'demo-profile-id',
          userId,
          fullName: updates.fullName || 'Agent Alex Rivera',
          callsign: updates.callsign || 'SPECTRE-09',
          role: updates.role || 'Lead Incident Responder',
          clearanceLevel: updates.clearanceLevel || 'LEVEL 4 TACTICAL',
          avatarUrl: updates.avatarUrl || null,
        },
        error: null,
      }
    }

    try {
      const payload: UpdateDto<'analyst_profiles'> = {
        full_name: updates.fullName,
        callsign: updates.callsign,
        role: updates.role,
        clearance_level: updates.clearanceLevel,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('analyst_profiles')
        .update(payload as any)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      const row = data as Tables<'analyst_profiles'>
      return {
        data: {
          id: row.id,
          userId: row.user_id,
          fullName: row.full_name,
          callsign: row.callsign,
          role: row.role,
          clearanceLevel: row.clearance_level,
          avatarUrl: row.avatar_url,
        },
        error: null,
      }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { data: null, error: appErr.message }
    }
  },
}
