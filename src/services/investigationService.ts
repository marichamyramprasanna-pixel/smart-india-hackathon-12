import { supabase, isSupabaseReady } from '../lib/supabase'
import { handleSupabaseError } from '../lib/supabaseError'
import { Tables, InsertDto } from '../types/database'

export interface InvestigationNoteRecord {
  id: string
  entityId: string
  analystName: string
  note: string
  createdAt: string
}

export const investigationService = {
  /**
   * Fetch notes for a device or threat entity
   */
  async getNotes(entityId: string): Promise<{ data: InvestigationNoteRecord[]; error: string | null }> {
    if (!isSupabaseReady()) {
      return { data: [], error: null }
    }

    try {
      const { data, error } = await supabase
        .from('investigation_notes')
        .select('*')
        .eq('entity_id', entityId)
        .order('created_at', { ascending: true })

      if (error) throw error
      const mapped: InvestigationNoteRecord[] = ((data || []) as Tables<'investigation_notes'>[]).map((row) => ({
        id: row.id,
        entityId: row.entity_id,
        analystName: row.analyst_name,
        note: row.note,
        createdAt: row.created_at,
      }))
      return { data: mapped, error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { data: [], error: appErr.message }
    }
  },

  /**
   * Append forensic investigation note
   */
  async addNote(
    entityId: string,
    note: string,
    analystName: string = 'SOC Analyst'
  ): Promise<{ data: InvestigationNoteRecord | null; error: string | null }> {
    if (!isSupabaseReady()) {
      return {
        data: {
          id: `local-${Date.now()}`,
          entityId,
          analystName,
          note,
          createdAt: new Date().toISOString(),
        },
        error: null,
      }
    }

    try {
      const insertPayload: InsertDto<'investigation_notes'> = {
        entity_id: entityId,
        entity_type: 'device',
        analyst_name: analystName,
        note,
      }

      const { data, error } = await supabase
        .from('investigation_notes')
        .insert(insertPayload as any)
        .select()
        .single()

      if (error) throw error
      const row = data as Tables<'investigation_notes'>
      return {
        data: {
          id: row.id,
          entityId: row.entity_id,
          analystName: row.analyst_name,
          note: row.note,
          createdAt: row.created_at,
        },
        error: null,
      }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { data: null, error: appErr.message }
    }
  },

  /**
   * Write an audit log entry for containment actions
   */
  async logAudit(
    actionType: string,
    targetEntity: string,
    performedBy: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    if (!isSupabaseReady()) return

    try {
      await supabase.from('audit_logs').insert({
        action_type: actionType,
        target_entity: targetEntity,
        performed_by: performedBy,
        details: (details as any) || {},
      } as any)
    } catch (err) {
      // Non-blocking diagnostic
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('Failed to write audit log', err)
      }
    }
  },
}
