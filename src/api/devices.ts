import { DeviceTelemetry, NetworkConnection, DnsQueryRecord, AuthEventRecord } from '../types/device'

export const mockDevices: DeviceTelemetry[] = [
  {
    id: 'DEVICE-042',
    hostname: 'FIN-WS-042.internal.corp',
    ip: '10.0.4.42',
    mac: '00:1A:2B:3C:4D:5E',
    os: 'Windows 11 Enterprise (Build 22631)',
    type: 'Workstation',
    department: 'Corporate Finance',
    owner: 'Marcus Vance (Financial Controller)',
    status: 'COMPROMISED',
    riskScore: 94,
    compromiseProbability: 94,
    lastSeen: new Date().toISOString(),
    firstFlagged: '2026-08-21T09:12:00.000Z',
    anomalies: [
      'Abnormal DNS Behaviour (High Shannon Entropy / DGA query flood)',
      'C2 Periodic Beaconing Pattern (30.02s interval, 0.4% jitter)',
      'Outbound Traffic Anomaly (4.8 GB compressed payload exfiltration)',
      'Authentication Anomaly (Off-hours Kerberos ticket request)',
      'Lateral Movement Staging (SMB/RPC probe to SERVER-07)',
    ],
    metrics: {
      inboundTrafficBytes: 124000000,
      outboundTrafficBytes: 4890000000,
      dnsQueriesPerMin: 342,
      failedLogins24h: 14,
      activeConnections: 38,
      beaconingIntervalSeconds: 30.02,
    },
    isolationStatus: {
      isIsolated: false,
    },
  },
  {
    id: 'SERVER-07',
    hostname: 'DB-CORE-07.internal.corp',
    ip: '10.0.2.7',
    mac: '52:54:00:12:34:56',
    os: 'Ubuntu 24.04 LTS',
    type: 'Server',
    department: 'Infrastructure & Data',
    owner: 'System DBA Team',
    status: 'SUSPICIOUS',
    riskScore: 78,
    compromiseProbability: 76,
    lastSeen: new Date().toISOString(),
    firstFlagged: '2026-08-21T09:23:00.000Z',
    anomalies: [
      'Inbound connection from compromised host DEVICE-042 on port 445',
      'Unusual service ticket creation for administrative account',
      'Spike in database read operations on customer records',
    ],
    metrics: {
      inboundTrafficBytes: 890000000,
      outboundTrafficBytes: 210000000,
      dnsQueriesPerMin: 18,
      failedLogins24h: 2,
      activeConnections: 64,
    },
    isolationStatus: {
      isIsolated: false,
    },
  },
  {
    id: 'DEVICE-118',
    hostname: 'ENG-LAP-118.internal.corp',
    ip: '10.0.4.118',
    mac: '3C:22:FB:44:AA:11',
    os: 'macOS Sonoma 14.5',
    type: 'Laptop',
    department: 'Software Engineering',
    owner: 'Elena Rostova (DevOps Lead)',
    status: 'SUSPICIOUS',
    riskScore: 62,
    compromiseProbability: 58,
    lastSeen: new Date().toISOString(),
    firstFlagged: '2026-08-21T09:24:00.000Z',
    anomalies: [
      'Secondary SMB discovery probe received from DEVICE-042',
      'Anomalous SSH connection attempt on non-standard port',
    ],
    metrics: {
      inboundTrafficBytes: 45000000,
      outboundTrafficBytes: 12000000,
      dnsQueriesPerMin: 22,
      failedLogins24h: 1,
      activeConnections: 19,
    },
    isolationStatus: {
      isIsolated: false,
    },
  },
  {
    id: 'GATEWAY-01',
    hostname: 'FW-PERIMETER-01',
    ip: '10.0.0.1',
    mac: '00:0C:29:8B:11:A1',
    os: 'FortiOS 7.4.3',
    type: 'Firewall',
    department: 'Network Operations',
    owner: 'NetOps NOC',
    status: 'HEALTHY',
    riskScore: 12,
    compromiseProbability: 8,
    lastSeen: new Date().toISOString(),
    anomalies: [],
    metrics: {
      inboundTrafficBytes: 48900000000,
      outboundTrafficBytes: 42100000000,
      dnsQueriesPerMin: 1250,
      failedLogins24h: 0,
      activeConnections: 1420,
    },
    isolationStatus: {
      isIsolated: false,
    },
  },
  {
    id: 'CLOUD-VPC-01',
    hostname: 'AWS-EKS-PROD-CLUSTER',
    ip: '172.16.0.24',
    mac: '02:00:AA:BB:CC:DD',
    os: 'AWS Linux / Containerd',
    type: 'Cloud',
    department: 'Cloud Ops',
    owner: 'Platform Engineering',
    status: 'HEALTHY',
    riskScore: 15,
    compromiseProbability: 11,
    lastSeen: new Date().toISOString(),
    anomalies: [],
    metrics: {
      inboundTrafficBytes: 29000000000,
      outboundTrafficBytes: 31000000000,
      dnsQueriesPerMin: 890,
      failedLogins24h: 0,
      activeConnections: 890,
    },
    isolationStatus: {
      isIsolated: false,
    },
  },
  {
    id: 'IOT-CAM-09',
    hostname: 'CAM-LOBBY-09',
    ip: '10.0.8.109',
    mac: 'B8:27:EB:77:99:11',
    os: 'Embedded Linux 5.10',
    type: 'IoT',
    department: 'Physical Security',
    owner: 'Facilities',
    status: 'HEALTHY',
    riskScore: 22,
    compromiseProbability: 14,
    lastSeen: new Date().toISOString(),
    anomalies: [],
    metrics: {
      inboundTrafficBytes: 1500000,
      outboundTrafficBytes: 890000000,
      dnsQueriesPerMin: 4,
      failedLogins24h: 0,
      activeConnections: 3,
    },
    isolationStatus: {
      isIsolated: false,
    },
  },
]

export const mockDeviceConnections: Record<string, NetworkConnection[]> = {
  'DEVICE-042': [
    {
      id: 'conn-01',
      sourceIp: '10.0.4.42',
      sourcePort: 49821,
      destinationIp: '185.220.101.5',
      destinationPort: 443,
      destinationHostname: 'c2-relay.darktunnel.net',
      protocol: 'TLS',
      bytesSent: 4890000000,
      bytesReceived: 1240000,
      timestamp: new Date().toISOString(),
      status: 'SUSPICIOUS',
      threatLevel: 'critical',
      reputation: 'Known Bulletproof Hosting / C2 Infrastructure',
      country: 'NL',
    },
    {
      id: 'conn-02',
      sourceIp: '10.0.4.42',
      sourcePort: 51200,
      destinationIp: '10.0.2.7',
      destinationPort: 445,
      destinationHostname: 'DB-CORE-07.internal.corp',
      protocol: 'TCP',
      bytesSent: 8200000,
      bytesReceived: 21000000,
      timestamp: new Date().toISOString(),
      status: 'SUSPICIOUS',
      threatLevel: 'high',
      reputation: 'Internal High-Value Database Server',
      country: 'Internal',
    },
    {
      id: 'conn-03',
      sourceIp: '10.0.4.42',
      sourcePort: 51204,
      destinationIp: '10.0.4.118',
      destinationPort: 135,
      destinationHostname: 'ENG-LAP-118.internal.corp',
      protocol: 'TCP',
      bytesSent: 120000,
      bytesReceived: 45000,
      timestamp: new Date().toISOString(),
      status: 'SUSPICIOUS',
      threatLevel: 'medium',
      reputation: 'Internal Engineering Endpoint',
      country: 'Internal',
    },
    {
      id: 'conn-04',
      sourceIp: '10.0.4.42',
      sourcePort: 53102,
      destinationIp: '10.0.0.2',
      destinationPort: 53,
      destinationHostname: 'dns-resolver.internal.corp',
      protocol: 'DNS',
      bytesSent: 4500000,
      bytesReceived: 4200000,
      timestamp: new Date().toISOString(),
      status: 'SUSPICIOUS',
      threatLevel: 'high',
      reputation: 'Internal DNS Resolver (DGA Flood Target)',
      country: 'Internal',
    },
  ]
}

export const mockDnsRecords: Record<string, DnsQueryRecord[]> = {
  'DEVICE-042': [
    {
      id: 'dns-01',
      timestamp: '09:14:22',
      domain: 'x9q7f-tunnel-c2.biz',
      queryType: 'TXT',
      entropy: 4.88,
      ttl: 60,
      responseIp: '185.220.101.5',
      isDgaDetected: true,
      confidence: 97.2,
    },
    {
      id: 'dns-02',
      timestamp: '09:14:28',
      domain: 'k4m9v-sync-pulse.cc',
      queryType: 'A',
      entropy: 4.72,
      ttl: 60,
      responseIp: '185.220.101.5',
      isDgaDetected: true,
      confidence: 96.5,
    },
    {
      id: 'dns-03',
      timestamp: '09:15:01',
      domain: 'p0q8w-exfil-node.info',
      queryType: 'AAAA',
      entropy: 4.91,
      ttl: 30,
      responseIp: '185.220.101.6',
      isDgaDetected: true,
      confidence: 98.4,
    },
    {
      id: 'dns-04',
      timestamp: '09:16:10',
      domain: 'login.microsoftonline.com',
      queryType: 'A',
      entropy: 2.14,
      ttl: 300,
      responseIp: '20.190.177.67',
      isDgaDetected: false,
      confidence: 99.8,
    },
    {
      id: 'dns-05',
      timestamp: '09:17:45',
      domain: 'beacon-hb-99021.top',
      queryType: 'TXT',
      entropy: 4.65,
      ttl: 15,
      responseIp: '185.220.101.5',
      isDgaDetected: true,
      confidence: 95.9,
    },
  ]
}

export const mockAuthEvents: Record<string, AuthEventRecord[]> = {
  'DEVICE-042': [
    {
      id: 'auth-01',
      timestamp: '09:12:04',
      user: 'mvance_adm',
      authType: 'Kerberos',
      outcome: 'ANOMALOUS_HOURS',
      sourceIp: '10.0.4.42',
      targetResource: 'FIN-WS-042 (Local Admin Session)',
      geoMismatch: false,
    },
    {
      id: 'auth-02',
      timestamp: '09:12:45',
      user: 'root',
      authType: 'SSH',
      outcome: 'FAILURE',
      sourceIp: '10.0.4.42',
      targetResource: '10.0.2.7 (DB-CORE-07)',
      geoMismatch: false,
    },
    {
      id: 'auth-03',
      timestamp: '09:23:18',
      user: 'svc_backup_db',
      authType: 'NTLM',
      outcome: 'SUCCESS',
      sourceIp: '10.0.4.42',
      targetResource: '10.0.2.7 (DB-CORE-07 Pass-the-Hash)',
      geoMismatch: true,
    },
  ]
}

export async function fetchDevices(): Promise<DeviceTelemetry[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDevices), 100)
  })
}

export async function fetchDeviceById(id: string): Promise<DeviceTelemetry | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dev = mockDevices.find((d) => d.id === id) || null
      resolve(dev)
    }, 100)
  })
}

export async function fetchDeviceConnections(id: string): Promise<NetworkConnection[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDeviceConnections[id] || []), 100)
  })
}

export async function fetchDeviceDnsLogs(id: string): Promise<DnsQueryRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDnsRecords[id] || []), 100)
  })
}

export async function fetchDeviceAuthLogs(id: string): Promise<AuthEventRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockAuthEvents[id] || []), 100)
  })
}
