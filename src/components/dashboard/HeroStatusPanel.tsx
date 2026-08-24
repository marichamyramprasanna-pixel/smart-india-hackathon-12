import React from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Zap,
  Activity,
  Radio,
} from 'lucide-react'
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
  const maxRisk =
    devices.length > 0
      ? Math.max(...devices.map((d) => d.compromiseProbability || d.riskScore || 0))
      : 0

  const isCritical = maxRisk >= 80 || compromisedDevices.length > 0
  const isHigh = maxRisk >= 50 || suspiciousDevices.length > 0

  const statusLabel = isCritical
    ? 'COORDINATED ADVERSARY ATTACK DETECTED'
    : isHigh
    ? 'ELEVATED MULTI-VECTOR ANOMALIES'
    : 'ALL DEFENSIVE SHIELDS ACTIVE & NOMINAL'

  const focusDevice = compromisedDevices[0] || suspiciousDevices[0] || devices[0]

  const aiAssessmentText = isCritical
    ? `Critical anomaly flagged on ${focusDevice?.id || 'endpoint'} (${focusDevice?.hostname || 'host'}). High-entropy DNS exfiltration and unauthorized lateral SMB sweeps require immediate 802.1X quarantine.`
    : isHigh
    ? `Elevated network anomalies observed on ${focusDevice?.id || 'endpoint'}. Multi-modal behavioral models monitoring deviation from statistical baselines.`
    : `All ${devices.length} monitored endpoints are operating strictly within baseline Gaussian cluster distributions.`

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 md:p-7 transition-all duration-500 backdrop-blur-2xl ${
        isCritical
          ? 'border-red-500/50 bg-gradient-to-br from-red-950/60 via-slate-950/90 to-purple-950/40 shadow-neon-red/30'
          : isHigh
          ? 'border-amber-500/50 bg-gradient-to-br from-amber-950/50 via-slate-950/90 to-cyan-950/40 shadow-neon-amber/30'
          : 'border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-slate-950/90 to-emerald-950/30 shadow-neon-cyan/25'
      }`}
    >
      {/* Dynamic Cyber Grid & Animated Light Streaks */}
      <div className="absolute inset-0 bg-cyber-grid bg-grid-16 opacity-30 pointer-events-none" />
      <div
        className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px] pointer-events-none opacity-40 ${
          isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-cyan-500'
        }`}
      />
      <div
        className={`absolute -left-20 -bottom-20 h-64 w-64 rounded-full blur-[100px] pointer-events-none opacity-30 ${
          isCritical ? 'bg-purple-600' : 'bg-emerald-500'
        }`}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Column: Status, Title, Subtitle, AI Callout */}
        <div className="space-y-3.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-mono tracking-widest text-slate-300 uppercase font-bold flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
              THREAT INTELLIGENCE RADAR
            </span>

            <Badge
              variant={isCritical ? 'critical' : isHigh ? 'high' : 'healthy'}
              pulse={isCritical || isHigh}
              className="text-xs font-mono font-bold px-2.5 py-0.5"
            >
              {isCritical ? (
                <ShieldAlert className="h-3.5 w-3.5 mr-1" />
              ) : isHigh ? (
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              )}
              {isCritical ? 'CRITICAL RISK (94%)' : isHigh ? 'ELEVATED (62%)' : 'PROTECTED (98%)'}
            </Badge>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {devices.length} Live Endpoints
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold tracking-tight text-slate-100 drop-shadow-sm">
              {statusLabel}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              Real-time multivariate AI anomaly detection continuous monitoring across NetFlow, DNS entropy, and 802.1X authentications.
            </p>
          </div>

          {/* AI Assessment Callout Box with Glowing Border */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-purple-500/40 bg-purple-950/40 text-xs text-purple-200 shadow-neon-purple/15 backdrop-blur-md">
            <div className="p-1.5 rounded-lg bg-purple-900/60 border border-purple-500/50 text-purple-300 shrink-0 mt-0.5">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-purple-300 font-mono text-[11px] uppercase block mb-0.5">
                Sentinel AI Behavioral Triage:
              </span>
              <p className="leading-relaxed italic">"{aiAssessmentText}"</p>
            </div>
          </div>
        </div>

        {/* Right Column: Glowing Circular Gauge & CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-6 lg:border-l lg:border-slate-800/90 lg:pl-8">
          {/* Circular Animated SVG Risk Meter */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="gaugeCritGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
                <linearGradient id="gaugeNomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>

              <path
                className="text-slate-800/80"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="transition-all duration-1000 ease-out"
                strokeDasharray={`${maxRisk}, 100`}
                strokeWidth="3.4"
                strokeLinecap="round"
                stroke={isCritical ? 'url(#gaugeCritGradient)' : 'url(#gaugeNomGradient)'}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            <div className="absolute text-center flex flex-col items-center">
              <span
                className={`text-3xl font-display font-extrabold font-mono-numbers tracking-tight ${
                  isCritical
                    ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                    : isHigh
                    ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                    : 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                }`}
              >
                {maxRisk}%
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Risk Score
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-2.5 w-full sm:w-auto">
            {focusDevice && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/devices/${focusDevice.id}`)}
                className="gap-2 text-xs font-semibold whitespace-nowrap shadow-cyan-glow-sm hover:shadow-cyan-glow h-9"
              >
                <span>Investigate {focusDevice.id}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/attack-graph')}
              className="gap-2 text-xs whitespace-nowrap border-slate-700 text-slate-200 hover:border-purple-500/50 hover:bg-purple-950/30 h-9"
            >
              <span>Visual Attack Graph</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
