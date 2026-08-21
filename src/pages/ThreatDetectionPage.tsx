import React, { useState, useMemo } from 'react'
import { ThreatFilterBar } from '../components/threats/ThreatFilterBar'
import { ThreatTable } from '../components/threats/ThreatTable'
import { ThreatDetailModal } from '../components/threats/ThreatDetailModal'
import { ThreatAlert } from '../types/threat'
import { mockThreats } from '../api/threats'
import { useDemoScenario } from '../context/DemoScenarioContext'
import { Badge } from '../components/common/Badge'
import { Flame, ShieldAlert } from 'lucide-react'

export const ThreatDetectionPage: React.FC = () => {
  const { currentStage } = useDemoScenario()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedThreat, setSelectedThreat] = useState<ThreatAlert | null>(null)

  // Use current active alerts from demo stage or full mock list
  const activeAlerts = useMemo(() => {
    return mockThreats.filter((t) => currentStage.activeAlertIds.includes(t.id))
  }, [currentStage.activeAlertIds])

  const filteredThreats = useMemo(() => {
    return activeAlerts.filter((t) => {
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
  }, [activeAlerts, searchQuery, selectedSeverity, selectedStatus])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl">
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

        <div className="flex items-center gap-3">
          <Badge
            variant={activeAlerts.length > 0 ? 'critical' : 'healthy'}
            pulse={activeAlerts.length > 0}
            className="font-mono text-xs"
          >
            {activeAlerts.length} ACTIVE ALERTS
          </Badge>
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

      {/* Threat Alerts Table */}
      <ThreatTable
        threats={filteredThreats}
        onSelectThreat={(t) => setSelectedThreat(t)}
      />

      {/* Deep Inspection Modal */}
      <ThreatDetailModal
        threat={selectedThreat}
        onClose={() => setSelectedThreat(null)}
      />
    </div>
  )
}
