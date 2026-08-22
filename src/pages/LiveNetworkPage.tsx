import React, { useState } from 'react'
import { Activity, Radio, Filter, Search, ShieldAlert, Lock, CheckCircle, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { LiveEventFeed } from '../components/dashboard/LiveEventFeed'
import { ActiveConnectionsTable } from '../components/device/ActiveConnectionsTable'
import { demoDeviceConnections } from '../data/demo/devices'
import { useDemoScenario } from '../../src/context/DemoScenarioContext'

export const LiveNetworkPage: React.FC = () => {
  const { currentStage } = useDemoScenario()
  const [filterCategory, setFilterCategory] = useState<'all' | 'dns' | 'auth' | 'flows'>('all')

  const allConnections = [
    ...(demoDeviceConnections['DEVICE-042'] || []),
    {
      id: 'conn-live-10',
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
    {
      id: 'conn-live-11',
      sourceIp: '172.16.0.24',
      sourcePort: 6443,
      destinationIp: '10.0.0.254',
      destinationPort: 443,
      protocol: 'TLS' as const,
      bytesSent: 34000000,
      bytesReceived: 21000000,
      timestamp: new Date().toISOString(),
      status: 'ESTABLISHED' as const,
      threatLevel: 'none' as const,
      reputation: 'Cloud EKS API Gateway VPN',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              LIVE TELEMETRY
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              DEMO MODE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
            Real-Time Network Telemetry Stream
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controlled high-frequency telemetry ingestion across NetFlow, IPFIX, Zeek logs, and 802.1X authentications.
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
    </div>
  )
}
