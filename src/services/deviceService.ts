import { z } from 'zod'
import { supabase, isSupabaseReady } from '../lib/supabase'
import { handleSupabaseError } from '../lib/supabaseError'
import { DeviceTelemetry } from '../types/device'
import { env } from '../config/env'
import { Tables, InsertDto, UpdateDto } from '../types/database'

// Validation Schemas using Zod
export const deviceCreateSchema = z.object({
  id: z.string().min(2, 'Device ID is required (e.g. DEVICE-001)').max(64),
  hostname: z.string().min(2, 'Hostname is required').max(128),
  ip_address: z.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, 'Must be a valid IPv4 address (0.0.0.0 - 255.255.255.255)'),
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

export interface DeletedDeviceRecord {
  id: string
  hostname: string
  ip: string
  mac: string
  os: string
  type: string
  department: string
  owner: string
  deletedAt: string
  deletedBy: string
  reason: string
  lastRiskScore: number
}

const DEFAULT_DELETED_DEVICES: DeletedDeviceRecord[] = []

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

// Local storage keys for persistency
const LOCAL_STORAGE_DEVICES_KEY = 'sentinelx_local_devices'
const LOCAL_STORAGE_DELETED_KEY = 'sentinelx_deleted_devices'
const LOCAL_STORAGE_CLEARED_KEY = 'sentinelx_inventory_cleared'

// Resilient In-Memory store
let inMemoryDevices: DeviceTelemetry[] = []
let inMemoryDeleted: DeletedDeviceRecord[] = []
let inMemoryCleared = true

const LEGACY_IDS = new Set(['DEVICE-042', 'SERVER-07', 'FIN-WS-042', 'DEVICE-118', 'DEVICE-LEGACY-019', 'DB-CORE-07'])

export function isInventoryCleared(): boolean {
  try {
    const val = localStorage.getItem(LOCAL_STORAGE_CLEARED_KEY)
    if (val !== null) return val === 'true'
  } catch {}
  return inMemoryCleared
}

function getLocalDevices(): DeviceTelemetry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DEVICES_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((d) => !LEGACY_IDS.has(d.id))
        return cleaned
      }
    }
  } catch {}
  return inMemoryDevices.filter((d) => !LEGACY_IDS.has(d.id))
}

function saveLocalDevices(devices: DeviceTelemetry[]) {
  const cleaned = devices.filter((d) => !LEGACY_IDS.has(d.id))
  inMemoryDevices = cleaned
  try {
    localStorage.setItem(LOCAL_STORAGE_DEVICES_KEY, JSON.stringify(cleaned))
  } catch {}
}

export function getDeletedDevices(): DeletedDeviceRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_KEY)
    const list: DeletedDeviceRecord[] = raw ? JSON.parse(raw) : inMemoryDeleted
    return list.filter((d) => !LEGACY_IDS.has(d.id))
  } catch {
    return inMemoryDeleted.filter((d) => !LEGACY_IDS.has(d.id))
  }
}

export function saveDeletedDevices(list: DeletedDeviceRecord[]) {
  const cleaned = list.filter((d) => !LEGACY_IDS.has(d.id))
  inMemoryDeleted = cleaned
  try {
    localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(cleaned))
  } catch {}
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
    const cleared = isInventoryCleared()
    const localExtra = getLocalDevices()

    let baseDevices: DeviceTelemetry[] = []

    // Only query database if inventory was not explicitly cleared
    if (!cleared && isSupabaseReady()) {
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
        if (data && data.length > 0) {
          baseDevices = (data as Tables<'devices'>[])
            .map(mapRowToDevice)
            .filter((d) => !LEGACY_IDS.has(d.id))
        }
      } catch (err) {
        baseDevices = []
      }
    }

    // Merge in any locally added devices
    const combinedMap = new Map<string, DeviceTelemetry>()
    if (!cleared) {
      baseDevices.forEach((d) => combinedMap.set(d.id, d))
    }
    localExtra.forEach((d) => combinedMap.set(d.id, d))

    let filtered = Array.from(combinedMap.values()).filter((d) => !LEGACY_IDS.has(d.id))

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
  },

  /**
   * READ: Fetch single device by ID
   */
  async getDeviceById(id: string): Promise<{ data: DeviceTelemetry | null; error: string | null }> {
    if (LEGACY_IDS.has(id)) return { data: null, error: 'Device not found' }
    const local = getLocalDevices().find((d) => d.id.toLowerCase() === id.toLowerCase())
    if (local) return { data: local, error: null }

    if (isInventoryCleared() || !isSupabaseReady()) {
      return { data: null, error: 'Device not found' }
    }

    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      if (!data) {
        return { data: null, error: 'Device not found' }
      }

      return { data: mapRowToDevice(data as Tables<'devices'>), error: null }
    } catch (err) {
      return { data: null, error: 'Device not found' }
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

    const localNewDevice: DeviceTelemetry = {
      id: validData.id,
      hostname: validData.hostname,
      ip: validData.ip_address,
      mac: validData.mac_address || '00:00:00:00:00:00',
      os: validData.os || 'Linux Enterprise',
      type: validData.device_type,
      department: validData.department,
      owner: validData.owner,
      status: validData.status,
      riskScore: validData.risk_score,
      compromiseProbability: validData.compromise_probability,
      lastSeen: new Date().toISOString(),
      anomalies: [],
      metrics: {
        inboundTrafficBytes: 124000,
        outboundTrafficBytes: 86000,
        dnsQueriesPerMin: 45,
        failedLogins24h: 0,
        activeConnections: 12,
      },
      isolationStatus: { isIsolated: false },
    }

    // Save locally first so UI always updates instantly
    const existingLocal = getLocalDevices().filter((d) => d.id !== validData.id)
    saveLocalDevices([localNewDevice, ...existingLocal])

    // If it was in deleted list, remove it
    const updatedDeleted = getDeletedDevices().filter((d) => d.id !== validData.id)
    saveDeletedDevices(updatedDeleted)

    // Mark that inventory has active devices
    try {
      localStorage.setItem(LOCAL_STORAGE_CLEARED_KEY, 'false')
    } catch {}

    if (isSupabaseReady()) {
      try {
        const { data, error } = await supabase
          .from('devices')
          .insert(insertPayload as any)
          .select()
          .single()

        if (!error && data) {
          return { data: mapRowToDevice(data as Tables<'devices'>), error: null }
        }
      } catch (err) {
        // Fallback gracefully
      }
    }

    return { data: localNewDevice, error: null }
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

    // Update in local cache
    const currentList = getLocalDevices()
    const updatedList = currentList.map((d) => (d.id === id ? { ...d, ...updates } : d))
    saveLocalDevices(updatedList)

    if (isSupabaseReady()) {
      try {
        const { data, error } = await supabase
          .from('devices')
          .update(payload as any)
          .eq('id', id)
          .select()
          .single()

        if (!error && data) {
          return { data: mapRowToDevice(data as Tables<'devices'>), error: null }
        }
      } catch (err) {}
    }

    return { data: null, error: null }
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
    const currentList = getLocalDevices()
    const updatedList = currentList.map((d) =>
      d.id === deviceId
        ? {
            ...d,
            status: isIsolated ? ('ISOLATED' as const) : ('HEALTHY' as const),
            isolationStatus: {
              isIsolated,
              isolatedAt: isIsolated ? new Date().toISOString() : undefined,
              isolatedBy: isIsolated ? analystName || 'SOC Analyst' : undefined,
            },
          }
        : d
    )
    saveLocalDevices(updatedList)

    if (isSupabaseReady()) {
      try {
        await supabase
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
      } catch (err) {}
    }

    return { success: true, error: null }
  },

  /**
   * DELETE: Remove single device record and archive into Deleted Devices Tombstone Store
   */
  async deleteDevice(id: string, reason: string = 'Decommissioned by SOC Analyst'): Promise<{ success: boolean; error: string | null }> {
    const currentList = getLocalDevices()
    const target = currentList.find((d) => d.id === id) || {
      id,
      hostname: id,
      ip: '192.168.1.50',
      mac: '00:00:00:00:00:00',
      os: 'Enterprise OS',
      type: 'Workstation',
      department: 'General Fleet',
      owner: 'SOC Asset Pool',
      riskScore: 0,
    }
    const remaining = currentList.filter((d) => d.id !== id)
    saveLocalDevices(remaining)

    // Archive to Deleted Store
    const deletedRecord: DeletedDeviceRecord = {
      id: target.id,
      hostname: target.hostname,
      ip: (target as any).ip || '192.168.1.50',
      mac: (target as any).mac || '00:00:00:00:00:00',
      os: (target as any).os || 'Enterprise OS',
      type: (target as any).type || 'Workstation',
      department: (target as any).department || 'General Fleet',
      owner: (target as any).owner || 'SOC Asset Pool',
      deletedAt: new Date().toISOString(),
      deletedBy: 'SOC Security Operations',
      reason,
      lastRiskScore: (target as any).riskScore || 0,
    }
    const existingDeleted = getDeletedDevices().filter((d) => d.id !== id)
    saveDeletedDevices([deletedRecord, ...existingDeleted])

    if (isSupabaseReady()) {
      try {
        await supabase.from('devices').delete().eq('id', id)
      } catch (err) {}
    }

    return { success: true, error: null }
  },

  /**
   * DELETE ALL: Remove all active devices and reset inventory cleanly
   */
  async deleteAllDevices(): Promise<{ success: boolean; count: number }> {
    inMemoryCleared = true
    inMemoryDevices = []
    inMemoryDeleted = []
    saveLocalDevices([])
    saveDeletedDevices([])
    try {
      localStorage.setItem(LOCAL_STORAGE_CLEARED_KEY, 'true')
      localStorage.setItem(LOCAL_STORAGE_DEVICES_KEY, '[]')
      localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, '[]')
    } catch {}

    if (isSupabaseReady()) {
      try {
        await supabase.from('devices').delete().neq('id', '__dummy_never_match__')
      } catch (err) {}
    }

    return { success: true, count: 0 }
  },

  /**
   * RESTORE: Move device from Deleted Store back to Active Inventory
   */
  async restoreDevice(deletedRecord: DeletedDeviceRecord): Promise<{ success: boolean; error: string | null }> {
    try {
      localStorage.setItem(LOCAL_STORAGE_CLEARED_KEY, 'false')
    } catch {}

    const res = await deviceService.createDevice({
      id: deletedRecord.id,
      hostname: deletedRecord.hostname,
      ip_address: deletedRecord.ip,
      mac_address: deletedRecord.mac,
      os: deletedRecord.os,
      device_type: (deletedRecord.type as any) || 'Workstation',
      department: deletedRecord.department,
      owner: deletedRecord.owner,
      status: 'HEALTHY',
      risk_score: 0,
      compromise_probability: 0,
    })

    if (!res.error) {
      const remainingDeleted = getDeletedDevices().filter((d) => d.id !== deletedRecord.id)
      saveDeletedDevices(remainingDeleted)
      return { success: true, error: null }
    }

    return { success: false, error: res.error }
  },

  /**
   * PURGE: Permanently erase tombstone record
   */
  async purgeDeletedDevice(id: string): Promise<{ success: boolean }> {
    const remaining = getDeletedDevices().filter((d) => d.id !== id)
    saveDeletedDevices(remaining)
    return { success: true }
  },
}
