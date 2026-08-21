import React, { useState } from 'react'
import { AttackGraphCanvas } from '../components/attack-graph/AttackGraphCanvas'
import { GraphInvestigationPanel } from '../components/attack-graph/GraphInvestigationPanel'
import { Network, ShieldAlert } from 'lucide-react'
import { Badge } from '../components/common/Badge'

export const AttackGraphPage: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('DEVICE-042')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              PATH ANALYSIS
            </span>
            <span className="text-xs font-mono text-slate-400">
              Adversary Hop Chain
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
            Visual Attack Graph & Blast Radius
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-hop correlation tracing ingress from external C2 infrastructure through patient zero to internal database tier.
          </p>
        </div>

        <Badge variant="critical" pulse className="font-mono text-xs">
          LATERAL HOP DETECTED
        </Badge>
      </div>

      {/* Grid: Attack Path Visualizer + Investigation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <AttackGraphCanvas
            selectedNodeId={selectedNodeId}
            onSelectNode={(node) => setSelectedNodeId(node.id)}
          />
        </div>

        <div className="lg:col-span-4 space-y-5">
          <GraphInvestigationPanel selectedNodeId={selectedNodeId} />
        </div>
      </div>
    </div>
  )
}
