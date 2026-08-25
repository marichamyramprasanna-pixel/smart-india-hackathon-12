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
 * Dynamically builds 3D topology nodes and packet links by merging:
 * 1. Real active devices
 * 2. 802.1X Quarantined & Isolated devices
 * 3. Perimeter Blocked Adversary IPs
 * 4. Decommissioned / Deleted Tombstone devices
 * 5. Fixed infrastructure backbone (Firewall, Core Router, Cloud VPC)
 */
export function generateDynamic3DTopology(
  devices: DeviceTelemetry[] = [],
  isolatedMap: Record<string, { deviceId: string; hostname?: string; reason?: string }> = {},
  blockedIpsMap: Record<string, { ip: string; ruleId?: string; reason?: string }> = {},
  deletedDevices: DeletedDeviceRecord[] = [],
  showDecommissioned: boolean = true,
  baseNodes: Network3DNode[] = mock3DNodes,
  baseLinks: Network3DLink[] = mock3DLinks
): { nodes: Network3DNode[]; links: Network3DLink[] } {
  // Fixed infrastructure nodes that always anchor the 3D topology
  const fixedInfraNodeIds = new Set([
    'node-internet',
    'node-firewall-01',
    'node-core-router',
    'node-cloud-eks',
  ])

  const infraNodes = baseNodes.filter((n) => fixedInfraNodeIds.has(n.id))
  const knownBaseNodeMap = new Map<string, Network3DNode>()
  baseNodes.forEach((n) => knownBaseNodeMap.set(n.id, n))

  const finalNodes: Network3DNode[] = [...infraNodes]
  const finalLinks: Network3DLink[] = [...baseLinks.filter((l) => fixedInfraNodeIds.has(l.source) && fixedInfraNodeIds.has(l.target))]
  const existingLinkKeys = new Set(finalLinks.map((l) => `${l.source}->${l.target}`))

  // ══════════════════════════════════════════════════════════════════════
  // 1. BLOCKED ADVERSARY IP NODES (Perimeter Firewall Drop Points)
  // ══════════════════════════════════════════════════════════════════════
  const blockedIpsList = Object.values(blockedIpsMap)
  const defaultBlocked = [
    { ip: '185.220.101.5', ruleId: 'FW-DROP-9012', reason: 'Cobalt Strike C2 / Tor Exit' },
    { ip: '194.26.29.114', ruleId: 'FW-DROP-9014', reason: 'LockBit 3.0 Drop Point' },
  ]
  const allBlockedIps = blockedIpsList.length > 0 ? blockedIpsList : defaultBlocked

  allBlockedIps.forEach((rec, idx) => {
    const ipNodeId = `node-blocked-ip-${idx + 1}`
    const angle = (idx / Math.max(allBlockedIps.length, 1)) * 1.2 - 0.6
    const posX = parseFloat((-9.5 - idx * 1.5).toFixed(2))
    const posY = parseFloat((Math.sin(angle) * 3.2 + 2.0).toFixed(2))
    const posZ = parseFloat((Math.cos(angle) * 3.5 - 2.0).toFixed(2))

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
      anomalies: [rec.reason || 'Perimeter firewall ACL drop active'],
      zone: 'External',
      quarantineReason: rec.reason || 'Perimeter Null-Route',
    })

    // Add severed link to Firewall with status 'blocked'
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

  // ══════════════════════════════════════════════════════════════════════
  // 2. ACTIVE & ISOLATED INVENTORY DEVICES
  // ══════════════════════════════════════════════════════════════════════
  devices.forEach((dev, index) => {
    const isIsolated = !!isolatedMap[dev.id] || dev.status === 'ISOLATED' || dev.isolationStatus?.isIsolated
    const nodeStatus = mapDeviceStatusToNodeStatus(dev.status, isIsolated)

    // Calculate dynamic 3D orbital position around Core Switch [0, 0, 0]
    const angle = (index / Math.max(devices.length, 1)) * Math.PI * 2 + 0.4
    const radius = 6.4 + (index % 3) * 1.4
    const posX = parseFloat((Math.cos(angle) * radius).toFixed(2))
    const posZ = parseFloat((Math.sin(angle) * radius).toFixed(2))
    const posY = parseFloat((((index % 4) - 1.5) * 1.2).toFixed(2))

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

    // Link to Core Router
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

  // ══════════════════════════════════════════════════════════════════════
  // 3. DECOMMISSIONED / DELETED TOMBSTONE DEVICES
  // ══════════════════════════════════════════════════════════════════════
  if (showDecommissioned && deletedDevices.length > 0) {
    deletedDevices.forEach((del, idx) => {
      const angle = (idx / Math.max(deletedDevices.length, 1)) * Math.PI * 2 + 1.2
      const radius = 10.5 // Outer Archival Orbit
      const posX = parseFloat((Math.cos(angle) * radius).toFixed(2))
      const posZ = parseFloat((Math.sin(angle) * radius).toFixed(2))
      const posY = parseFloat((-3.5 + idx * 0.8).toFixed(2))

      const tombNode: Network3DNode = {
        id: del.id,
        label: `${del.hostname} [TOMBSTONE ARCHIVE]`,
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
      }

      finalNodes.push(tombNode)

      // Add faint tombstone reference link
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
