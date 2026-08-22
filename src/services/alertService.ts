import { supabase, isSupabaseReady } from '../lib/supabase'
import { handleSupabaseError } from '../lib/supabaseError'
import { ThreatAlert } from '../types/threat'
import { demoThreats } from '../data/demo/threats'
import { env } from '../config/env'
import { Tables, UpdateDto } from '../types/database'

function mapRowToAlert(row: Tables<'threat_alerts'>): ThreatAlert {
  return {
    id: row.id,
    alertCode: row.alert_code,
    title: row.title,
    deviceId: row.device_id,
    deviceHostname: row.device_hostname,
    deviceIp: row.device_ip,
    threatCategory: row.threat_category as any,
    severity: row.severity,
    confidenceScore: row.confidence_score,
    compromiseProbability: row.compromise_probability,
    detectedAt: row.detected_at,
    status: row.status,
    summary: row.summary,
    indicators: (row.indicators as any) || [],
    aiExplanation: row.ai_explanation,
    remediationSteps: row.remediation_steps || [],
    assignedAnalyst: row.assigned_analyst || undefined,
  }
}

export const alertService = {
  /**
   * READ: Fetch active threat alerts with optional filters
   */
  async getAlerts(filters?: {
    severity?: string
    status?: string
    search?: string
    deviceId?: string
  }): Promise<{ data: ThreatAlert[]; error: string | null }> {
    if (!isSupabaseReady() && env.isDemoMode) {
      let filtered = [...demoThreats]
      if (filters?.severity && filters.severity !== 'ALL') {
        filtered = filtered.filter((t) => t.severity === filters.severity)
      }
      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((t) => t.status === filters.status)
      }
      if (filters?.deviceId) {
        filtered = filtered.filter((t) => t.deviceId === filters.deviceId)
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        filtered = filtered.filter(
          (t) =>
            t.alertCode.toLowerCase().includes(q) ||
            t.title.toLowerCase().includes(q) ||
            t.deviceId.toLowerCase().includes(q)
        )
      }
      return { data: filtered, error: null }
    }

    try {
      let query = supabase
        .from('threat_alerts')
        .select('*')
        .order('detected_at', { ascending: false })

      if (filters?.severity && filters.severity !== 'ALL') {
        query = query.eq('severity', filters.severity as any)
      }

      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status as any)
      }

      if (filters?.deviceId) {
        query = query.eq('device_id', filters.deviceId)
      }

      if (filters?.search) {
        query = query.or(
          `alert_code.ilike.%${filters.search}%,title.ilike.%${filters.search}%,device_id.ilike.%${filters.search}%`
        )
      }

      const { data, error } = await query
      if (error) throw error

      if (!data || data.length === 0) {
        return { data: env.isDemoMode ? demoThreats : [], error: null }
      }

      return { data: (data as Tables<'threat_alerts'>[]).map(mapRowToAlert), error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { data: env.isDemoMode ? demoThreats : [], error: appErr.message }
    }
  },

  /**
   * UPDATE: Triage alert status
   */
  async updateStatus(
    alertId: string,
    status: ThreatAlert['status'],
    analystName?: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseReady()) {
      return { success: true, error: null }
    }

    try {
      const payload: UpdateDto<'threat_alerts'> = {
        status,
        assigned_analyst: analystName,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('threat_alerts')
        .update(payload as any)
        .eq('id', alertId)

      if (error) throw error
      return { success: true, error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { success: false, error: appErr.message }
    }
  },

  /**
   * REALTIME: Subscribe to incoming threat alerts
   */
  subscribeToAlerts(onNewAlert: (alert: ThreatAlert) => void) {
    if (!isSupabaseReady()) {
      return () => {}
    }

    const channel = supabase
      .channel('threat-alerts-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'threat_alerts' },
        (payload) => {
          onNewAlert(mapRowToAlert(payload.new as Tables<'threat_alerts'>))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}
