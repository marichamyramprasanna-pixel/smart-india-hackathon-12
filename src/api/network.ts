import { Network3DNode, Network3DLink, NetworkTelemetrySnapshot } from '../types/network'

export const mock3DNodes: Network3DNode[] = []

export const mock3DLinks: Network3DLink[] = []

export const mockTelemetrySnapshot: NetworkTelemetrySnapshot = {
  timestamp: new Date().toISOString(),
  totalPacketsPerSec: 0,
  activeBandwidthGbps: 0,
  blockedAttacks24h: 0,
  dnsEntropyAverage: 1.0,
  activeThreatCount: 0,
  monitoredEntitiesCount: 0,
  aiConfidenceRate: 98.4,
}

export async function fetch3DNetworkGraph(): Promise<{ nodes: Network3DNode[]; links: Network3DLink[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ nodes: mock3DNodes, links: mock3DLinks })
    }, 50)
  })
}

export async function fetchTelemetrySnapshot(): Promise<NetworkTelemetrySnapshot> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTelemetrySnapshot), 50)
  })
}
