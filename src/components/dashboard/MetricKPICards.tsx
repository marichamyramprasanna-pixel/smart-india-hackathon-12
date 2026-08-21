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
import { Card } from '../common/Card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../common/Tooltip'
import { formatCompactNumber } from '../../utils/formatters'

export const MetricKPICards: React.FC = () => {
  const { currentStage } = useDemoScenario()

  const metrics = [
    {
      id: 'kpi-active-devs',
      label: 'Active Monitored Devices',
      value: '1,248',
      trend: '+14 today',
      isPositiveTrend: true,
      icon: <Laptop className="h-4 w-4 text-cyan-400" />,
      tooltip: 'Continuous telemetry agents and passive flow sensors monitored across all corporate subnets.',
      accent: 'border-cyan-500/20 text-cyan-400',
    },
    {
      id: 'kpi-suspicious-devs',
      label: 'Suspicious Endpoints',
      value: currentStage.suspiciousDevicesCount.toString(),
      trend: currentStage.suspiciousDevicesCount > 0 ? '+4 flagged' : '0 nominal',
      isPositiveTrend: currentStage.suspiciousDevicesCount === 0,
      icon: <AlertTriangle className="h-4 w-4 text-orange-400" />,
      tooltip: 'Endpoints with statistical behavioral deviations exceeding 2.5 standard deviations from baselines.',
      accent: 'border-orange-500/30 text-orange-400',
    },
    {
      id: 'kpi-active-threats',
      label: 'Active Threats',
      value: currentStage.activeThreatsCount.toString(),
      trend: currentStage.activeThreatsCount > 0 ? 'Elevated' : 'None',
      isPositiveTrend: currentStage.activeThreatsCount === 0,
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
      value: '96.4%',
      trend: '48 Classifiers',
      isPositiveTrend: true,
      icon: <BrainCircuit className="h-4 w-4 text-purple-400" />,
      tooltip: 'Model calibration probability over 30 days of continuous multivariate unsupervised learning.',
      accent: 'border-purple-500/20 text-purple-400',
    },
  ]

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {metrics.map((m) => (
          <Card
            key={m.id}
            variant="cyber"
            className="p-3.5 sm:p-4 rounded-xl relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                {m.icon}
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-slate-500 hover:text-slate-300 p-1" aria-label="Metric details">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  {m.tooltip}
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="mt-3">
              <span className="text-[11px] font-medium text-slate-400 line-clamp-1">
                {m.label}
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-display font-bold text-slate-100 font-mono-numbers">
                  {m.value}
                </span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
              <span className={m.isPositiveTrend ? 'text-emerald-400 flex items-center gap-0.5' : 'text-red-400 flex items-center gap-0.5'}>
                {m.isPositiveTrend ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {m.trend}
              </span>
              <span className="text-slate-500">Live</span>
            </div>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}
