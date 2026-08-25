import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Laptop,
  Search,
  Filter,
  ShieldAlert,
  ArrowUpRight,
  Lock,
  Server,
  Radio,
  Plus,
  RefreshCw,
  AlertCircle,
  Trash2,
  Download,
  Radar,
  Archive,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Skeleton } from '../components/common/Skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/common/Dialog'
import { DeviceCollectorModal } from '../components/device/DeviceCollectorModal'
import { useDevices } from '../hooks/useDevices'
import { useInvestigation } from '../context/InvestigationContext'
import { deviceCreateSchema, DeviceCreateInput } from '../services/deviceService'
import { DeviceTelemetry } from '../types/device'

export const DevicesPage: React.FC = () => {
  const navigate = useNavigate()
  const { isDeviceIsolated } = useInvestigation()

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCollectorModalOpen, setIsCollectorModalOpen] = useState(false)
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [deviceToDelete, setDeviceToDelete] = useState<DeviceTelemetry | null>(null)
  const [toastNotice, setToastNotice] = useState<string | null>(null)

  const {
    devices,
    isLoading,
    isError,
    error,
    refetch,
    createDevice,
    isCreating,
    deleteDevice,
    isDeleting,
    deleteAllDevices,
    isDeletingAll,
  } = useDevices({
    search: searchQuery,
    deviceType: typeFilter !== 'ALL' ? typeFilter : undefined,
  })

  // Filter devices
  const filteredDevices = useMemo(() => {
    return devices.filter((dev) => {
      const matchesSearch =
        dev.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.ip.includes(searchQuery) ||
        dev.department.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false
      if (typeFilter !== 'ALL' && dev.type.toUpperCase() !== typeFilter) return false
      return true
    })
  }, [devices, searchQuery, typeFilter])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeviceCreateInput>({
    resolver: zodResolver(deviceCreateSchema) as any,
    defaultValues: {
      id: '',
      hostname: '',
      ip_address: '',
      device_type: 'Workstation',
      department: '',
      owner: '',
      status: 'HEALTHY',
      risk_score: 0,
      compromise_probability: 0,
    },
  })

  const onAddDevice = async (data: DeviceCreateInput) => {
    setAddError(null)
    try {
      await createDevice(data)
      setIsAddModalOpen(false)
      reset()
      setToastNotice(`Successfully registered ${data.hostname} (${data.id}) to inventory!`)
      setTimeout(() => setToastNotice(null), 3500)
    } catch (err: any) {
      setAddError(err.message || 'Failed to insert device record into Supabase')
    }
  }

  const handleExportCsv = () => {
    const headers = ['ID', 'Hostname', 'IP Address', 'Type', 'Department', 'Owner', 'Status', 'Risk Score', 'Compromise Prob', 'Isolated']
    const rows = filteredDevices.map((d) => [
      d.id,
      d.hostname,
      d.ip,
      d.type,
      `"${d.department || ''}"`,
      `"${d.owner || ''}"`,
      d.status,
      d.riskScore || 0,
      d.compromiseProbability || 0,
      isDeviceIsolated(d.id) ? 'YES' : 'NO'
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `sentinelx-devices-inventory-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleConfirmDelete = async () => {
    if (!deviceToDelete) return
    try {
      await deleteDevice(deviceToDelete.id)
      setToastNotice(`Device ${deviceToDelete.hostname} deleted & moved to Deleted Devices Archive.`)
      setDeviceToDelete(null)
      setTimeout(() => setToastNotice(null), 3500)
    } catch {
      // Handled in mutation
    }
  }

  const handleConfirmClearAll = async () => {
    try {
      const count = await deleteAllDevices()
      setIsClearAllModalOpen(false)
      setToastNotice(`Cleared all ${count} devices from inventory! All records archived to Deleted Devices Vault.`)
      setTimeout(() => setToastNotice(null), 4000)
    } catch {
      // Handled
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 p-3.5 rounded-2xl border border-emerald-500/50 bg-slate-950/95 text-emerald-300 text-xs font-mono shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              INVENTORY
            </span>
            <span className="text-xs font-mono text-slate-400">
              {devices.length} Total Monitored Endpoints
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
            Monitored Devices & Infrastructure
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuous behavioral baseline tracking across workstations, database servers, firewalls, and IoT hardware.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subnet Collector & Scanner Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCollectorModalOpen(true)}
            className="text-xs gap-1.5 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 shadow-neon-cyan/20"
          >
            <Radar className="h-3.5 w-3.5 animate-pulse" />
            <span>Device Collector</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="text-xs gap-1.5 border-slate-700 hover:border-cyan-500/40"
            title="Download full inventory as CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>

          {/* Delete / Clear All Devices Button */}
          {devices.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClearAllModalOpen(true)}
              className="text-xs gap-1.5 border-red-500/40 text-red-400 hover:bg-red-950/50 hover:border-red-400"
              title="Delete all active devices to start clean"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All Devices</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-semibold gap-1.5 shadow-cyan-glow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Register Endpoint</span>
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/70">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Device ID (e.g. DEVICE-042), IP, hostname, owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-700 bg-slate-900/90 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['ALL', 'WORKSTATION', 'SERVER', 'LAPTOP', 'FIREWALL'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                typeFilter === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Error state if database completely unavailable */}
      {isError && devices.length === 0 && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>{error || 'Unable to connect to Supabase database. Displaying local cache.'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-7 text-xs border-amber-500/40">
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-28 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-44 rounded" />
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-7 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDevices.length === 0 ? (
        /* Clean Empty State Ready For New Custom Devices */
        <div className="text-center py-16 p-8 rounded-2xl border-2 border-dashed border-cyan-500/30 bg-slate-950/60 space-y-4 font-mono">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 mx-auto shadow-neon-cyan/30">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Inventory Is Clean & Ready</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              No active devices in current view. You can now register your own brand new custom endpoints, scan subnets, or view previously archived devices.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-semibold gap-1.5 shadow-neon-cyan/40"
            >
              <Plus className="h-4 w-4" />
              <span>Register New Endpoint</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/deleted-devices')}
              className="text-xs gap-1.5 border-amber-500/40 text-amber-300 hover:bg-amber-950/40"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>View Deleted Archive</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Device Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((dev) => {
            const isIsolated = isDeviceIsolated(dev.id) || dev.isolationStatus?.isIsolated
            const isCompromised = dev.status === 'COMPROMISED'
            const isSuspicious = dev.status === 'SUSPICIOUS'

            return (
              <Card
                key={dev.id}
                variant="cyber"
                className={`p-4 rounded-xl space-y-3 cursor-pointer hover:border-cyan-500/40 transition-all ${
                  isCompromised ? 'border-red-500/40 bg-red-950/15 shadow-red-glow-sm' : ''
                }`}
                onClick={() => navigate(`/devices/${dev.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                      {dev.type === 'Server' ? <Server className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-sm text-slate-100">{dev.id}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{dev.ip}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isIsolated && (
                      <Badge variant="medium" className="text-[9px]">
                        <Lock className="h-2.5 w-2.5 mr-0.5" /> ISOLATED
                      </Badge>
                    )}
                    <Badge
                      variant={isCompromised ? 'critical' : isSuspicious ? 'high' : 'healthy'}
                      pulse={isCompromised}
                      className="text-[9px]"
                    >
                      {dev.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Hostname:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[160px]">{dev.hostname}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Department:</span>
                    <span className="text-slate-300">{dev.department}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Assigned Owner:</span>
                    <span className="text-slate-300">{dev.owner}</span>
                  </div>
                </div>

                {/* Metrics Bar */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500">Risk: </span>
                    <span
                      className={`font-bold ${
                        (dev.riskScore || 0) > 75
                          ? 'text-red-400'
                          : (dev.riskScore || 0) > 40
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {dev.riskScore || 0}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeviceToDelete(dev)
                      }}
                      className="h-7 w-7 p-0 text-slate-500 hover:text-red-400 hover:bg-red-950/40"
                      title="Decommission & Archive Device"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/devices/${dev.id}`)
                      }}
                      className="h-7 text-xs px-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40"
                    >
                      Inspect <ArrowUpRight className="h-3 w-3 ml-0.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal 1: Clear All Devices Confirmation */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl border-2 border-red-500 bg-slate-950 shadow-neon-red space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span>Clear All Active Devices?</span>
              </h3>
              <button onClick={() => setIsClearAllModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              This will decommission and remove all <strong>{devices.length} active devices</strong> from your inventory so you can add your own fresh endpoints.
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="text-amber-300 font-semibold block">⚠️ Zero Data Loss Guarantee:</span>
              <span>All removed devices will be safely preserved in the <strong>Deleted Devices Archive</strong>, where you can restore them at any time.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsClearAllModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeletingAll}
                onClick={handleConfirmClearAll}
                className="bg-red-600 hover:bg-red-500 shadow-neon-red/40"
              >
                {isDeletingAll ? 'Clearing...' : 'Yes, Clear All Devices'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Single Device Delete Confirmation */}
      {deviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl border border-red-500/40 bg-slate-950 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-400" />
                <span>Decommission {deviceToDelete.id}?</span>
              </h3>
              <button onClick={() => setDeviceToDelete(null)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Remove <strong>{deviceToDelete.hostname}</strong> ({deviceToDelete.ip}) from active monitoring and archive it to the Tombstone Vault?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setDeviceToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? 'Archiving...' : 'Decommission & Archive'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Register New Endpoint Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md font-mono">
          <DialogHeader>
            <DialogTitle className="text-base text-slate-100 flex items-center gap-2">
              <Plus className="h-4 w-4 text-cyan-400" />
              <span>Register Monitored Endpoint</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Add a new physical, virtual, or containerized endpoint to SentinelX behavioral telemetry ingestion.
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <div className="p-3 rounded-lg border border-red-500/40 bg-red-950/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{addError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onAddDevice)} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Device ID *</label>
              <input
                {...register('id')}
                placeholder="e.g. DEVICE-099 or SERVER-ALPHA"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
              {errors.id && <span className="text-[10px] text-red-400">{errors.id.message}</span>}
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Hostname *</label>
              <input
                {...register('hostname')}
                placeholder="e.g. Engineering-WS-099"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
              {errors.hostname && <span className="text-[10px] text-red-400">{errors.hostname.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">IPv4 Address *</label>
                <input
                  {...register('ip_address')}
                  placeholder="192.168.1.99"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
                {errors.ip_address && <span className="text-[10px] text-red-400">{errors.ip_address.message}</span>}
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Device Type</label>
                <select
                  {...register('device_type')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Workstation">Workstation</option>
                  <option value="Server">Server</option>
                  <option value="Laptop">Laptop</option>
                  <option value="IoT">IoT</option>
                  <option value="Router">Router</option>
                  <option value="Firewall">Firewall</option>
                  <option value="Cloud">Cloud</option>
                  <option value="External">External</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Department *</label>
                <input
                  {...register('department')}
                  placeholder="e.g. Engineering"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
                {errors.department && <span className="text-[10px] text-red-400">{errors.department.message}</span>}
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Owner *</label>
                <input
                  {...register('owner')}
                  placeholder="e.g. Alice Chen"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
                {errors.owner && <span className="text-[10px] text-red-400">{errors.owner.message}</span>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isCreating}>
                {isCreating ? 'Registering...' : 'Register Endpoint'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Device Collector Modal */}
      <DeviceCollectorModal
        isOpen={isCollectorModalOpen}
        onClose={() => setIsCollectorModalOpen(false)}
      />
    </div>
  )
}
