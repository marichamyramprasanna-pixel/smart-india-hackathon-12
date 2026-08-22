import { z } from 'zod'
import { supabase, isSupabaseReady } from '../lib/supabase'
import { handleSupabaseError } from '../lib/supabaseError'
import { DeviceTelemetry } from '../types/device'
import { demoDevices } from '../data/demo/devices'
import { env } from '../config/env'
import { Tables, InsertDto, UpdateDto } from '../types/database'

// Validation Schemas using Zod
export const deviceCreateSchema = z.object({
  id: z.string().min(2, 'Device ID is required (e.g. DEVICE-042)'),
  hostname: z.string().min(2, 'Hostname is required'),
  ip_address: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Must be a valid IPv4 address'),
  mac_address: z.string().optional().default('00:00:00:00:00:00'),
  os: z.string().optional().default('Windows 11 Enterprise'),
  device_type: z.enum(['Workstation', 'Server', 'Laptop', 'IoT', 'Router', 'Firewall', 'Cloud', 'External']).default('Workstation'),
  department: z.string().min(2, 'Department is required'),
  owner: z.string().min(2, 'Owner is required'),
  status: z.enum(['HEALTHY', 'SUSPICIOUS', 'COMPROMISED', 'ISOLATED', 'OFFLINE']).default('HEALTHY'),
  risk_score: z.number().min(0).max(100).default(0),
  compromise_probability: z.number().min(0).max(100).default(0),
})

export const deviceUpdateSchema = deviceCreateSchema.partial()

export type DeviceCreateInput = z.infer<typeof deviceCreateSchema>
export type DeviceUpdateInput = z.infer<typeof deviceUpdateSchema>

/**
 * Maps database Row to frontend DeviceTelemetry interface
 */
function mapRowToDevice(row: Tables<'devices'>): DeviceTelemetry {
  return {
    id: row.id,
    hostname: row.hostname,
    ip: row.ip_address,
    mac: row.mac_address,
    os: row.os,
    type: row.device_type,
    department: row.department,
    owner: row.owner,
    status: row.status,
    riskScore: row.risk_score,
    compromiseProbability: row.compromise_probability,
    lastSeen: row.updated_at,
    anomalies: row.anomalies || [],
    metrics: {
      inboundTrafficBytes: Number(row.inbound_bytes || 0),
      outboundTrafficBytes: Number(row.outbound_bytes || 0),
      dnsQueriesPerMin: row.dns_queries_per_min || 0,
      failedLogins24h: row.failed_logins_24h || 0,
      activeConnections: row.active_connections || 0,
    },
    isolationStatus: {
      isIsolated: row.is_isolated,
      isolatedAt: row.isolated_at || undefined,
      isolatedBy: row.isolated_by || undefined,
    },
  }
}

export const deviceService = {
  /**
   * READ: Fetch all devices with optional search and type filtering
   */
  async getDevices(options?: {
    search?: string
    status?: string
    deviceType?: string
  }): Promise<{ data: DeviceTelemetry[]; error: string | null }> {
    if (!isSupabaseReady() && env.isDemoMode) {
      let filtered = [...demoDevices]
      if (options?.search) {
        const q = options.search.toLowerCase()
        filtered = filtered.filter(
          (d) =>
            d.id.toLowerCase().includes(q) ||
            d.hostname.toLowerCase().includes(q) ||
            d.ip.includes(q) ||
            d.department.toLowerCase().includes(q)
        )
      }
      if (options?.status && options.status !== 'ALL') {
        filtered = filtered.filter((d) => d.status === options.status)
      }
      if (options?.deviceType && options.deviceType !== 'ALL') {
        filtered = filtered.filter((d) => d.type.toUpperCase() === options.deviceType)
      }
      return { data: filtered, error: null }
    }

    try {
      let query = supabase
        .from('devices')
        .select('*')
        .order('risk_score', { ascending: false })

      if (options?.status && options.status !== 'ALL') {
        query = query.eq('status', options.status as any)
      }

      if (options?.deviceType && options.deviceType !== 'ALL') {
        query = query.eq('device_type', options.deviceType as any)
      }

      if (options?.search) {
        query = query.or(
          `hostname.ilike.%${options.search}%,id.ilike.%${options.search}%,ip_address.ilike.%${options.search}%`
        )
      }

      const { data, error } = await query

      if (error) throw error
      if (!data || data.length === 0) {
        // Return isolated demo dataset when in demo mode, otherwise empty production array
        return { data: env.isDemoMode ? demoDevices : [], error: null }
      }

      return { data: (data as Tables<'devices'>[]).map(mapRowToDevice), error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { data: env.isDemoMode ? demoDevices : [], error: appErr.message }
    }
  },

  /**
   * READ: Fetch single device by ID
   */
  async getDeviceById(id: string): Promise<{ data: DeviceTelemetry | null; error: string | null }> {
    if (!isSupabaseReady() && env.isDemoMode) {
      const found = demoDevices.find((d) => d.id.toLowerCase() === id.toLowerCase()) || null
      return { data: found, error: found ? null : 'Device not found' }
    }

    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      if (!data) {
        const foundDemo = env.isDemoMode ? (demoDevices.find((d) => d.id.toLowerCase() === id.toLowerCase()) || null) : null
        return { data: foundDemo, error: foundDemo ? null : 'Device not found' }
      }

      return { data: mapRowToDevice(data as Tables<'devices'>), error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      const foundDemo = env.isDemoMode ? (demoDevices.find((d) => d.id.toLowerCase() === id.toLowerCase()) || null) : null
      return { data: foundDemo, error: appErr.message }
    }
  },

  /**
   * CREATE: Insert a new monitored device row
   */
  async createDevice(input: DeviceCreateInput): Promise<{ data: DeviceTelemetry | null; error: string | null }> {
    const parseResult = deviceCreateSchema.safeParse(input)
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues?.[0]?.message || 'Invalid device input'
      return { data: null, error: firstIssue }
    }

    const validData = parseResult.data
    const insertPayload: InsertDto<'devices'> = {
      id: validData.id,
      hostname: validData.hostname,
      ip_address: validData.ip_address,
      mac_address: validData.mac_address,
      os: validData.os,
      device_type: validData.device_type,
      department: validData.department,
      owner: validData.owner,
      status: validData.status,
      risk_score: validData.risk_score,
      compromise_probability: validData.compromise_probability,
    }

    if (!isSupabaseReady()) {
      const newDevice: DeviceTelemetry = {
        id: validData.id,
        hostname: validData.hostname,
        ip: validData.ip_address,
        mac: validData.mac_address || '00:00:00:00:00:00',
        os: validData.os || 'Linux',
        type: validData.device_type,
        department: validData.department,
        owner: validData.owner,
        status: validData.status,
        riskScore: validData.risk_score,
        compromiseProbability: validData.compromise_probability,
        lastSeen: new Date().toISOString(),
        anomalies: [],
        metrics: {
          inboundTrafficBytes: 0,
          outboundTrafficBytes: 0,
          dnsQueriesPerMin: 0,
          failedLogins24h: 0,
          activeConnections: 0,
        },
        isolationStatus: { isIsolated: false },
      }
      return { data: newDevice, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('devices')
        .insert(insertPayload as any)
        .select()
        .single()

      if (error) throw error
      return { data: mapRowToDevice(data as Tables<'devices'>), error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { data: null, error: appErr.message }
    }
  },

  /**
   * UPDATE: Modify permitted device fields
   */
  async updateDevice(
    id: string,
    updates: DeviceUpdateInput
  ): Promise<{ data: DeviceTelemetry | null; error: string | null }> {
    const parseResult = deviceUpdateSchema.safeParse(updates)
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues?.[0]?.message || 'Validation error'
      return { data: null, error: firstIssue }
    }

    const payload: UpdateDto<'devices'> = {
      ...parseResult.data,
      updated_at: new Date().toISOString(),
    }

    if (!isSupabaseReady()) {
      return { data: null, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('devices')
        .update(payload as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data: mapRowToDevice(data as Tables<'devices'>), error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { data: null, error: appErr.message }
    }
  },

  /**
   * UPDATE: Isolate / Quarantine host
   */
  async setIsolation(
    deviceId: string,
    isIsolated: boolean,
    reason?: string,
    analystName?: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseReady()) {
      return { success: true, error: null }
    }

    try {
      const { error } = await supabase
        .from('devices')
        .update({
          is_isolated: isIsolated,
          status: isIsolated ? 'ISOLATED' : 'HEALTHY',
          isolated_at: isIsolated ? new Date().toISOString() : null,
          isolated_by: isIsolated ? analystName || 'SOC Analyst' : null,
          isolation_reason: isIsolated ? reason || '802.1X Host Quarantine' : null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', deviceId)

      if (error) throw error
      return { success: true, error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { success: false, error: appErr.message }
    }
  },

  /**
   * DELETE: Remove device record
   */
  async deleteDevice(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseReady()) {
      return { success: true, error: null }
    }

    try {
      const { error } = await supabase.from('devices').delete().eq('id', id)
      if (error) throw error
      return { success: true, error: null }
    } catch (err) {
      const appErr = handleSupabaseError(err)
      return { success: false, error: appErr.message }
    }
  },
}
