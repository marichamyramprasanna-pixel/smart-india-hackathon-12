import React, { useState, useEffect } from 'react'
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
import { mockDevices, mockDeviceConnections } from '../api/devices'
import { useSentinelAI } from '../context/SentinelAIContext'
import { Button } from '../components/common/Button'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

export const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setCurrentContext } = useSentinelAI()

  const deviceId = id || 'DEVICE-042'
  const device = mockDevices.find((d) => d.id.toLowerCase() === deviceId.toLowerCase()) || mockDevices[0]
  const connections = mockDeviceConnections[device.id] || mockDeviceConnections['DEVICE-042'] || []

  useEffect(() => {
    setCurrentContext({ type: 'device', id: device.id, name: device.hostname })
  }, [device, setCurrentContext])

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
      <DeviceHeader device={device} />

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
          <TabsTrigger value="timeline">Host Timeline</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-5 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <DeviceExplainability />
            <DeviceTrafficChart />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <DnsEntropyChart />
            <AuthAnomalyMatrix />
          </div>
        </TabsContent>

        {/* Tab 2: Network Traffic */}
        <TabsContent value="network" className="space-y-5 mt-4">
          <DeviceTrafficChart />
          <ActiveConnectionsTable connections={connections} />
        </TabsContent>

        {/* Tab 3: DNS Behaviour */}
        <TabsContent value="dns" className="space-y-5 mt-4">
          <DnsEntropyChart />
          <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 text-xs text-purple-200">
            <h4 className="font-mono font-bold text-purple-300 mb-1">
              DNS DGA TUNNELING CORRELATION
            </h4>
            <p className="leading-relaxed">
              DEVICE-042 generated 342 queries/min to pseudorandom dynamic domain names (*.tunnel-c2.biz) with an average Shannon entropy of 4.88. Normal workstation domain entropy baseline is 1.90. This indicates active C2 fallback and command tunneling.
            </p>
          </div>
        </TabsContent>

        {/* Tab 4: Authentication */}
        <TabsContent value="auth" className="space-y-5 mt-4">
          <AuthAnomalyMatrix />
        </TabsContent>

        {/* Tab 5: Connections */}
        <TabsContent value="connections" className="space-y-5 mt-4">
          <ActiveConnectionsTable connections={connections} />
        </TabsContent>

        {/* Tab 6: AI Findings */}
        <TabsContent value="ai-findings" className="space-y-5 mt-4">
          <DeviceExplainability />
        </TabsContent>

        {/* Tab 7: Timeline */}
        <TabsContent value="timeline" className="space-y-5 mt-4">
          <AttackTimelineView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
