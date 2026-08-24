import { Network3DNode, Network3DLink } from '../types/network'
import { DeviceTelemetry } from '../types/device'
import { mock3DNodes, mock3DLinks } from '../api/network'

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
function mapDeviceStatusToNodeStatus(status: string): Network3DNode['status'] {
  if (status === 'COMPROMISED') return 'COMPROMISED'
  if (status === 'SUSPICIOUS') return 'SUSPICIOUS'
  if (status === 'ISOLATED') return 'AI_FLAGGED'
  return 'HEALTHY'
}

/**
 * Dynamically builds 3D topology nodes and packet links by merging
 * real inventory devices (from Supabase/local state) with core network backbone nodes.
 */
export function generateDynamic3DTopology(
  devices: DeviceTelemetry[],
  baseNodes: Network3DNode[] = mock3DNodes,
  baseLinks: Network3DLink[] = mock3DLinks
): { nodes: Network3DNode[]; links: Network3DLink[] } {
  // Fixed infrastructure nodes that always stay in the 3D topology
  const fixedInfraNodeIds = new Set([
    'node-internet',
    'node-c2-external',
    'node-firewall-01',
    'node-core-router',
    'node-cloud-eks',
  ])

  const infraNodes = baseNodes.filter((n) => fixedInfraNodeIds.has(n.id))
  const knownBaseNodeMap = new Map<string, Network3DNode>()
  baseNodes.forEach((n) => knownBaseNodeMap.set(n.id, n))

  const finalNodes: Network3DNode[] = [...infraNodes]
  const finalLinks: Network3DLink[] = [...baseLinks]
  const existingLinkKeys = new Set(baseLinks.map((l) => `${l.source}->${l.target}`))

  // Process all devices in inventory
  devices.forEach((dev, index) => {
    // If device is already defined in base fixtures with custom position, use its preset
    if (knownBaseNodeMap.has(dev.id) && !fixedInfraNodeIds.has(dev.id)) {
      const existing = knownBaseNodeMap.get(dev.id)!
      finalNodes.push({
        ...existing,
        status: mapDeviceStatusToNodeStatus(dev.status),
        riskScore: dev.riskScore,
        compromiseProbability: dev.compromiseProbability,
        activeConnectionsCount: dev.metrics?.activeConnections || existing.activeConnectionsCount,
        anomalies: dev.anomalies || existing.anomalies,
      })
      return
    }

    // Calculate dynamic 3D orbital position around Core Switch [0, 0, 0]
    const angle = (index / Math.max(devices.length, 1)) * Math.PI * 2 + 0.5
    const radius = 6.2 + (index % 3) * 1.2
    const posX = parseFloat((Math.cos(angle) * radius).toFixed(2))
    const posZ = parseFloat((Math.sin(angle) * radius).toFixed(2))
    const posY = parseFloat((((index % 4) - 1.5) * 1.1).toFixed(2))

    const newNode: Network3DNode = {
      id: dev.id,
      label: `${dev.hostname} (${dev.department || dev.type})`,
      type: mapDeviceTypeToNodeType(dev.type),
      ip: dev.ip,
      status: mapDeviceStatusToNodeStatus(dev.status),
      position: [posX, posY, posZ],
      riskScore: dev.riskScore || 0,
      compromiseProbability: dev.compromiseProbability || 0,
      activeConnectionsCount: dev.metrics?.activeConnections || 12,
      bandwidthMbps: Math.max(20, Math.round((dev.metrics?.outboundTrafficBytes || 10000000) / 1000000)),
      anomalies: dev.anomalies || [],
      zone: dev.type === 'Server' ? 'Core' : dev.type === 'IoT' ? 'IoT Network' : 'User Subnet',
    }

    finalNodes.push(newNode)

    // Generate link to Core Router
    const linkKey = `${dev.id}->node-core-router`
    if (!existingLinkKeys.has(linkKey)) {
      const isThreat = dev.status === 'COMPROMISED' || dev.status === 'SUSPICIOUS'
      finalLinks.push({
        id: `link-${dev.id.toLowerCase()}-core`,
        source: dev.id,
        target: 'node-core-router',
        status: dev.status === 'COMPROMISED' ? 'compromised' : dev.status === 'SUSPICIOUS' ? 'suspicious' : 'normal',
        trafficSpeed: isThreat ? 1.8 : 0.8,
        bandwidthKbps: isThreat ? 4800 : 950,
        protocol: dev.type === 'Server' ? 'TCP/445' : 'TLS/443',
        isEncrypted: true,
      })
      existingLinkKeys.add(linkKey)
    }
  })

  return { nodes: finalNodes, links: finalLinks }
}
