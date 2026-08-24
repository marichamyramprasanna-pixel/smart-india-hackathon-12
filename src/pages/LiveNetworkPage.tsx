import React, { useState } from 'react'
import { Activity, Radio, Filter, Search, ShieldAlert, Lock, CheckCircle, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { LiveEventFeed } from '../components/dashboard/LiveEventFeed'
import { ActiveConnectionsTable } from '../components/device/ActiveConnectionsTable'
import { SecureIngestionConsole } from '../components/api/SecureIngestionConsole'
import { demoDeviceConnections } from '../data/demo/devices'
import { useDevices } from '../hooks/useDevices'

export const LiveNetworkPage: React.FC = () => {
  const { devices } = useDevices()
  const [filterCategory, setFilterCategory] = useState<'all' | 'dns' | 'auth' | 'flows'>('all')

  // Generate dynamic connections for all live devices in inventory
  const dynamicConnections = devices.flatMap((d) => [
    {
      id: `conn-${d.id}-1`,
      sourceIp: d.ip,
      sourcePort:
        49152 + (Math.abs(d.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 1000),
      destinationIp: d.status === 'COMPROMISED' ? '185.220.101.5' : '10.0.0.1',
      destinationPort: d.status === 'COMPROMISED' ? 443 : 80,
      protocol: 'TLS' as const,
      bytesSent: d.metrics?.outboundTrafficBytes || 240000,
      bytesReceived: d.metrics?.inboundTrafficBytes || 180000,
      timestamp: new Date().toISOString(),
      status: 'ESTABLISHED' as const,
      threatLevel:
        d.status === 'COMPROMISED'
          ? ('critical' as const)
          : d.status === 'SUSPICIOUS'
          ? ('medium' as const)
          : ('none' as const),
      reputation:
        d.status === 'COMPROMISED'
          ? 'Hostile C2 Check-in'
          : `${d.department} Standard Ingress/Egress`,
    },
    {
      id: `conn-${d.id}-2`,
      sourceIp: d.ip,
      sourcePort: 53,
      destinationIp: '10.0.0.2',
      destinationPort: 53,
      protocol: 'DNS' as const,
      bytesSent: 14000,
      bytesReceived: 38000,
      timestamp: new Date().toISOString(),
      status: 'ESTABLISHED' as const,
      threatLevel: 'none' as const,
      reputation: 'Internal Active Directory DNS Resolver',
    },
  ])

  const allConnections = [
    ...dynamicConnections,
    {
      id: 'conn-live-gw',
      sourceIp: '10.0.0.1',
      sourcePort: 443,
      destinationIp: '198.51.100.1',
      destinationPort: 443,
      protocol: 'TLS' as const,
      bytesSent: 142000000,
      bytesReceived: 89000000,
      timestamp: new Date().toISOString(),
      status: 'ESTABLISHED' as const,
      threatLevel: 'none' as const,
      reputation: 'Perimeter Gateway WAN Transit',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              LIVE TELEMETRY
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {devices.length} MONITORED ENDPOINTS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
            Real-Time Network Telemetry & Ingestion Stream
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            High-frequency telemetry ingestion across NetFlow, IPFIX, Zeek logs, and authenticated sensor injection endpoints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="healthy" pulse className="font-mono text-xs">
            INGESTING 14,280 PKTS/S
          </Badge>
        </div>
      </div>

      {/* Grid: Live Event Stream + Active Sockets Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 space-y-5">
          <LiveEventFeed />
        </div>

        <div className="lg:col-span-6 space-y-5">
          <ActiveConnectionsTable connections={allConnections} />
        </div>
      </div>

      {/* Cryptographic Telemetry Ingestion & Injection Console */}
      <SecureIngestionConsole />
    </div>
  )
}
