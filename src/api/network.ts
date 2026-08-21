import { Network3DNode, Network3DLink, NetworkTelemetrySnapshot } from '../types/network'

export const mock3DNodes: Network3DNode[] = [
  // External Entities
  {
    id: 'node-internet',
    label: 'Internet Gateway',
    type: 'internet',
    ip: 'WAN 198.51.100.1',
    status: 'HEALTHY',
    position: [-10, 4, -4],
    riskScore: 10,
    compromiseProbability: 8,
    activeConnectionsCount: 4200,
    bandwidthMbps: 950,
    anomalies: [],
    zone: 'External',
  },
  {
    id: 'node-c2-external',
    label: 'External C2 Server (185.220.101.5)',
    type: 'c2_server',
    ip: '185.220.101.5',
    status: 'COMPROMISED',
    position: [-12, 8, 2],
    riskScore: 99,
    compromiseProbability: 98,
    activeConnectionsCount: 4,
    bandwidthMbps: 120,
    anomalies: ['Unclassified bulletproof host', 'Target of beacon pulse'],
    zone: 'External',
  },

  // Perimeter & Core
  {
    id: 'node-firewall-01',
    label: 'Perimeter Firewall FW-01',
    type: 'firewall',
    ip: '10.0.0.1',
    status: 'HEALTHY',
    position: [-4, 2, -2],
    riskScore: 14,
    compromiseProbability: 10,
    activeConnectionsCount: 2800,
    bandwidthMbps: 840,
    anomalies: [],
    zone: 'DMZ',
  },
  {
    id: 'node-core-router',
    label: 'Core Backbone Switch SW-01',
    type: 'router',
    ip: '10.0.0.254',
    status: 'HEALTHY',
    position: [0, 0, 0],
    riskScore: 18,
    compromiseProbability: 12,
    activeConnectionsCount: 3400,
    bandwidthMbps: 1100,
    anomalies: [],
    zone: 'Core',
  },

  // Cloud & Servers
  {
    id: 'node-cloud-eks',
    label: 'Cloud Kubernetes VPC',
    type: 'cloud',
    ip: '172.16.0.24',
    status: 'HEALTHY',
    position: [6, 6, -6],
    riskScore: 16,
    compromiseProbability: 11,
    activeConnectionsCount: 890,
    bandwidthMbps: 450,
    anomalies: [],
    zone: 'Cloud VPC',
  },
  {
    id: 'SERVER-07',
    label: 'DB-CORE-07 (Production Database)',
    type: 'server',
    ip: '10.0.2.7',
    status: 'SUSPICIOUS',
    position: [6, 1, -2],
    riskScore: 78,
    compromiseProbability: 76,
    activeConnectionsCount: 64,
    bandwidthMbps: 180,
    anomalies: ['Unauthorized SMB access from DEVICE-042', 'Database read spike'],
    zone: 'Core',
  },

  // User Endpoints
  {
    id: 'DEVICE-042',
    label: 'FIN-WS-042 (Finance Workstation)',
    type: 'workstation',
    ip: '10.0.4.42',
    status: 'COMPROMISED',
    position: [2, -4, 4],
    riskScore: 94,
    compromiseProbability: 94,
    activeConnectionsCount: 38,
    bandwidthMbps: 340,
    anomalies: [
      'DNS DGA Flooding',
      'C2 Beaconing (30s interval)',
      '4.8 GB Exfiltration Outbound',
      'Lateral probe to DB-CORE-07',
    ],
    zone: 'User Subnet',
  },
  {
    id: 'DEVICE-118',
    label: 'ENG-LAP-118 (Engineering Laptop)',
    type: 'laptop',
    ip: '10.0.4.118',
    status: 'SUSPICIOUS',
    position: [6, -4, 2],
    riskScore: 62,
    compromiseProbability: 58,
    activeConnectionsCount: 19,
    bandwidthMbps: 45,
    anomalies: ['Secondary SMB probe received from DEVICE-042'],
    zone: 'User Subnet',
  },
  {
    id: 'node-ws-finance-02',
    label: 'FIN-WS-043 (Finance Workstation)',
    type: 'workstation',
    ip: '10.0.4.43',
    status: 'HEALTHY',
    position: [0, -5, 6],
    riskScore: 15,
    compromiseProbability: 9,
    activeConnectionsCount: 12,
    bandwidthMbps: 20,
    anomalies: [],
    zone: 'User Subnet',
  },

  // IoT
  {
    id: 'node-iot-cam-09',
    label: 'CAM-LOBBY-09 (IoT Camera)',
    type: 'iot',
    ip: '10.0.8.109',
    status: 'HEALTHY',
    position: [-4, -3, 5],
    riskScore: 22,
    compromiseProbability: 14,
    activeConnectionsCount: 3,
    bandwidthMbps: 8,
    anomalies: [],
    zone: 'IoT Network',
  },
]

export const mock3DLinks: Network3DLink[] = [
  // External to Firewall
  {
    id: 'link-inet-fw',
    source: 'node-internet',
    target: 'node-firewall-01',
    status: 'normal',
    trafficSpeed: 1.2,
    bandwidthKbps: 840000,
    protocol: 'HTTPS/TLS',
    isEncrypted: true,
  },
  // C2 to Firewall & DEVICE-042
  {
    id: 'link-c2-fw',
    source: 'node-c2-external',
    target: 'node-firewall-01',
    status: 'compromised',
    trafficSpeed: 2.8,
    bandwidthKbps: 120000,
    protocol: 'TLS (Tunnel)',
    isEncrypted: true,
  },
  // Firewall to Router
  {
    id: 'link-fw-router',
    source: 'node-firewall-01',
    target: 'node-core-router',
    status: 'normal',
    trafficSpeed: 1.5,
    bandwidthKbps: 760000,
    protocol: 'IP/Trunk',
    isEncrypted: false,
  },
  // Router to Servers
  {
    id: 'link-router-db',
    source: 'node-core-router',
    target: 'SERVER-07',
    status: 'suspicious',
    trafficSpeed: 1.8,
    bandwidthKbps: 180000,
    protocol: 'PostgreSQL/SMB',
    isEncrypted: true,
  },
  // Router to Cloud
  {
    id: 'link-router-cloud',
    source: 'node-core-router',
    target: 'node-cloud-eks',
    status: 'normal',
    trafficSpeed: 1.0,
    bandwidthKbps: 450000,
    protocol: 'IPSec VPN',
    isEncrypted: true,
  },
  // Router to Workstations
  {
    id: 'link-router-dev42',
    source: 'node-core-router',
    target: 'DEVICE-042',
    status: 'compromised',
    trafficSpeed: 3.5,
    bandwidthKbps: 340000,
    protocol: 'TCP / DGA DNS',
    isEncrypted: true,
  },
  {
    id: 'link-router-dev118',
    source: 'node-core-router',
    target: 'DEVICE-118',
    status: 'normal',
    trafficSpeed: 0.8,
    bandwidthKbps: 45000,
    protocol: 'HTTPS',
    isEncrypted: true,
  },
  {
    id: 'link-router-dev43',
    source: 'node-core-router',
    target: 'node-ws-finance-02',
    status: 'normal',
    trafficSpeed: 0.6,
    bandwidthKbps: 20000,
    protocol: 'HTTPS/Office',
    isEncrypted: true,
  },
  {
    id: 'link-router-iot',
    source: 'node-core-router',
    target: 'node-iot-cam-09',
    status: 'normal',
    trafficSpeed: 0.4,
    bandwidthKbps: 8000,
    protocol: 'RTSP',
    isEncrypted: false,
  },
  // Lateral movement hops
  {
    id: 'link-lateral-dev42-db7',
    source: 'DEVICE-042',
    target: 'SERVER-07',
    status: 'compromised',
    trafficSpeed: 2.2,
    bandwidthKbps: 48000,
    protocol: 'SMB (Pass-the-Hash)',
    isEncrypted: false,
  },
  {
    id: 'link-lateral-dev42-dev118',
    source: 'DEVICE-042',
    target: 'DEVICE-118',
    status: 'suspicious',
    trafficSpeed: 1.4,
    bandwidthKbps: 1200,
    protocol: 'RPC Sweep',
    isEncrypted: false,
  },
]

export const mockTelemetrySnapshot: NetworkTelemetrySnapshot = {
  timestamp: new Date().toISOString(),
  totalPacketsPerSec: 14280,
  activeBandwidthGbps: 3.42,
  blockedAttacks24h: 348,
  dnsEntropyAverage: 1.84,
  activeThreatCount: 3,
  monitoredEntitiesCount: 1248,
  aiConfidenceRate: 96.4,
}

export async function fetch3DNetworkGraph(): Promise<{ nodes: Network3DNode[]; links: Network3DLink[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ nodes: mock3DNodes, links: mock3DLinks })
    }, 100)
  })
}

export async function fetchTelemetrySnapshot(): Promise<NetworkTelemetrySnapshot> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTelemetrySnapshot), 100)
  })
}
