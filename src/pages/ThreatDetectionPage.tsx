import React, { useState, useMemo } from 'react'
import { ThreatFilterBar } from '../components/threats/ThreatFilterBar'
import { ThreatTable } from '../components/threats/ThreatTable'
import { ThreatDetailModal } from '../components/threats/ThreatDetailModal'
import { MitreAttackMatrix } from '../components/threats/MitreAttackMatrix'
import { FirewallRuleGeneratorModal } from '../components/threats/FirewallRuleGeneratorModal'
import { AttackSimulationDrawer } from '../components/threats/AttackSimulationDrawer'
import { ThreatAlert } from '../types/threat'
import { useAlerts } from '../hooks/useAlerts'
import { useRealtimeAlerts } from '../hooks/useRealtimeAlerts'
import { useDemoScenario } from '../context/DemoScenarioContext'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Skeleton } from '../components/common/Skeleton'
import { Flame, ShieldAlert, RefreshCw, AlertCircle, Zap, Shield, Terminal } from 'lucide-react'

export const ThreatDetectionPage: React.FC = () => {
  const { currentStage } = useDemoScenario()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedThreat, setSelectedThreat] = useState<ThreatAlert | null>(null)
  const [isFirewallModalOpen, setIsFirewallModalOpen] = useState(false)
  const [isSimulationDrawerOpen, setIsSimulationDrawerOpen] = useState(false)

  const { alerts, isLoading, isError, error, refetch, updateStatus } = useAlerts({
    severity: selectedSeverity !== 'ALL' ? selectedSeverity : undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    search: searchQuery,
  })

  // Subscribe to Supabase Realtime changes
  useRealtimeAlerts()

  const filteredThreats = useMemo(() => {
    return alerts.filter((t) => {
      const matchesQuery =
        t.alertCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.deviceIp.includes(searchQuery)

      if (!matchesQuery) return false
      if (selectedSeverity !== 'ALL' && t.severity !== selectedSeverity) return false
      if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false
      return true
    })
  }, [alerts, searchQuery, selectedSeverity, selectedStatus])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
              ALERT REPOSITORY
            </span>
            <span className="text-xs font-mono text-slate-400">
              Telemetry Stage: {currentStage.timeStr} UTC
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
            Threat Detection & Incident Triage Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Correlated multi-vector security alerts with automated Bayesian confidence calibration and IoC attribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Attack Injector Lab Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsSimulationDrawerOpen(true)}
            className="text-xs gap-1.5 font-semibold shadow-red-glow-sm"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Red Team Simulator</span>
          </Button>

          {/* Firewall Script Generator Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFirewallModalOpen(true)}
            className="text-xs gap-1.5 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Generate ACL Rules</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs gap-1.5 border-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Alerts</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <ThreatFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        totalCount={filteredThreats.length}
      />

      {/* Error state if database completely unavailable */}
      {isError && alerts.length === 0 && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>{error || 'Unable to connect to Supabase alerts feed.'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-7 text-xs border-amber-500/40">
            Retry
          </Button>
        </div>
      )}

      {/* Threat Alerts Table or Loading Skeletons */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <ThreatTable
          threats={filteredThreats}
          onSelectThreat={(t) => setSelectedThreat(t)}
        />
      )}

      {/* MITRE ATT&CK Enterprise Tactical Matrix */}
      <MitreAttackMatrix />

      {/* Deep Inspection Modal */}
      <ThreatDetailModal
        threat={selectedThreat}
        onClose={() => setSelectedThreat(null)}
      />

      {/* Multi-Platform Firewall Rule Generator Modal */}
      <FirewallRuleGeneratorModal
        isOpen={isFirewallModalOpen}
        onClose={() => setIsFirewallModalOpen(false)}
        targetIp={selectedThreat?.deviceIp || '185.220.101.5'}
        reason={selectedThreat?.title || 'Perimeter Block for Persistent C2 Beaconing'}
      />

      {/* Red Team Attack Simulator Drawer */}
      <AttackSimulationDrawer
        isOpen={isSimulationDrawerOpen}
        onClose={() => setIsSimulationDrawerOpen(false)}
      />
    </div>
  )
}
