export type DeviceStatus = 'HEALTHY' | 'SUSPICIOUS' | 'COMPROMISED' | 'ISOLATED' | 'OFFLINE'

export interface DeviceTelemetry {
  id: string
  hostname: string
  ip: string
  mac: string
  os: string
  type: 'Workstation' | 'Server' | 'Laptop' | 'IoT' | 'Router' | 'Firewall' | 'Cloud' | 'External'
  department: string
  owner: string
  status: DeviceStatus
  riskScore: number // 0 to 100
  compromiseProbability: number // 0 to 100
  lastSeen: string
  firstFlagged?: string
  anomalies: string[]
  metrics: {
    inboundTrafficBytes: number
    outboundTrafficBytes: number
    dnsQueriesPerMin: number
    failedLogins24h: number
    activeConnections: number
    beaconingIntervalSeconds?: number
  }
  isolationStatus: {
    isIsolated: boolean
    isolatedAt?: string
    isolatedBy?: string
  }
}

export interface AnomalyContribution {
  category: string
  contributionPercentage: number
  description: string
  pVal: number
}

export interface NetworkConnection {
  id: string
  sourceIp: string
  sourcePort: number
  destinationIp: string
  destinationPort: number
  destinationHostname?: string
  protocol: 'TCP' | 'UDP' | 'TLS' | 'DNS' | 'HTTP' | 'SSH'
  bytesSent: number
  bytesReceived: number
  timestamp: string
  status: 'ESTABLISHED' | 'SUSPICIOUS' | 'BLOCKED' | 'TERMINATED'
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical'
  reputation: string
  country?: string
}

export interface DnsQueryRecord {
  id: string
  timestamp: string
  domain: string
  queryType: 'A' | 'AAAA' | 'TXT' | 'CNAME' | 'MX'
  entropy: number // Shannon entropy 0 to 5+
  ttl: number
  responseIp?: string
  isDgaDetected: boolean
  confidence: number
}

export interface AuthEventRecord {
  id: string
  timestamp: string
  user: string
  authType: 'SSH' | 'Kerberos' | 'NTLM' | 'RADIUS' | 'Web SSO'
  outcome: 'SUCCESS' | 'FAILURE' | 'ANOMALOUS_HOURS'
  sourceIp: string
  targetResource: string
  geoMismatch: boolean
}
