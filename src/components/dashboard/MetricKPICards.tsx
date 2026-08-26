import React from 'react'
import {
  Laptop,
  AlertTriangle,
  Flame,
  Activity,
  BrainCircuit,
  Info,
} from 'lucide-react'
import { useDemoScenario } from '../../context/DemoScenarioContext'
import { useDevices } from '../../hooks/useDevices'
import { useAlerts } from '../../hooks/useAlerts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../common/Tooltip'
import { SpotlightCard } from '../common/SpotlightCard'

interface MetricKPICardsProps {
  simulatedPackets?: number
  timeframe?: 'realtime' | '24h' | '7d'
}

export const MetricKPICards: React.FC<MetricKPICardsProps> = ({
  simulatedPackets = 14280,
  timeframe = 'realtime',
}) => {
  const { currentStage } = useDemoScenario()
  const { devices } = useDevices()
  const { alerts } = useAlerts()

  const activeDeviceCount = devices.length
  const suspiciousCount = devices.filter(
    (d) => d.status === 'SUSPICIOUS' || d.status === 'COMPROMISED'
  ).length
  const activeAlertCount = alerts.filter(
    (a) => a.status === 'NEW' || a.status === 'INVESTIGATING'
  ).length

  const maxCompromise =
    devices.length > 0 ? Math.max(...devices.map((d) => d.compromiseProbability || 0)) : 0
  const calculatedHealth = Math.max(
    10,
    Math.round(100 - (suspiciousCount / Math.max(devices.length, 1)) * 40 - maxCompromise * 0.3)
  )
  const calculatedConfidence =
    devices.length > 0
      ? Math.min(99, Math.max(88, Math.round(96 - maxCompromise * 0.05)))
      : 98

  // Compute dynamic timeframe descriptions
  const getDeviceTrend = () => {
    if (timeframe === 'realtime') return `Ingesting ${simulatedPackets.toLocaleString()} pkts/s`
    if (timeframe === '24h') return `Avg ${(simulatedPackets * 0.94).toLocaleString().split('.')[0]} pkts/s`
    return `Fleet total: ${activeDeviceCount} agents online`
  }

  const getSuspiciousTrend = () => {
    if (suspiciousCount === 0) return '0 anomalous devices'
    if (timeframe === 'realtime') return `${suspiciousCount} active anomalies`
    if (timeframe === '24h') return `${suspiciousCount} flagged past 24h`
    return `${suspiciousCount} flagged past 7d`
  }

  const getHealthTrend = () => {
    if (calculatedHealth >= 80) {
      return timeframe === 'realtime' ? 'Nominal stability' : '99.98% uptime SLA'
    }
    return 'Action required'
  }

  const metrics = [
    {
      id: 'kpi-active-devs',
      label: 'Active Endpoints',
      value: activeDeviceCount > 0 ? activeDeviceCount.toString() : '0',
      trend: getDeviceTrend(),
      icon: <Laptop className="h-4 w-4 text-cyan-300" />,
      tooltip: 'Continuous telemetry agents and flow sensors actively streaming from network subnets.',
      cardBg: 'from-cyan-950/40 via-slate-900/80 to-slate-950/90 border-cyan-500/30 hover:border-cyan-400/60 shadow-neon-cyan/20 hover:shadow-neon-cyan/40',
      iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      textColor: 'text-cyan-300',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      spotlightColor: 'cyan' as const,
    },
    {
      id: 'kpi-suspicious-devs',
      label: 'Suspicious Hosts',
      value: suspiciousCount.toString(),
      trend: getSuspiciousTrend(),
      icon: <AlertTriangle className="h-4 w-4 text-amber-300" />,
      tooltip: 'Endpoints with statistical behavioral deviations exceeding 2.5 sigma baseline.',
      cardBg: 'from-amber-950/40 via-slate-900/80 to-slate-950/90 border-amber-500/30 hover:border-amber-400/60 shadow-neon-amber/20 hover:shadow-neon-amber/40',
      iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      textColor: 'text-amber-300',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      spotlightColor: 'amber' as const,
    },
    {
      id: 'kpi-active-threats',
      label: 'Active Threats',
      value: activeAlertCount.toString(),
      trend: activeAlertCount > 0 ? `${activeAlertCount} incidents open` : '0 open alerts',
      icon: <Flame className="h-4 w-4 text-red-400 animate-pulse" />,
      tooltip: 'Correlated multi-vector security incidents requiring SOC analyst triage or containment.',
      cardBg: 'from-red-950/50 via-slate-900/80 to-slate-950/90 border-red-500/40 hover:border-red-400/70 shadow-neon-red/25 hover:shadow-neon-red/50',
      iconBg: 'bg-red-500/20 text-red-400 border-red-500/40',
      textColor: 'text-red-400',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
      spotlightColor: 'red' as const,
    },
    {
      id: 'kpi-network-health',
      label: 'Network Health',
      value: `${calculatedHealth}%`,
      trend: getHealthTrend(),
      icon: <Activity className="h-4 w-4 text-emerald-300" />,
      tooltip: 'Composite telemetry stability index across DNS, NetFlow, and authentication integrity.',
      cardBg: 'from-emerald-950/40 via-slate-900/80 to-slate-950/90 border-emerald-500/30 hover:border-emerald-400/60 shadow-neon-emerald/20 hover:shadow-neon-emerald/40',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      textColor: 'text-emerald-300',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      spotlightColor: 'emerald' as const,
    },
    {
      id: 'kpi-ai-confidence',
      label: 'AI Model Accuracy',
      value: `${calculatedConfidence}%`,
      trend: 'Bayesian Calibrated',
      icon: <BrainCircuit className="h-4 w-4 text-purple-300" />,
      tooltip: 'Bayesian posterior confidence calibrated across continuous multivariate unsupervised learning models.',
      cardBg: 'from-purple-950/40 via-slate-900/80 to-slate-950/90 border-purple-500/30 hover:border-purple-400/60 shadow-neon-purple/20 hover:shadow-neon-purple/40',
      iconBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      textColor: 'text-purple-300',
      badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      spotlightColor: 'purple' as const,
    },
  ]

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {metrics.map((m) => (
          <SpotlightCard
            key={m.id}
            tilt={true}
            maxTilt={5}
            spotlightColor={m.spotlightColor}
            className={`relative rounded-2xl border bg-gradient-to-br ${m.cardBg} p-4 backdrop-blur-xl transition-all duration-300`}
          >
            {/* Top row: Label + Pod Icon + Info */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold line-clamp-1">
                {m.label}
              </span>

              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label="Info"
                    >
                      <Info className="h-3 w-3 opacity-60 hover:opacity-100" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-xs">
                    {m.tooltip}
                  </TooltipContent>
                </Tooltip>

                <div className={`p-1.5 rounded-lg border ${m.iconBg}`}>
                  {m.icon}
                </div>
              </div>
            </div>

            {/* Middle row: Big Glowing Number */}
            <div className="flex items-baseline justify-between gap-2 mt-1">
              <span
                className={`text-2xl sm:text-3xl font-display font-extrabold font-mono-numbers tracking-tight ${m.textColor}`}
              >
                {m.value}
              </span>
            </div>

            {/* Bottom row: Trend Chip */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className={`px-2 py-0.5 rounded-full font-mono font-medium border ${m.badgeBg}`}>
                {m.trend}
              </span>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </TooltipProvider>
  )
}
