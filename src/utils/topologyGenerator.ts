import { Network3DNode, Network3DLink } from '../types/network'
import { DeviceTelemetry } from '../types/device'
import { mock3DNodes, mock3DLinks } from '../api/network'
import { DeletedDeviceRecord } from '../services/deviceService'

/**
 * Maps device type string to 3D node visual geometry type
 */
function mapDeviceTypeToNodeType(type: string): Network3DNode['type'] {
  const t = type.toLowerCase()
  if (t.includes('workstation')) return 'workstation'
  if (t.includes('laptop')) return 'laptop'
  if (t.includes('server') || t.includes('database')) return 'server'
  if (t.includes('iot') || t.includes('sensor') || t.includes('camera')) return 'iot'
  if (t.includes('router') || t.includes('switch')) return 'router'
  if (t.includes('firewall')) return 'firewall'
  if (t.includes('cloud')) return 'cloud'
  return 'workstation'
}

/**
 * Maps device status string to NodeHealthStatus
 */
function mapDeviceStatusToNodeStatus(status: string, isIsolated: boolean = false): Network3DNode['status'] {
  if (isIsolated || status === 'ISOLATED') return 'ISOLATED'
  if (status === 'COMPROMISED') return 'COMPROMISED'
  if (status === 'SUSPICIOUS') return 'SUSPICIOUS'
  if (status === 'AI_FLAGGED') return 'AI_FLAGGED'
  return 'HEALTHY'
}

/**
 * Dynamically builds 3D topology nodes and packet links.
 * When devices.length === 0, the topology is BLANK (0 nodes, 0 links).
 * When devices are added, it builds the Core Router hub and connects all added devices.
 */
export function generateDynamic3DTopology(
  devices: DeviceTelemetry[] = [],
  isolatedMap: Record<string, { deviceId: string; hostname?: string; reason?: string }> = {},
  blockedIpsMap: Record<string, { ip: string; ruleId?: string; reason?: string }> = {},
  deletedDevices: DeletedDeviceRecord[] = [],
  showDecommissioned: boolean = false
): { nodes: Network3DNode[]; links: Network3DLink[] } {
  // If there are no active devices added yet, return completely blank topology
  if (devices.length === 0) {
    return { nodes: [], links: [] }
  }

  // 1. Anchor Core Distribution Switch at [0, 0, 0]
  const coreRouterNode: Network3DNode = {
    id: 'node-core-router',
    label: 'Core Distribution Switch (L3-CORE-01)',
    type: 'router',
    ip: '192.168.1.1',
    status: 'HEALTHY',
    position: [0, 0, 0],
    riskScore: 0,
    compromiseProbability: 0,
    activeConnectionsCount: devices.length * 4,
    bandwidthMbps: 1000,
    anomalies: [],
    zone: 'Core',
  }

  // 2. Add Perimeter Firewall at [-5.5, 0, 0]
  const firewallNode: Network3DNode = {
    id: 'node-firewall-01',
    label: 'Next-Gen Perimeter Firewall (NGFW-01)',
    type: 'firewall',
    ip: '192.168.1.254',
    status: 'HEALTHY',
    position: [-5.5, 0.5, 0],
    riskScore: 5,
    compromiseProbability: 2,
    activeConnectionsCount: 45,
    bandwidthMbps: 850,
    anomalies: [],
    zone: 'DMZ',
  }

  const finalNodes: Network3DNode[] = [coreRouterNode, firewallNode]
  const finalLinks: Network3DLink[] = [
    {
      id: 'link-fw-core',
      source: 'node-firewall-01',
      target: 'node-core-router',
      status: 'normal',
      trafficSpeed: 1.0,
      bandwidthKbps: 2400,
      protocol: 'HTTPS/443',
      isEncrypted: true,
    },
  ]
  const existingLinkKeys = new Set(['node-firewall-01->node-core-router'])

  // 3. Connect all present added devices dynamically in orbital space
  devices.forEach((dev, index) => {
    const isIsolated = !!isolatedMap[dev.id] || dev.status === 'ISOLATED' || dev.isolationStatus?.isIsolated
    const nodeStatus = mapDeviceStatusToNodeStatus(dev.status, isIsolated)

    const angle = (index / Math.max(devices.length, 1)) * Math.PI * 2 + 0.4
    const radius = 5.8 + (index % 3) * 1.2
    const posX = parseFloat((Math.cos(angle) * radius).toFixed(2))
    const posZ = parseFloat((Math.sin(angle) * radius).toFixed(2))
    const posY = parseFloat((((index % 4) - 1.5) * 1.1).toFixed(2))

    const newNode: Network3DNode = {
      id: dev.id,
      label: isIsolated
        ? `${dev.hostname} [802.1X QUARANTINE]`
        : `${dev.hostname} (${dev.department || dev.type})`,
      type: mapDeviceTypeToNodeType(dev.type),
      ip: dev.ip,
      status: nodeStatus,
      position: [posX, posY, posZ],
      riskScore: dev.riskScore || (isIsolated ? 85 : 0),
      compromiseProbability: dev.compromiseProbability || (isIsolated ? 90 : 0),
      activeConnectionsCount: isIsolated ? 0 : dev.metrics?.activeConnections || 12,
      bandwidthMbps: isIsolated ? 0 : Math.max(20, Math.round((dev.metrics?.outboundTrafficBytes || 10000000) / 1000000)),
      anomalies: dev.anomalies || (isIsolated ? ['802.1X Port Isolation VLAN-999'] : []),
      zone: isIsolated ? 'User Subnet' : dev.type === 'Server' ? 'Core' : dev.type === 'IoT' ? 'IoT Network' : 'User Subnet',
      isIsolated,
      quarantineReason: isIsolated ? (isolatedMap[dev.id]?.reason || '802.1X Port Quarantine') : undefined,
    }

    finalNodes.push(newNode)

    const linkKey = `${dev.id}->node-core-router`
    if (!existingLinkKeys.has(linkKey)) {
      const isThreat = dev.status === 'COMPROMISED' || dev.status === 'SUSPICIOUS'
      finalLinks.push({
        id: `link-${dev.id.toLowerCase()}-core`,
        source: dev.id,
        target: 'node-core-router',
        status: isIsolated
          ? 'blocked'
          : dev.status === 'COMPROMISED'
          ? 'compromised'
          : dev.status === 'SUSPICIOUS'
          ? 'suspicious'
          : 'normal',
        trafficSpeed: isIsolated ? 0 : isThreat ? 1.8 : 0.8,
        bandwidthKbps: isIsolated ? 0 : isThreat ? 4800 : 950,
        protocol: isIsolated ? 'PORT-SHUT' : dev.type === 'Server' ? 'TCP/445' : 'TLS/443',
        isEncrypted: true,
      })
      existingLinkKeys.add(linkKey)
    }
  })

  // 4. If any adversary IPs are blocked, attach outside firewall
  const blockedIpsList = Object.values(blockedIpsMap)
  if (blockedIpsList.length > 0) {
    blockedIpsList.forEach((rec, idx) => {
      const ipNodeId = `node-blocked-ip-${idx + 1}`
      const posX = parseFloat((-9.0 - idx * 1.5).toFixed(2))
      const posY = parseFloat((idx * 1.2).toFixed(2))
      const posZ = parseFloat((idx * 1.4 - 1.0).toFixed(2))

      finalNodes.push({
        id: ipNodeId,
        label: `BLOCKED IP: ${rec.ip}`,
        type: 'c2_server',
        ip: rec.ip,
        status: 'BLOCKED_PERIMETER',
        position: [posX, posY, posZ],
        riskScore: 98,
        compromiseProbability: 95,
        activeConnectionsCount: 0,
        bandwidthMbps: 0,
        anomalies: [rec.reason || 'Firewall null-route active'],
        zone: 'External',
        quarantineReason: rec.reason || 'Perimeter Null-Route',
      })

      finalLinks.push({
        id: `link-${ipNodeId}-fw`,
        source: ipNodeId,
        target: 'node-firewall-01',
        status: 'blocked',
        trafficSpeed: 0,
        bandwidthKbps: 0,
        protocol: 'DROPPED',
        isEncrypted: false,
      })
    })
  }

  // 5. If user toggled showDecommissioned and has deleted devices
  if (showDecommissioned && deletedDevices.length > 0) {
    deletedDevices.forEach((del, idx) => {
      const angle = (idx / Math.max(deletedDevices.length, 1)) * Math.PI * 2 + 1.2
      const radius = 9.8
      const posX = parseFloat((Math.cos(angle) * radius).toFixed(2))
      const posZ = parseFloat((Math.sin(angle) * radius).toFixed(2))
      const posY = parseFloat((-3.2 + idx * 0.8).toFixed(2))

      finalNodes.push({
        id: del.id,
        label: `${del.hostname} [TOMBSTONE]`,
        type: 'decommissioned',
        ip: del.ip,
        status: 'DECOMMISSIONED',
        position: [posX, posY, posZ],
        riskScore: del.lastRiskScore || 0,
        compromiseProbability: 0,
        activeConnectionsCount: 0,
        bandwidthMbps: 0,
        anomalies: [`Decommissioned: ${del.reason}`],
        zone: 'Archival Vault',
        isDecommissioned: true,
        decommissionReason: del.reason,
      })

      finalLinks.push({
        id: `link-tomb-${del.id}`,
        source: del.id,
        target: 'node-core-router',
        status: 'tombstone',
        trafficSpeed: 0,
        bandwidthKbps: 0,
        protocol: 'ARCHIVED',
        isEncrypted: false,
      })
    })
  }

  return { nodes: finalNodes, links: finalLinks }
}
