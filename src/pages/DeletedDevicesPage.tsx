import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trash2,
  RotateCcw,
  Search,
  Download,
  AlertTriangle,
  Server,
  Laptop,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
  FileText,
  Filter,
  RefreshCw,
  Archive,
  Eye,
  X,
  Check,
} from 'lucide-react'
import {
  deviceService,
  getDeletedDevices,
  DeletedDeviceRecord,
} from '../services/deviceService'
import { useDevices } from '../hooks/useDevices'
import { SpotlightCard } from '../components/common/SpotlightCard'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'

export const DeletedDevicesPage: React.FC = () => {
  const navigate = useNavigate()
  const { refetch: refetchActiveDevices } = useDevices()

  const [deletedList, setDeletedList] = useState<DeletedDeviceRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [selectedRecord, setSelectedRecord] = useState<DeletedDeviceRecord | null>(null)
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadData = () => {
    setDeletedList(getDeletedDevices())
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredRecords = deletedList.filter((d) => {
    const matchSearch =
      searchQuery === '' ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.ip.includes(searchQuery) ||
      d.reason.toLowerCase().includes(searchQuery.toLowerCase())

    const matchType = filterType === 'ALL' || d.type.toUpperCase() === filterType.toUpperCase()
    return matchSearch && matchType
  })

  const handleRestore = async (record: DeletedDeviceRecord) => {
    setIsRestoringId(record.id)
    try {
      const res = await deviceService.restoreDevice(record)
      if (res.success) {
        setToastMessage(`Restored ${record.hostname} (${record.id}) to Active Inventory!`)
        loadData()
        refetchActiveDevices()
      }
    } finally {
      setIsRestoringId(null)
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  const handlePurge = async (id: string, hostname: string) => {
    if (window.confirm(`Permanently purge tombstone record for ${hostname} (${id})? This action cannot be undone.`)) {
      await deviceService.purgeDeletedDevice(id)
      setToastMessage(`Permanently purged tombstone archive for ${hostname}.`)
      loadData()
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const handleExportAudit = () => {
    const exportData = {
      title: 'SentinelX Decommissioned & Deleted Assets Archive Log',
      exportedAt: new Date().toISOString(),
      recordsCount: deletedList.length,
      records: deletedList,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sentinelx_decommissioned_assets_audit.json'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-950/90 to-purple-950/40 backdrop-blur-xl shadow-amber-glow">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-neon-amber shrink-0">
            <Archive className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-display font-bold text-slate-100">
                Deleted & Decommissioned Assets Archive
              </h1>
              <Badge variant="medium" className="text-[10px] font-mono">
                TOMBSTONE VAULT
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Audit trail and recovery vault for retired network hardware, deleted telemetry agents, and sanitized endpoints.
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
            <span>Export Tombstone Audit</span>
          </Button>
        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 p-3.5 rounded-2xl border border-emerald-500/50 bg-slate-950/95 text-emerald-300 text-xs font-mono shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* KPI Overview Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <SpotlightCard
          spotlightColor="amber"
          className="p-4 rounded-2xl border border-amber-500/40 bg-slate-950/90 backdrop-blur-xl space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>DECOMMISSIONED</span>
            <Trash2 className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400">
            {deletedList.length} Assets
          </p>
          <span className="text-[10px] text-slate-500 font-mono">Tombstone Preserved</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="emerald"
          className="p-4 rounded-2xl border border-emerald-500/40 bg-slate-950/90 backdrop-blur-xl space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>RESTORABLE</span>
            <RotateCcw className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            100% Intact
          </p>
          <span className="text-[10px] text-slate-500 font-mono">1-Click Inventory Re-enrollment</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="purple"
          className="p-4 rounded-2xl border border-purple-500/40 bg-slate-950/90 backdrop-blur-xl space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>RETENTION POLICY</span>
            <Shield className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-300">
            90 Days
          </p>
          <span className="text-[10px] text-slate-500 font-mono">NIST SP 800-88 Compliant</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="cyan"
          className="p-4 rounded-2xl border border-cyan-500/40 bg-slate-950/90 backdrop-blur-xl space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>AUDIT COMPLIANCE</span>
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-cyan-300">
            VERIFIED
          </p>
          <span className="text-[10px] text-emerald-400 font-mono">Full Lifecycle Logged</span>
        </SpotlightCard>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl font-mono text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <Search className="h-4 w-4 text-amber-400 shrink-0" />
          <input
            type="text"
            placeholder="Search deleted assets by ID, hostname, IP, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'WORKSTATION', 'SERVER', 'IOT'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                filterType === type
                  ? 'bg-amber-500/25 text-amber-200 border-amber-500/50 shadow-neon-amber/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Deleted Devices Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between font-mono text-xs">
          <span className="font-bold text-slate-200 flex items-center gap-2">
            <Archive className="h-4 w-4 text-amber-400" />
            <span>ARCHIVED TOMBSTONE RECORDS</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Showing {filteredRecords.length} Decommissioned Asset(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Device ID</th>
                <th className="py-3 px-4">Hostname & Type</th>
                <th className="py-3 px-4">Last IP / MAC</th>
                <th className="py-3 px-4">Decommission Timestamp</th>
                <th className="py-3 px-4">Retirement Reason</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic font-sans text-xs">
                    No matching deleted or decommissioned assets found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-amber-500/30 font-bold">
                        {item.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        {item.type === 'Server' ? (
                          <Server className="h-3.5 w-3.5 text-purple-400" />
                        ) : (
                          <Laptop className="h-3.5 w-3.5 text-cyan-400" />
                        )}
                        <span>{item.hostname}</span>
                        <span className="text-[9px] font-mono text-slate-400 uppercase px-1 py-0.2 rounded bg-slate-900">
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                      <div>{item.ip}</div>
                      <div className="text-[10px] text-slate-500">{item.mac}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(item.deletedAt).toLocaleTimeString()} ({new Date(item.deletedAt).toLocaleDateString()})
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-[11px] max-w-xs truncate" title={item.reason}>
                      {item.reason}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isRestoringId === item.id}
                          onClick={() => handleRestore(item)}
                          className="text-xs gap-1 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/50"
                        >
                          {isRestoringId === item.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3 w-3" />
                          )}
                          <span>Restore</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRecord(item)}
                          className="text-xs text-slate-400 hover:text-cyan-300 p-1.5"
                          title="Inspect Tombstone Snapshot"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePurge(item.id, item.hostname)}
                          className="text-xs text-slate-400 hover:text-red-400 p-1.5"
                          title="Purge Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Forensic Tombstone Snapshot */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-2xl border border-amber-500/50 bg-slate-950 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Archive className="h-4 w-4 text-amber-400" />
                <span>Decommissioned Asset Tombstone: {selectedRecord.id}</span>
              </h3>
              <button onClick={() => setSelectedRecord(null)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hostname:</span>
                <strong className="text-slate-100">{selectedRecord.hostname}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Operating System:</span>
                <span className="text-cyan-300">{selectedRecord.os}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last IP Address:</span>
                <span className="text-purple-300">{selectedRecord.ip}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">MAC Address:</span>
                <span className="text-slate-300">{selectedRecord.mac}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Department / Owner:</span>
                <span className="text-slate-300">{selectedRecord.department} ({selectedRecord.owner})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Decommissioned By:</span>
                <span className="text-amber-300 font-bold">{selectedRecord.deletedBy}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-1">Retirement Justification:</span>
                <p className="text-slate-200 text-[11px] leading-relaxed">{selectedRecord.reason}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  handleRestore(selectedRecord)
                  setSelectedRecord(null)
                }}
                className="bg-emerald-600 hover:bg-emerald-500 gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restore to Active Inventory</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
