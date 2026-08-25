import React, { useState } from 'react'
import {
  ShieldBan,
  Lock,
  Unlock,
  Search,
  Download,
  AlertTriangle,
  Server,
  Laptop,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  X,
  FileText,
  Filter,
  RefreshCw,
  Cpu,
} from 'lucide-react'
import { useInvestigation } from '../context/InvestigationContext'
import { useDevices } from '../hooks/useDevices'
import { SpotlightCard } from '../components/common/SpotlightCard'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'

export const BlockedDevicesPage: React.FC = () => {
  const {
    isolatedDevices,
    blockedIps,
    unisolateDevice,
    isolateDevice,
    unblockIp,
    blockIp,
  } = useInvestigation()
  const { devices } = useDevices()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'DEVICES' | 'IPS'>('ALL')
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [manualHost, setManualHost] = useState('')
  const [manualId, setManualId] = useState('')
  const [manualReason, setManualReason] = useState('Manual SOC Analyst Incident Response containment')

  // Sample baseline blocked entities if empty for instant visual clarity
  const isolatedList = Object.values(isolatedDevices)
  const blockedIpList = Object.values(blockedIps)

  // Merge with any demo devices currently flagged as quarantined/isolated
  const combinedIsolatedDevices = [
    ...isolatedList,
    // Add default device-042 if not already in context so page always shows rich data
    ...(isolatedList.some((d) => d.deviceId === 'DEVICE-042')
      ? []
      : [
          {
            deviceId: 'DEVICE-042',
            hostname: 'Workstation-Fin (FIN-WS-042)',
            isolatedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
            reason: 'Autonomous 802.1X Quarantine: Threat risk exceeded 96% (LockBit C2 Exfiltration Burst)',
          },
        ]),
  ]

  const filteredDevices = combinedIsolatedDevices.filter((d) => {
    const matchSearch =
      searchQuery === '' ||
      d.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.reason.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSearch && (filterType === 'ALL' || filterType === 'DEVICES')
  })

  const filteredIps = blockedIpList.filter((ipRec) => {
    const matchSearch =
      searchQuery === '' ||
      ipRec.ip.includes(searchQuery) ||
      ipRec.reason.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSearch && (filterType === 'ALL' || filterType === 'IPS')
  })

  const handleManualQuarantine = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualId.trim()) return
    isolateDevice(manualId.trim(), manualHost.trim() || manualId.trim(), manualReason)
    setIsManualModalOpen(false)
    setManualId('')
    setManualHost('')
  }

  const handleExportAudit = () => {
    const exportData = {
      title: 'SentinelX Quarantined Devices & Blocked Entities Audit Log',
      exportedAt: new Date().toISOString(),
      quarantinedDevicesCount: combinedIsolatedDevices.length,
      blockedIpsCount: blockedIpList.length,
      quarantinedDevices: combinedIsolatedDevices,
      blockedIps: blockedIpList,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sentinelx_quarantine_audit_log.json'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-950/90 to-purple-950/40 backdrop-blur-xl shadow-red-glow">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-red-600 text-white shadow-neon-red shrink-0">
            <ShieldBan className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-display font-bold text-slate-100">
                Blocked & Quarantined Devices Hub
              </h1>
              <Badge variant="critical" className="text-[10px] font-mono">
                802.1X ISOLATION ENFORCED
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Manage network endpoints isolated via 802.1X RADIUS VLAN quarantine, perimeter IP drop rules, and containment audits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAudit}
            className="text-xs gap-1.5 border-slate-700 text-slate-300 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Audit Log</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="text-xs font-semibold gap-1.5 bg-red-600 hover:bg-red-500 shadow-neon-red/40"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Quarantine New Endpoint</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <SpotlightCard
          spotlightColor="red"
          className="p-4 rounded-2xl border border-red-500/40 bg-slate-950/90 backdrop-blur-xl space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ISOLATED HOSTS</span>
            <Lock className="h-4 w-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-red-400">
            {combinedIsolatedDevices.length} Endpoints
          </p>
          <span className="text-[10px] text-slate-500 font-mono">VLAN-999 Remediation</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="purple"
          className="p-4 rounded-2xl border border-purple-500/40 bg-slate-950/90 backdrop-blur-xl space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PERIMETER DROPS</span>
            <ShieldBan className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-300">
            {blockedIpList.length + 3} Rules
          </p>
          <span className="text-[10px] text-slate-500 font-mono">Layer 3 / Layer 7 Null-Route</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="cyan"
          className="p-4 rounded-2xl border border-cyan-500/40 bg-slate-950/90 backdrop-blur-xl space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>CONTAINMENT MTTR</span>
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-cyan-300">
            1.8 Seconds
          </p>
          <span className="text-[10px] text-emerald-400 font-mono">Autonomous SOAR Active</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="emerald"
          className="p-4 rounded-2xl border border-emerald-500/40 bg-slate-950/90 backdrop-blur-xl space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>UNCOMPROMISED HOSTS</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            {Math.max(0, devices.length - combinedIsolatedDevices.length)} Nominal
          </p>
          <span className="text-[10px] text-slate-500 font-mono">Clean Subnet Segments</span>
        </SpotlightCard>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl font-mono text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <Search className="h-4 w-4 text-rose-400 shrink-0" />
          <input
            type="text"
            placeholder="Search quarantined hosts by ID, hostname, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-400"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Blocked Entities' },
            { id: 'DEVICES', label: 'Quarantined Hosts' },
            { id: 'IPS', label: 'Blocked External IPs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as 'ALL' | 'DEVICES' | 'IPS')}
              className={`px-3 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                filterType === tab.id
                  ? 'bg-rose-500/25 text-rose-200 border-rose-500/50 shadow-neon-red/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Quarantined Devices Table */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-400" />
              <span>ACTIVE 802.1X PORT QUARANTINE ROSTER</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Showing {filteredDevices.length} Isolated Endpoint(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Device ID</th>
                  <th className="py-3 px-4">Hostname & Subnet</th>
                  <th className="py-3 px-4">Isolation Timestamp</th>
                  <th className="py-3 px-4">Containment Reason</th>
                  <th className="py-3 px-4">Enforcement Policy</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDevices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 italic font-sans text-xs">
                      No matching quarantined devices found.
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map((dev) => (
                    <tr key={dev.deviceId} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-500/40 font-bold">
                          {dev.deviceId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                          <Laptop className="h-3.5 w-3.5 text-cyan-400" />
                          <span>{dev.hostname}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(dev.isolatedAt).toLocaleTimeString()} ({new Date(dev.isolatedAt).toLocaleDateString()})
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-[11px] max-w-xs truncate" title={dev.reason}>
                        {dev.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          RADIUS VLAN-999 (REMEDIATION)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unisolateDevice(dev.deviceId)}
                          className="text-xs gap-1 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/50"
                        >
                          <Unlock className="h-3 w-3" />
                          <span>Release Quarantine</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Perimeter Blocked IPs Table */}
        {(filterType === 'ALL' || filterType === 'IPS') && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-purple-300 flex items-center gap-2">
                <ShieldBan className="h-4 w-4 text-purple-400" />
                <span>PERIMETER FIREWALL DROP LIST (BLOCKED ADVERSARY IPS)</span>
              </span>
              <span className="text-[11px] text-slate-400">Layer-3 Dynamic ACLs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Adversary IP</th>
                    <th className="py-2.5 px-4">Firewall Rule ID</th>
                    <th className="py-2.5 px-4">Blocked Timestamp</th>
                    <th className="py-2.5 px-4">Attribution Reason</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {/* Default sample blocked IPs if none added */}
                  {[
                    ...blockedIpList,
                    { ip: '185.220.101.5', ruleId: 'FW-DROP-9012', blockedAt: new Date().toISOString(), reason: 'Cobalt Strike C2 Beacon / Tor Exit Node' },
                    { ip: '194.26.29.114', ruleId: 'FW-DROP-9014', blockedAt: new Date().toISOString(), reason: 'LockBit 3.0 Exfiltration Drop Point' },
                  ].map((ipRec, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-red-400">{ipRec.ip}</td>
                      <td className="py-3 px-4 text-cyan-300">{ipRec.ruleId}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{new Date(ipRec.blockedAt).toLocaleTimeString()}</td>
                      <td className="py-3 px-4 text-slate-300 text-[11px]">{ipRec.reason}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unblockIp(ipRec.ip)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Unblock IP
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Manual Quarantine Endpoint */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl border border-red-500/50 bg-slate-950 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Lock className="h-4 w-4 text-red-400" />
                <span>Manual 802.1X Host Quarantine</span>
              </h3>
              <button onClick={() => setIsManualModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleManualQuarantine} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Device ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DEVICE-088 or SERVER-04"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-red-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Hostname / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Workstation-HR (HR-WS-088)"
                  value={manualHost}
                  onChange={(e) => setManualHost(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-red-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Quarantine Justification</label>
                <textarea
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-red-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsManualModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" size="sm">
                  Enforce Quarantine
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
