import React from 'react'
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, BrainCircuit } from 'lucide-react'
import { useDevices } from '../../hooks/useDevices'
import { useAlerts } from '../../hooks/useAlerts'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { useNavigate } from 'react-router-dom'

export const HeroStatusPanel: React.FC = () => {
  const navigate = useNavigate()
  const { devices } = useDevices()
  const { alerts } = useAlerts()

  const compromisedDevices = devices.filter((d) => d.status === 'COMPROMISED')
  const suspiciousDevices = devices.filter((d) => d.status === 'SUSPICIOUS')
  const maxRisk = devices.length > 0 ? Math.max(...devices.map((d) => d.compromiseProbability || d.riskScore || 0)) : 0

  const isCritical = maxRisk >= 80 || compromisedDevices.length > 0
  const isHigh = maxRisk >= 50 || suspiciousDevices.length > 0

  const statusLabel = isCritical
    ? 'COORDINATED COMPROMISE DETECTED'
    : isHigh
    ? 'ELEVATED NETWORK ANOMALIES'
    : 'NETWORK HEALTH PROTECTED'

  const focusDevice = compromisedDevices[0] || suspiciousDevices[0] || devices[0]

  const aiAssessmentText = isCritical
    ? `Critical anomaly detected on ${focusDevice?.id || 'endpoint'}. High-entropy DNS exfiltration and unauthorized lateral hops require immediate isolation.`
    : isHigh
    ? `Elevated network anomalies observed on ${focusDevice?.id || 'endpoint'}. Monitoring multi-vector telemetry deviations.`
    : `All ${devices.length} monitored endpoints are operating within normal statistical behavioral baselines.`

  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 md:p-6 transition-all duration-300 ${
      isCritical
        ? 'border-red-500/40 bg-gradient-to-r from-red-950/40 via-slate-950/80 to-slate-950/90 shadow-red-glow'
        : isHigh
        ? 'border-orange-500/40 bg-gradient-to-r from-orange-950/30 via-slate-950/80 to-slate-950/90 shadow-amber-glow'
        : 'border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-950/80 to-slate-950/90 shadow-cyan-glow-sm'
    }`}>
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-cyber-grid bg-grid-16 opacity-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Side: Status, Title, Subtitle, AI Assessment */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              NETWORK STATUS
            </span>
            <Badge
              variant={isCritical ? 'critical' : isHigh ? 'high' : 'healthy'}
              pulse={isCritical || isHigh}
              className="text-xs font-mono font-bold"
            >
              {isCritical ? (
                <ShieldAlert className="h-3.5 w-3.5 mr-1" />
              ) : isHigh ? (
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              )}
              {isCritical ? 'CRITICAL RISK' : isHigh ? 'INVESTIGATING' : 'PROTECTED'}
            </Badge>
            <span className="text-xs font-mono text-slate-400">
              Live Endpoints: {devices.length}
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold tracking-tight text-slate-100">
              {statusLabel}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              AI-powered behavioural monitoring and compromise detection analyzing multivariate telemetry deviations across {devices.length} monitored endpoints.
            </p>
          </div>

          {/* AI Assessment Callout Box */}
          <div className="flex items-start gap-3 p-3 rounded-lg border border-purple-500/30 bg-purple-950/30 text-xs text-purple-200">
            <BrainCircuit className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-purple-300">AI Assessment: </span>
              <span>{aiAssessmentText}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Circular Animated Risk Gauge & Quick CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-6 lg:border-l lg:border-slate-800/80 lg:pl-8">
          {/* Circular Risk Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800/80"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`transition-all duration-700 ${
                  isCritical ? 'stroke-red-500 text-red-500' : isHigh ? 'stroke-orange-500 text-orange-500' : 'stroke-cyan-400 text-cyan-400'
                }`}
                strokeDasharray={`${maxRisk}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            <div className="absolute text-center flex flex-col items-center">
              <span className={`text-2xl font-display font-extrabold font-mono-numbers ${
                isCritical ? 'text-red-400' : isHigh ? 'text-orange-400' : 'text-cyan-400'
              }`}>
                {maxRisk}%
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                Compromise Prob
              </span>
            </div>
          </div>

          {/* Quick CTAs */}
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {focusDevice && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/devices/${focusDevice.id}`)}
                className="gap-2 text-xs font-semibold whitespace-nowrap"
              >
                <span>Investigate {focusDevice.id}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/attack-graph')}
              className="gap-2 text-xs whitespace-nowrap"
            >
              <span>View Attack Graph</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
