import React from 'react'
import { ArrowRight, ShieldCheck, Zap, BrainCircuit, Activity, Layers } from 'lucide-react'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { useNavigate } from 'react-router-dom'

export const LandingHero: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-2xl p-6 sm:p-10 relative overflow-hidden shadow-2xl space-y-8">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 h-80 w-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl space-y-4">
        <Badge variant="ai" className="text-xs font-mono">
          <BrainCircuit className="h-3.5 w-3.5 mr-1" />
          BEHAVIOURAL CYBERSECURITY INTELLIGENCE
        </Badge>

        <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-slate-100 tracking-tight leading-tight">
          Next-Generation Network Compromise Detection & Investigation Platform
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Traditional cybersecurity fails against novel zero-days and polymorphic C2 because it waits for known signatures. SentinelX correlates multidimensional network, DNS, authentication, and connection anomalies to detect breaches before public IoCs exist.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/')}
            className="text-xs font-semibold gap-2"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/network-3d')}
            className="text-xs gap-2"
          >
            <span>Inspect 3D Network</span>
          </Button>
        </div>
      </div>

      {/* Visual Product Narrative Comparison: Traditional IoC vs SentinelX */}
      <div className="pt-8 border-t border-slate-800/80">
        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 mb-4 tracking-wider">
          Architecture Paradigm Shift: Static IoC vs Behavioral Anomaly Engine
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Traditional Box */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Traditional SOC Workflow</span>
              <span className="text-[10px] font-mono text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                Fragile to Zero-Days
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="px-2 py-1 bg-slate-950 rounded border border-slate-800">Known IoC</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-950 rounded border border-slate-800">Static Match</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-950 rounded border border-slate-800 text-red-400">Alert</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Blind to zero-day beaconing, custom encrypted tunnels, and polymorphic DGA domains.
            </p>
          </div>

          {/* SentinelX Box */}
          <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 shadow-cyan-glow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300">SentinelX Multivariate Engine</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                Proactive Anomaly Detection
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-cyan-200">
              <span className="px-1.5 py-0.5 bg-slate-950 rounded border border-cyan-500/30">Network Baseline</span>
              <span>+</span>
              <span className="px-1.5 py-0.5 bg-slate-950 rounded border border-cyan-500/30">DNS Entropy</span>
              <span>+</span>
              <span className="px-1.5 py-0.5 bg-slate-950 rounded border border-cyan-500/30">Auth Timing</span>
              <span>+</span>
              <span className="px-1.5 py-0.5 bg-slate-950 rounded border border-cyan-500/30">Graph Hops</span>
            </div>
            <div className="text-[11px] text-purple-300 font-mono flex items-center gap-1.5">
              <span>↓ AI Correlation</span>
              <span>→ Anomaly Score</span>
              <span>→ Bayesian Compromise Prob (94%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
