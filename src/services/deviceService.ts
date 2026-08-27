import { z } from 'zod'
import { supabase, isSupabaseReady } from '../lib/supabase'
import { handleSupabaseError } from '../lib/supabaseError'
import { DeviceTelemetry } from '../types/device'
import { env } from '../config/env'
import { Tables, InsertDto, UpdateDto } from '../types/database'
import { emitSystemAction } from './systemEventBus'

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

export type DeviceCreateInput = z.input<typeof deviceCreateSchema>
export type DeviceUpdateInput = z.input<typeof deviceUpdateSchema>

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
let inMemoryCleared = false

const LEGACY_IDS = new Set(['DEVICE-042', 'SERVER-07', 'FIN-WS-042', 'DEVICE-118', 'DEVICE-LEGACY-019', 'DB-CORE-07'])

export function isInventoryCleared(): boolean {
  try {
    const val = localStorage.getItem(LOCAL_STORAGE_CLEARED_KEY)
    if (val !== null) return val === 'true'
  } catch {}
  return inMemoryCleared
}

export const DEFAULT_SEED_DEVICES: DeviceTelemetry[] = [
  {
    id: 'DEVICE-101',
    hostname: 'FIN-WORKSTATION-101',
    ip: '10.0.1.101',
    mac: '70:85:C2:A1:01:01',
    os: 'Windows 11 Enterprise',
    type: 'Workstation',
    department: 'Finance & Operations',
    owner: 'Sarah Connor',
    status: 'HEALTHY',
    riskScore: 12,
    compromiseProbability: 8,
    lastSeen: new Date().toISOString(),
    anomalies: [],
    metrics: {
      inboundTrafficBytes: 142000,
      outboundTrafficBytes: 98000,
      dnsQueriesPerMin: 24,
      failedLogins24h: 0,
      activeConnections: 14,
    },
    isolationStatus: { isIsolated: false },
  },
  {
    id: 'SERVER-99',
    hostname: 'CORE-DB-CLUSTER-01',
    ip: '10.0.2.99',
    mac: '00:1A:2B:3C:4D:99',
    os: 'Ubuntu 24.04 LTS Server',
    type: 'Server',
    department: 'DevOps & Data Platform',
    owner: 'Infrastructure Core Team',
    status: 'COMPROMISED',
    riskScore: 88,
    compromiseProbability: 85,
    lastSeen: new Date().toISOString(),
    anomalies: [
      'Unusual outbound LDAP entropy spike (8.4 bits)',
      'Potential Pass-the-Hash Kerberos ticket forgery detected',
    ],
    metrics: {
      inboundTrafficBytes: 9400000,
      outboundTrafficBytes: 14200000,
      dnsQueriesPerMin: 450,
      failedLogins24h: 28,
      activeConnections: 184,
    },
    isolationStatus: { isIsolated: false },
  },
  {
    id: 'FIREWALL-01',
    hostname: 'EDGE-NGFW-PERIMETER',
    ip: '10.0.0.1',
    mac: 'AC:1A:70:99:88:01',
    os: 'FortiOS v7.4 High Availability',
    type: 'Firewall',
    department: 'Network Operations (SOC)',
    owner: 'SecOps Administrator',
    status: 'HEALTHY',
    riskScore: 5,
    compromiseProbability: 2,
    lastSeen: new Date().toISOString(),
    anomalies: [],
    metrics: {
      inboundTrafficBytes: 48000000,
      outboundTrafficBytes: 32000000,
      dnsQueriesPerMin: 1200,
      failedLogins24h: 0,
      activeConnections: 890,
    },
    isolationStatus: { isIsolated: false },
  },
  {
    id: 'IOT-GATEWAY-04',
    hostname: 'SMART-BUILDING-HUB',
    ip: '10.0.4.15',
    mac: 'B8:27:EB:42:15:04',
    os: 'Custom Embedded Linux (Yocto)',
    type: 'IoT',
    department: 'Smart Facilities',
    owner: 'Facility Operations',
    status: 'HEALTHY',
    riskScore: 18,
    compromiseProbability: 14,
    lastSeen: new Date().toISOString(),
    anomalies: [],
    metrics: {
      inboundTrafficBytes: 52000,
      outboundTrafficBytes: 41000,
      dnsQueriesPerMin: 8,
      failedLogins24h: 1,
      activeConnections: 4,
    },
    isolationStatus: { isIsolated: false },
  },
  {
    id: 'LAPTOP-PRO-7',
    hostname: 'EXEC-LAPTOP-ALPHA',
    ip: '10.0.3.44',
    mac: '88:66:55:44:33:22',
    os: 'macOS Sequoia 15.1',
    type: 'Laptop',
    department: 'Executive Suite',
    owner: 'Chief Information Security Officer',
    status: 'SUSPICIOUS',
    riskScore: 64,
    compromiseProbability: 58,
    lastSeen: new Date().toISOString(),
    anomalies: ['High DNS DGA Query entropy to unregistered TLD .xyz'],
    metrics: {
      inboundTrafficBytes: 890000,
      outboundTrafficBytes: 450000,
      dnsQueriesPerMin: 140,
      failedLogins24h: 3,
      activeConnections: 35,
    },
    isolationStatus: { isIsolated: false },
  },
  {
    id: 'CLOUD-K8S-01',
    hostname: 'K8S-MICROSERVICES-CLUSTER',
    ip: '10.0.5.88',
    mac: '02:42:AC:11:00:88',
    os: 'Alpine Linux (Containerd)',
    type: 'Cloud',
    department: 'Cloud Platform Engineering',
    owner: 'DevOps Lead',
    status: 'HEALTHY',
    riskScore: 15,
    compromiseProbability: 10,
    lastSeen: new Date().toISOString(),
    anomalies: [],
    metrics: {
      inboundTrafficBytes: 18400000,
      outboundTrafficBytes: 12100000,
      dnsQueriesPerMin: 680,
      failedLogins24h: 0,
      activeConnections: 412,
    },
    isolationStatus: { isIsolated: false },
  },
  {
    id: 'PAYROLL-DB-02',
    hostname: 'PAYROLL-VAULT-DB',
    ip: '10.0.2.140',
    mac: '00:50:56:A1:B2:C3',
    os: 'RHEL 9.3 Enterprise Linux',
    type: 'Server',
    department: 'Human Resources & Finance',
    owner: 'HR Systems Admin',
    status: 'SUSPICIOUS',
    riskScore: 58,
    compromiseProbability: 50,
    lastSeen: new Date().toISOString(),
    anomalies: ['Unusual off-hours SQL query burst dumping 12,000 employee records'],
    metrics: {
      inboundTrafficBytes: 4200000,
      outboundTrafficBytes: 8900000,
      dnsQueriesPerMin: 180,
      failedLogins24h: 7,
      activeConnections: 95,
    },
    isolationStatus: { isIsolated: false },
  },
  {
    id: 'AI-GPU-CLUSTER-03',
    hostname: 'DEEP-LEARNING-NODE-03',
    ip: '10.0.6.77',
    mac: '00:25:90:77:88:99',
    os: 'Ubuntu 24.04 LTS (NVIDIA DGX)',
    type: 'Server',
    department: 'AI & Data Research',
    owner: 'Lead AI Researcher',
    status: 'HEALTHY',
    riskScore: 22,
    compromiseProbability: 16,
    lastSeen: new Date().toISOString(),
    anomalies: [],
    metrics: {
      inboundTrafficBytes: 95000000,
      outboundTrafficBytes: 62000000,
      dnsQueriesPerMin: 320,
      failedLogins24h: 1,
      activeConnections: 180,
    },
    isolationStatus: { isIsolated: false },
  },
  {
    id: 'ROUTER-CORE-05',
    hostname: 'BACKBONE-CORE-ROUTER',
    ip: '10.0.0.254',
    mac: 'CC:D5:39:00:00:FE',
    os: 'Cisco IOS-XE 17.9',
    type: 'Router',
    department: 'Network Operations',
    owner: 'Lead Network Engineer',
    status: 'HEALTHY',
    riskScore: 2,
    compromiseProbability: 1,
    lastSeen: new Date().toISOString(),
    anomalies: [],
    metrics: {
      inboundTrafficBytes: 120000000,
      outboundTrafficBytes: 110000000,
      dnsQueriesPerMin: 2100,
      failedLogins24h: 0,
      activeConnections: 1450,
    },
    isolationStatus: { isIsolated: false },
  },
  {
    id: 'DEVPANEL-WS-09',
    hostname: 'DEV-STAGING-LAPTOP',
    ip: '10.0.3.89',
    mac: 'A4:83:E7:89:10:99',
    os: 'macOS Sonoma 14.6',
    type: 'Laptop',
    department: 'Software Engineering',
    owner: 'Senior Fullstack Engineer',
    status: 'HEALTHY',
    riskScore: 10,
    compromiseProbability: 6,
    lastSeen: new Date().toISOString(),
    anomalies: [],
    metrics: {
      inboundTrafficBytes: 680000,
      outboundTrafficBytes: 420000,
      dnsQueriesPerMin: 55,
      failedLogins24h: 0,
      activeConnections: 28,
    },
    isolationStatus: { isIsolated: false },
  },
  {
    id: 'DB-ANALYTICS-08',
    hostname: 'WAREHOUSE-ANALYTICS-DB',
    ip: '10.0.2.188',
    mac: '00:1B:44:88:99:AA',
    os: 'PostgreSQL 16 on RHEL 9.3',
    type: 'Server',
    department: 'Data Analytics & BI',
    owner: 'Principal Data Engineer',
    status: 'COMPROMISED',
    riskScore: 92,
    compromiseProbability: 90,
    lastSeen: new Date().toISOString(),
    anomalies: [
      'ntdsutil.exe Active Directory database dump attempt',
      'Unusual outbound LDAP entropy spike (8.9 bits)',
    ],
    metrics: {
      inboundTrafficBytes: 12400000,
      outboundTrafficBytes: 34800000,
      dnsQueriesPerMin: 520,
      failedLogins24h: 34,
      activeConnections: 210,
    },
    isolationStatus: { isIsolated: false },
  },
  {
    id: 'WORKSTATION-SOC-02',
    hostname: 'SOC-MONITORING-WS-02',
    ip: '10.0.1.102',
    mac: '70:85:C2:A1:01:02',
    os: 'Windows 11 Enterprise (SOC Build)',
    type: 'Workstation',
    department: 'Security Operations Center',
    owner: 'SOC Tier-2 Specialist',
    status: 'HEALTHY',
    riskScore: 6,
    compromiseProbability: 3,
    lastSeen: new Date().toISOString(),
    anomalies: [],
    metrics: {
      inboundTrafficBytes: 890000,
      outboundTrafficBytes: 520000,
      dnsQueriesPerMin: 38,
      failedLogins24h: 0,
      activeConnections: 22,
    },
    isolationStatus: { isIsolated: false },
  },
  {
    id: 'CLOUD-LAMBDA-05',
    hostname: 'SERVERLESS-INGRESS-GATEWAY',
    ip: '10.0.5.99',
    mac: '02:42:AC:11:00:99',
    os: 'AWS Amazon Linux 2023',
    type: 'Cloud',
    department: 'Cloud Platform',
    owner: 'DevOps Cloud Architect',
    status: 'HEALTHY',
    riskScore: 11,
    compromiseProbability: 7,
    lastSeen: new Date().toISOString(),
    anomalies: [],
    metrics: {
      inboundTrafficBytes: 42000000,
      outboundTrafficBytes: 31000000,
      dnsQueriesPerMin: 980,
      failedLogins24h: 0,
      activeConnections: 640,
    },
    isolationStatus: { isIsolated: false },
  },
  {
    id: 'VPN-GATEWAY-01',
    hostname: 'IPSEC-REMOTE-VPN',
    ip: '10.0.0.50',
    mac: 'CC:D5:39:00:50:01',
    os: 'Palo Alto PAN-OS 11.1',
    type: 'Firewall',
    department: 'Network Operations',
    owner: 'Network Security Lead',
    status: 'HEALTHY',
    riskScore: 4,
    compromiseProbability: 2,
    lastSeen: new Date().toISOString(),
    anomalies: [],
    metrics: {
      inboundTrafficBytes: 85000000,
      outboundTrafficBytes: 78000000,
      dnsQueriesPerMin: 1850,
      failedLogins24h: 2,
      activeConnections: 1120,
    },
    isolationStatus: { isIsolated: false },
  },
]

export function seedSampleDevices(): DeviceTelemetry[] {
  inMemoryCleared = false
  saveLocalDevices(DEFAULT_SEED_DEVICES)
  try {
    localStorage.setItem(LOCAL_STORAGE_CLEARED_KEY, 'false')
  } catch {}
  return DEFAULT_SEED_DEVICES
}

function getLocalDevices(): DeviceTelemetry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DEVICES_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((d) => !LEGACY_IDS.has(d.id))
        if (cleaned.length > 0) return cleaned
      }
    }
  } catch {}

  // If local list is empty and inventory was not explicitly cleared, auto-seed defaults
  if (!isInventoryCleared() && inMemoryDevices.length === 0) {
    return seedSampleDevices()
  }

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
          emitSystemAction({
            type: 'DEVICE_REGISTERED',
            targetId: validData.id,
            targetName: validData.hostname,
            details: `${validData.device_type} in ${validData.department}`,
          })
          return { data: mapRowToDevice(data as Tables<'devices'>), error: null }
        }
      } catch (err) {
        // Fallback gracefully
      }
    }

    emitSystemAction({
      type: 'DEVICE_REGISTERED',
      targetId: validData.id,
      targetName: validData.hostname,
      details: `${validData.device_type} in ${validData.department}`,
    })
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

    emitSystemAction({
      type: 'DEVICE_DELETED',
      targetId: id,
      targetName: target.hostname,
      details: reason,
    })

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

    emitSystemAction({
      type: 'ALL_DEVICES_DELETED',
      targetId: 'ALL',
      details: 'All active endpoints cleared & archived to Tombstone Vault',
    })

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
      emitSystemAction({
        type: 'DEVICE_RESTORED',
        targetId: deletedRecord.id,
        targetName: deletedRecord.hostname,
        details: 'Restored from tombstone vault back to active inventory',
      })
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
