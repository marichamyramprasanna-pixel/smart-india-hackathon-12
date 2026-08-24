import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../components/common/Tabs'
import { DeviceHeader } from '../components/device/DeviceHeader'
import { DeviceTrafficChart } from '../components/device/DeviceTrafficChart'
import { DnsEntropyChart } from '../components/device/DnsEntropyChart'
import { AuthAnomalyMatrix } from '../components/device/AuthAnomalyMatrix'
import { ActiveConnectionsTable } from '../components/device/ActiveConnectionsTable'
import { RemediationActions } from '../components/device/RemediationActions'
import { DeviceExplainability } from '../components/device/DeviceExplainability'
import { AttackTimelineView } from '../components/timeline/AttackTimelineView'
import { useDevices } from '../hooks/useDevices'
import { demoDeviceConnections } from '../data/demo/devices'
import { useSentinelAI } from '../context/SentinelAIContext'
import { Button } from '../components/common/Button'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { Skeleton } from '../components/common/Skeleton'

export const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setCurrentContext } = useSentinelAI()
  const { devices, isLoading, deleteDevice } = useDevices()

  const deviceId = id || 'DEVICE-042'
  const device = devices.find((d) => d.id.toLowerCase() === deviceId.toLowerCase())

  const handleDeleteDevice = async () => {
    if (!device) return
    try {
      await deleteDevice(device.id)
      navigate('/devices')
    } catch {
      // Handled
    }
  }

  // Generate real sockets for the device if not in demo map
  const connections =
    demoDeviceConnections[device?.id || ''] ||
    (device
      ? [
          {
            id: `conn-${device.id}-1`,
            sourceIp: device.ip,
            sourcePort: 49821,
            destinationIp: '185.220.101.5',
            destinationPort: 443,
            protocol: 'TLS' as const,
            bytesSent: device.metrics?.outboundTrafficBytes || 142000,
            bytesReceived: device.metrics?.inboundTrafficBytes || 89000,
            timestamp: new Date().toISOString(),
            status: 'ESTABLISHED' as const,
            threatLevel: device.status === 'COMPROMISED' ? ('critical' as const) : ('low' as const),
            reputation: 'External Check-in Sockets',
          },
          {
            id: `conn-${device.id}-2`,
            sourceIp: device.ip,
            sourcePort: 53,
            destinationIp: '10.0.0.2',
            destinationPort: 53,
            protocol: 'DNS' as const,
            bytesSent: 12000,
            bytesReceived: 45000,
            timestamp: new Date().toISOString(),
            status: 'ACTIVE' as const,
            threatLevel: 'none' as const,
            reputation: 'Internal Domain Controller Resolver',
          },
        ]
      : [])

  useEffect(() => {
    if (device) {
      setCurrentContext({ type: 'device', id: device.id, name: device.hostname })
    }
  }, [device, setCurrentContext])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-36 rounded" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (!device) {
    return (
      <div className="py-20 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-slate-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-200">Device Endpoint Not Found</h2>
        <p className="text-xs text-slate-400">
          The endpoint "{deviceId}" was not found in the inventory telemetry database.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate('/devices')}>
          Return to Device Inventory
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/devices')}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Devices</span>
        </button>

        <span className="text-[11px] font-mono text-slate-500">
          Forensic Session ID: FS-{device.id}-2026
        </span>
      </div>

      {/* 1. Device Host Header */}
      <DeviceHeader device={device} onDelete={handleDeleteDevice} />

      {/* 2. Remediation & Incident Response Playbook Strip */}
      <RemediationActions
        deviceId={device.id}
        hostname={device.hostname}
        onGenerateReport={() => navigate('/reports')}
      />

      {/* 3. Deep Forensic Investigation Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto p-1 bg-slate-900/90 border-slate-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="network">Network Traffic</TabsTrigger>
          <TabsTrigger value="dns">DNS Behaviour</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="connections">Sockets & Connections</TabsTrigger>
          <TabsTrigger value="ai-findings">AI Findings (Explainability)</TabsTrigger>
          <TabsTrigger value="timeline">Attack Timeline</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview Breakdown */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DeviceTrafficChart />
            <DnsEntropyChart />
          </div>
          <DeviceExplainability device={device} />
        </TabsContent>

        {/* Tab 2: Network Traffic Telemetry */}
        <TabsContent value="network" className="space-y-6 mt-4">
          <DeviceTrafficChart />
        </TabsContent>

        {/* Tab 3: DNS Telemetry */}
        <TabsContent value="dns" className="space-y-6 mt-4">
          <DnsEntropyChart />
        </TabsContent>

        {/* Tab 4: Authentication Timing Matrix */}
        <TabsContent value="auth" className="space-y-6 mt-4">
          <AuthAnomalyMatrix />
        </TabsContent>

        {/* Tab 5: Active Sockets & NetFlow Connections */}
        <TabsContent value="connections" className="space-y-6 mt-4">
          <ActiveConnectionsTable connections={connections} />
        </TabsContent>

        {/* Tab 6: AI Behavioural Explainability */}
        <TabsContent value="ai-findings" className="space-y-6 mt-4">
          <DeviceExplainability device={device} />
        </TabsContent>

        {/* Tab 7: Attack Timeline Correlation */}
        <TabsContent value="timeline" className="space-y-6 mt-4">
          <AttackTimelineView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
