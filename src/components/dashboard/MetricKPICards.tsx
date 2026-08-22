import React from 'react'
import {
  Laptop,
  AlertTriangle,
  Flame,
  Activity,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react'
import { useDemoScenario } from '../../context/DemoScenarioContext'
import { useDevices } from '../../hooks/useDevices'
import { useAlerts } from '../../hooks/useAlerts'
import { Card } from '../common/Card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../common/Tooltip'

export const MetricKPICards: React.FC = () => {
  const { currentStage } = useDemoScenario()
  const { devices } = useDevices()
  const { alerts } = useAlerts()

  const activeDeviceCount = devices.length
  const suspiciousCount = devices.filter(
    (d) => d.status === 'SUSPICIOUS' || d.status === 'COMPROMISED'
  ).length || currentStage.suspiciousDevicesCount
  const activeAlertCount = alerts.filter(
    (a) => a.status === 'NEW' || a.status === 'INVESTIGATING'
  ).length || currentStage.activeThreatsCount

  const metrics = [
    {
      id: 'kpi-active-devs',
      label: 'Active Monitored Devices',
      value: activeDeviceCount > 0 ? activeDeviceCount.toString() : '0',
      trend: `${activeDeviceCount} endpoints`,
      isPositiveTrend: true,
      icon: <Laptop className="h-4 w-4 text-cyan-400" />,
      tooltip: 'Continuous telemetry agents and passive flow sensors monitored across all corporate subnets.',
      accent: 'border-cyan-500/20 text-cyan-400',
    },
    {
      id: 'kpi-suspicious-devs',
      label: 'Suspicious Endpoints',
      value: suspiciousCount.toString(),
      trend: suspiciousCount > 0 ? `+${suspiciousCount} flagged` : '0 nominal',
      isPositiveTrend: suspiciousCount === 0,
      icon: <AlertTriangle className="h-4 w-4 text-orange-400" />,
      tooltip: 'Endpoints with statistical behavioral deviations exceeding 2.5 standard deviations from baselines.',
      accent: 'border-orange-500/30 text-orange-400',
    },
    {
      id: 'kpi-active-threats',
      label: 'Active Threats',
      value: activeAlertCount.toString(),
      trend: activeAlertCount > 0 ? 'Elevated' : 'None',
      isPositiveTrend: activeAlertCount === 0,
      icon: <Flame className="h-4 w-4 text-red-400" />,
      tooltip: 'Correlated multi-vector security incidents requiring SOC analyst triage or containment.',
      accent: 'border-red-500/30 text-red-400',
    },
    {
      id: 'kpi-network-health',
      label: 'Network Baseline Health',
      value: `${currentStage.networkHealth}%`,
      trend: currentStage.networkHealth >= 90 ? 'Nominal' : 'Degraded',
      isPositiveTrend: currentStage.networkHealth >= 90,
      icon: <Activity className="h-4 w-4 text-emerald-400" />,
      tooltip: 'Composite telemetry stability index across DNS, NetFlow, and authentication integrity.',
      accent: 'border-emerald-500/20 text-emerald-400',
    },
    {
      id: 'kpi-ai-confidence',
      label: 'AI Detection Confidence',
      value: `${Math.round(100 - (currentStage.compromiseProbability * 0.05))}%`,
      trend: 'Calibrated',
      isPositiveTrend: true,
      icon: <BrainCircuit className="h-4 w-4 text-purple-400" />,
      tooltip: 'Bayesian posterior confidence calibrated across continuous multivariate unsupervised learning models.',
      accent: 'border-purple-500/20 text-purple-400',
    },
  ]

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {metrics.map((m) => (
          <Card
            key={m.id}
            variant="cyber"
            className="p-3.5 rounded-xl flex flex-col justify-between space-y-2 hover:border-cyan-500/40 transition-colors"
          >
            {/* Top row: Label + Icon + Tooltip */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-400 line-clamp-1">
                {m.label}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {m.icon}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-slate-500 hover:text-slate-300" aria-label="Metric Info">
                      <Info className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    {m.tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Bottom Row: Dynamic Value + Trend indicator */}
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xl sm:text-2xl font-mono font-bold text-slate-100 tracking-tight">
                {m.value}
              </span>
              <span
                className={`text-[10px] font-mono font-medium flex items-center gap-0.5 ${
                  m.isPositiveTrend ? 'text-emerald-400' : 'text-orange-400'
                }`}
              >
                {m.isPositiveTrend ? (
                  <TrendingUp className="h-2.5 w-2.5" />
                ) : (
                  <TrendingDown className="h-2.5 w-2.5" />
                )}
                {m.trend}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}
