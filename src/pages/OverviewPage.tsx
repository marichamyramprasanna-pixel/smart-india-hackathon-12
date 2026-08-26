import React, { useMemo, useState } from 'react'
import { HeroStatusPanel } from '../components/dashboard/HeroStatusPanel'
import { MetricKPICards } from '../components/dashboard/MetricKPICards'
import { NetworkTopologyCanvas } from '../components/network3d/NetworkTopologyCanvas'
import { ThreatOverviewTable } from '../components/dashboard/ThreatOverviewTable'
import { AIExplainabilityCard } from '../components/dashboard/AIExplainabilityCard'
import { LiveEventFeed } from '../components/dashboard/LiveEventFeed'
import { useDevices } from '../hooks/useDevices'
import { generateDynamic3DTopology } from '../utils/topologyGenerator'

export const OverviewPage: React.FC = () => {
  const { devices } = useDevices()
  const [simulatedLoad, setSimulatedLoad] = useState(14280)
  const [timeframe, setTimeframe] = useState<'realtime' | '24h' | '7d'>('realtime')

  const { nodes, links } = useMemo(() => {
    return generateDynamic3DTopology(devices)
  }, [devices])

  return (
    <div className="space-y-5">
      {/* 1. Hero Status Panel with Circular Risk Gauge */}
      <HeroStatusPanel />

      {/* Dynamic Cyber Control Hub */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Operations Telemetry Configurator
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Simulated Ingestion Load Slider */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono">Ingestion Load:</span>
            <input
              type="range"
              min="2000"
              max="50000"
              step="1000"
              value={simulatedLoad}
              onChange={(e) => setSimulatedLoad(Number(e.target.value))}
              className="w-24 sm:w-32 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="font-mono font-bold text-cyan-400 text-[11px] min-w-[70px] text-right">
              {simulatedLoad.toLocaleString()} pkts/s
            </span>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-slate-900/85 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            {(['realtime', '24h', '7d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold transition-all ${
                  timeframe === t
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'realtime' ? 'Real-Time' : t === '24h' ? '24h Hist' : '7d Window'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Key KPI Metric Cards with Animated Stats & Tooltips */}
      <MetricKPICards simulatedPackets={simulatedLoad} timeframe={timeframe} />

      {/* 3. Interactive 3D Network Topology Canvas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Interactive Network Topology (3D Spatial Telemetry)
          </h2>
          <span className="text-[11px] font-mono text-cyan-400">
            {nodes.length} Nodes • {links.length} Active Flows
          </span>
        </div>
        <NetworkTopologyCanvas
          nodes={nodes}
          links={links}
          height="h-[460px]"
          packetSpeedMultiplier={Math.max(0.5, simulatedLoad / 14280)}
        />
      </div>

      {/* 4. Two-Column Dashboard Split: Active Threats + AI Explainability Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-5">
          <ThreatOverviewTable />
          <LiveEventFeed />
        </div>

        <div className="lg:col-span-5 space-y-5">
          <AIExplainabilityCard />
        </div>
      </div>
    </div>
  )
}
