export type NodeHealthStatus =
  | 'HEALTHY'
  | 'SUSPICIOUS'
  | 'COMPROMISED'
  | 'AI_FLAGGED'
  | 'ISOLATED'
  | 'BLOCKED_PERIMETER'
  | 'DECOMMISSIONED'

export interface Network3DNode {
  id: string
  label: string
  type:
    | 'internet'
    | 'c2_server'
    | 'firewall'
    | 'router'
    | 'cloud'
    | 'server'
    | 'workstation'
    | 'laptop'
    | 'iot'
    | 'decommissioned'
  ip: string
  status: NodeHealthStatus
  position: [number, number, number] // 3D coordinates (x, y, z)
  riskScore: number
  compromiseProbability: number
  activeConnectionsCount: number
  bandwidthMbps: number
  anomalies: string[]
  zone: 'External' | 'DMZ' | 'Core' | 'User Subnet' | 'Cloud VPC' | 'IoT Network' | 'Archival Vault'
  quarantineReason?: string
  decommissionReason?: string
  isDecommissioned?: boolean
  isIsolated?: boolean
}

export interface Network3DLink {
  id: string
  source: string // node id
  target: string // node id
  status: 'normal' | 'suspicious' | 'compromised' | 'active_beacon' | 'blocked' | 'tombstone'
  trafficSpeed: number // particle velocity
  bandwidthKbps: number
  protocol: string
  isEncrypted: boolean
}

export interface NetworkTelemetrySnapshot {
  timestamp: string
  totalPacketsPerSec: number
  activeBandwidthGbps: number
  blockedAttacks24h: number
  dnsEntropyAverage: number
  activeThreatCount: number
  monitoredEntitiesCount: number
  aiConfidenceRate: number
}
