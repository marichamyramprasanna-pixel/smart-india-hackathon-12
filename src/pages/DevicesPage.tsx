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
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Skeleton } from '../components/common/Skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/common/Dialog'
import { useDevices } from '../hooks/useDevices'
import { useInvestigation } from '../context/InvestigationContext'
import { useDemoScenario } from '../context/DemoScenarioContext'
import { deviceCreateSchema, DeviceCreateInput } from '../services/deviceService'

export const DevicesPage: React.FC = () => {
  const navigate = useNavigate()
  const { isDeviceIsolated } = useInvestigation()
  const { currentStage } = useDemoScenario()

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const { devices, isLoading, isError, error, refetch, createDevice, isCreating } = useDevices({
    search: searchQuery,
    deviceType: typeFilter !== 'ALL' ? typeFilter : undefined,
  })

  // Integrate live Demo Scenario state into devices
  const reactiveDevices = useMemo(() => {
    return devices.map((d) => {
      if (d.id === 'DEVICE-042') {
        return {
          ...d,
          status: currentStage.device42Status,
          riskScore: currentStage.device42Risk,
          compromiseProbability: currentStage.compromiseProbability,
        }
      }
      if (d.id === 'SERVER-07') {
        return {
          ...d,
          status: currentStage.server07Status,
          riskScore: currentStage.server07Risk,
        }
      }
      return d
    })
  }, [devices, currentStage])

  // Filter devices
  const filteredDevices = useMemo(() => {
    return reactiveDevices.filter((dev) => {
      const matchesSearch =
        dev.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.ip.includes(searchQuery) ||
        dev.department.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false
      if (typeFilter !== 'ALL' && dev.type.toUpperCase() !== typeFilter) return false
      return true
    })
  }, [reactiveDevices, searchQuery, typeFilter])

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
    } catch (err: any) {
      setAddError(err.message || 'Failed to insert device record into Supabase')
    }
  }

  return (
    <div className="space-y-6">
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs gap-1.5 border-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Database</span>
          </Button>

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
        /* Empty State */
        <div className="text-center py-16 p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 space-y-3">
          <Laptop className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No Monitored Endpoints Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No devices matched your query or filter criteria. Try adjusting search filters or register a new endpoint.
          </p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setTypeFilter('ALL') }} className="text-xs">
            Reset Filters
          </Button>
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

                <div className="text-xs text-slate-300 space-y-1">
                  <p className="text-[11px] text-slate-400 truncate">{dev.hostname}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Dept: <strong className="text-slate-300">{dev.department}</strong></span>
                    <span>OS: <strong className="text-slate-300">{dev.type}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Compromise Prob</span>
                    <span className={`font-mono font-bold text-sm ${
                      dev.compromiseProbability >= 80 ? 'text-red-400' :
                      dev.compromiseProbability >= 50 ? 'text-orange-400' : 'text-cyan-400'
                    }`}>
                      {dev.compromiseProbability}%
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/devices/${dev.id}`)
                    }}
                    className="h-7 px-2.5 text-xs font-semibold gap-1"
                  >
                    <span>Investigate</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Register Endpoint Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 border-slate-800">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="text-base text-slate-100">Register New Network Device</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Insert a new monitored endpoint into Supabase security telemetry.
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <div className="p-3 rounded-lg border border-red-500/40 bg-red-950/30 text-xs text-red-300">
              {addError}
            </div>
          )}

          <form onSubmit={handleSubmit(onAddDevice)} className="space-y-3 py-2 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Device ID</label>
              <input
                type="text"
                {...register('id')}
                className="h-8.5 w-full rounded border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
              />
              {errors.id && <p className="text-red-400 mt-0.5 text-[10px]">{errors.id.message}</p>}
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Hostname</label>
              <input
                type="text"
                {...register('hostname')}
                className="h-8.5 w-full rounded border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
              />
              {errors.hostname && <p className="text-red-400 mt-0.5 text-[10px]">{errors.hostname.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-medium mb-1">IPv4 Socket</label>
                <input
                  type="text"
                  {...register('ip_address')}
                  className="h-8.5 w-full rounded border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
                />
                {errors.ip_address && <p className="text-red-400 mt-0.5 text-[10px]">{errors.ip_address.message}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Device Type</label>
                <select
                  {...register('device_type')}
                  className="h-8.5 w-full rounded border border-slate-700 bg-slate-900 px-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Workstation">Workstation</option>
                  <option value="Server">Server</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Router">Router</option>
                  <option value="Firewall">Firewall</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Department</label>
                <input
                  type="text"
                  {...register('department')}
                  className="h-8.5 w-full rounded border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Primary Owner</label>
                <input
                  type="text"
                  {...register('owner')}
                  className="h-8.5 w-full rounded border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3 mt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isCreating} className="text-xs font-semibold">
                Submit to Supabase
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
