import React from 'react'
import { HeroStatusPanel } from '../components/dashboard/HeroStatusPanel'
import { MetricKPICards } from '../components/dashboard/MetricKPICards'
import { NetworkTopologyCanvas } from '../components/network3d/NetworkTopologyCanvas'
import { ThreatOverviewTable } from '../components/dashboard/ThreatOverviewTable'
import { AIExplainabilityCard } from '../components/dashboard/AIExplainabilityCard'
import { LiveEventFeed } from '../components/dashboard/LiveEventFeed'
import { demo3DNodes, demo3DLinks } from '../data/demo/network'

export const OverviewPage: React.FC = () => {
  return (
    <div className="space-y-5">
      {/* 1. Hero Status Panel with Circular Risk Gauge */}
      <HeroStatusPanel />

      {/* 2. Key KPI Metric Cards with Animated Stats & Tooltips */}
      <MetricKPICards />

      {/* 3. Interactive 3D Network Topology Canvas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Interactive Network Topology (3D Spatial Telemetry)
          </h2>
          <span className="text-[11px] font-mono text-cyan-400">
            {demo3DNodes.length} Nodes • {demo3DLinks.length} Active Flows
          </span>
        </div>
        <NetworkTopologyCanvas nodes={demo3DNodes} links={demo3DLinks} height="h-[460px]" />
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
