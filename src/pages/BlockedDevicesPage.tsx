import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  ArrowRight,
  Eye,
  Check,
} from 'lucide-react'
import { useInvestigation } from '../context/InvestigationContext'
import { useDevices } from '../hooks/useDevices'
import { SpotlightCard } from '../components/common/SpotlightCard'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'

export const BlockedDevicesPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    isolatedDevices,
    blockedIps,
    unisolateDevice,
    isolateDevice,
    unblockIp,
    blockIp,
    addInvestigationNote,
  } = useInvestigation()
  const { devices, createDevice } = useDevices()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'DEVICES' | 'IPS'>('ALL')

  // Manual Quarantine Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [manualHost, setManualHost] = useState('')
  const [manualId, setManualId] = useState('')
  const [manualReason, setManualReason] = useState('Manual SOC Analyst Incident Response containment')

  // Unblock IP -> Onboard & Inspect Prompt Modal
  const [unblockTarget, setUnblockTarget] = useState<{ ip: string; ruleId: string; reason: string } | null>(null)
  const [onboardHostname, setOnboardHostname] = useState('')
  const [onboardDeviceId, setOnboardDeviceId] = useState('')
  const [onboardDeviceType, setOnboardDeviceType] = useState<'External' | 'Server' | 'Workstation' | 'Router'>('External')
  const [isProcessingOnboard, setIsProcessingOnboard] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const isolatedList = Object.values(isolatedDevices)
  const blockedIpList = Object.values(blockedIps)

  const combinedIsolatedDevices = [
    ...isolatedList,
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

  const sampleDefaultIps = [
    { ip: '185.220.101.5', ruleId: 'FW-DROP-9012', blockedAt: new Date().toISOString(), reason: 'Cobalt Strike C2 Beacon / Tor Exit Node' },
    { ip: '194.26.29.114', ruleId: 'FW-DROP-9014', blockedAt: new Date().toISOString(), reason: 'LockBit 3.0 Exfiltration Drop Point' },
  ]

  const activeBlockedIpsMap = new Map<string, { ip: string; ruleId: string; blockedAt: string; reason: string }>()
  sampleDefaultIps.forEach((rec) => activeBlockedIpsMap.set(rec.ip, rec))
  blockedIpList.forEach((rec) => activeBlockedIpsMap.set(rec.ip, rec))

  const allActiveBlockedIps = Array.from(activeBlockedIpsMap.values())

  const filteredIps = allActiveBlockedIps.filter((ipRec) => {
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
    setSuccessToast(`Quarantine enforced on ${manualId.trim()} via 802.1X.`)
    setTimeout(() => setSuccessToast(null), 3000)
  }

  // Trigger unblock prompt flow
  const handleInitiateUnblock = (ipRec: { ip: string; ruleId: string; reason: string }) => {
    const generatedId = `DEV-IP-${ipRec.ip.split('.').slice(-2).join('-')}`
    const generatedHost = `Host-${ipRec.ip.replace(/\./g, '-')}`
    setOnboardDeviceId(generatedId)
    setOnboardHostname(generatedHost)
    setUnblockTarget(ipRec)
  }

  // Confirm unblock and onboard to Devices Inventory for continuous inspection
  const handleConfirmOnboardAndInspect = async () => {
    if (!unblockTarget) return
    setIsProcessingOnboard(true)

    try {
      // 1. Unblock IP from firewall
      unblockIp(unblockTarget.ip)

      // 2. Create device in inventory
      const newDevId = onboardDeviceId.trim() || `DEV-IP-${unblockTarget.ip.split('.').slice(-2).join('-')}`
      const newHost = onboardHostname.trim() || `Host-${unblockTarget.ip.replace(/\./g, '-')}`

      await createDevice({
        id: newDevId,
        hostname: newHost,
        ip_address: unblockTarget.ip,
        mac_address: `00:0C:29:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}`,
        os: 'Linux Enterprise / Edge Gateway',
        device_type: onboardDeviceType,
        department: 'Security Monitoring & External Triage',
        owner: 'Network Operations (Automated Onboarding)',
        status: 'HEALTHY',
        risk_score: 15,
        compromise_probability: 12,
      })

      addInvestigationNote(
        newDevId,
        `[IP UNBLOCKED & ONBOARDED] IP ${unblockTarget.ip} unblocked from perimeter firewall and enrolled into Devices Inventory for continuous telemetry inspection.`
      )

      setIsProcessingOnboard(false)
      setUnblockTarget(null)

      // 3. Immediately navigate to the device detail inspection page
      navigate(`/devices/${newDevId}`)
    } catch {
      setIsProcessingOnboard(false)
      setUnblockTarget(null)
    }
  }

  const handleJustUnblock = () => {
    if (!unblockTarget) return
    unblockIp(unblockTarget.ip)
    setSuccessToast(`Unblocked IP ${unblockTarget.ip} without adding to devices.`)
    setTimeout(() => setSuccessToast(null), 3000)
    setUnblockTarget(null)
  }

  const handleExportAudit = () => {
    const exportData = {
      title: 'SentinelX Quarantined Devices & Blocked Entities Audit Log',
      exportedAt: new Date().toISOString(),
      quarantinedDevicesCount: combinedIsolatedDevices.length,
      blockedIpsCount: allActiveBlockedIps.length,
      quarantinedDevices: combinedIsolatedDevices,
      blockedIps: allActiveBlockedIps,
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

      {/* Toast Notice */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 p-3.5 rounded-2xl border border-emerald-500/50 bg-slate-950/95 text-emerald-300 text-xs font-mono shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

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
            {allActiveBlockedIps.length} Rules
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
            <span>ACTIVE DEVICES</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            {devices.length} Monitored
          </p>
          <span className="text-[10px] text-slate-500 font-mono">Behavioral Inspection Active</span>
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
      {(filterType === 'ALL' || filterType === 'DEVICES') && (
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
                          onClick={() => {
                            unisolateDevice(dev.deviceId)
                            setSuccessToast(`Quarantine released for ${dev.hostname}. 802.1X Port reopened.`)
                            setTimeout(() => setSuccessToast(null), 3000)
                          }}
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
      )}

      {/* Perimeter Blocked IPs Table */}
      {(filterType === 'ALL' || filterType === 'IPS') && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-purple-300 flex items-center gap-2">
              <ShieldBan className="h-4 w-4 text-purple-400" />
              <span>PERIMETER FIREWALL DROP LIST (BLOCKED ADVERSARY IPS)</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Showing {filteredIps.length} Blocked IP(s)
            </span>
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
                {filteredIps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 italic font-sans text-xs">
                      No blocked IPs in current view.
                    </td>
                  </tr>
                ) : (
                  filteredIps.map((ipRec, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-red-400">{ipRec.ip}</td>
                      <td className="py-3 px-4 text-cyan-300">{ipRec.ruleId}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(ipRec.blockedAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px]">{ipRec.reason}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInitiateUnblock(ipRec)}
                          className="text-xs gap-1.5 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50"
                        >
                          <Unlock className="h-3 w-3 text-cyan-400" />
                          <span>Unblock IP</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Onboard Unblocked IP as Monitored Device & Inspect */}
      {unblockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-2xl border-2 border-cyan-500 bg-slate-950 shadow-neon-cyan space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-300">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>IP UNBLOCKED: {unblockTarget.ip}</span>
                  </h3>
                  <p className="text-[11px] text-cyan-300">Add to Devices Inventory for Continuous Inspection?</p>
                </div>
              </div>
              <button onClick={() => setUnblockTarget(null)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs leading-relaxed text-slate-300">
              <p>
                You are unblocking IP <strong className="text-cyan-300">{unblockTarget.ip}</strong> from the perimeter firewall.
              </p>
              <p className="text-slate-400 text-[11px]">
                Do you want SentinelX to enroll this IP as a monitored endpoint in your <strong>Devices Inventory</strong> so you can immediately inspect its behavioral telemetry, active socket connections, and DNS entropy like all other network assets?
              </p>
            </div>

            {/* Config Fields */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Assigned Device ID</label>
                  <input
                    type="text"
                    value={onboardDeviceId}
                    onChange={(e) => setOnboardDeviceId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-300 font-bold focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Hostname Description</label>
                  <input
                    type="text"
                    value={onboardHostname}
                    onChange={(e) => setOnboardHostname(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Asset Classification Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['External', 'Server', 'Workstation', 'Router'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOnboardDeviceType(t)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all text-center ${
                        onboardDeviceType === t
                          ? 'bg-cyan-500/25 text-cyan-200 border-cyan-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleJustUnblock}
                className="text-xs text-slate-400 hover:text-white"
              >
                Just Unblock (Don't Add)
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUnblockTarget(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isProcessingOnboard}
                  onClick={handleConfirmOnboardAndInspect}
                  className="text-xs font-semibold gap-1.5 bg-cyan-600 hover:bg-cyan-500 shadow-neon-cyan/40"
                >
                  {isProcessingOnboard ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5" />
                  )}
                  <span>Yes, Add to Devices & Inspect Now</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Manual Quarantine Endpoint */}
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
