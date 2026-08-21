import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Laptop,
  Search,
  Filter,
  ShieldAlert,
  ArrowUpRight,
  Lock,
  Server,
  Radio,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { mockDevices } from '../api/devices'
import { useInvestigation } from '../context/InvestigationContext'
import { useDemoScenario } from '../context/DemoScenarioContext'

export const DevicesPage: React.FC = () => {
  const navigate = useNavigate()
  const { isDeviceIsolated } = useInvestigation()
  const { currentStage } = useDemoScenario()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const reactiveDevices = mockDevices.map((d) => {
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
              1,248 Total Monitored Endpoints
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
            Monitored Devices & Infrastructure
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuous behavioral baseline tracking across workstations, database servers, firewalls, and IoT hardware.
          </p>
        </div>

        <Badge variant="healthy" className="font-mono text-xs">
          TELEMETRY AGENTS ACTIVE
        </Badge>
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

        <div className="flex items-center gap-2">
          {['ALL', 'WORKSTATION', 'SERVER', 'LAPTOP', 'FIREWALL'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
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

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((dev) => {
          const isIsolated = isDeviceIsolated(dev.id)
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
    </div>
  )
}
