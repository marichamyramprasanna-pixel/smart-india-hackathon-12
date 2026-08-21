import React from 'react'
import { AttackTimelineView } from '../components/timeline/AttackTimelineView'
import { Clock, ShieldAlert } from 'lucide-react'
import { Badge } from '../components/common/Badge'
import { useDemoScenario } from '../context/DemoScenarioContext'

export const AttackTimelinePage: React.FC = () => {
  const { currentStage } = useDemoScenario()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              CHRONOLOGY
            </span>
            <span className="text-xs font-mono text-slate-400">
              Stage {currentStage.stageNumber} of 6
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
            Interactive Attack Progression Timeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Chronological reconstruction of compromise stages from initial authentication anomaly (09:12) to high compromise probability (09:25).
          </p>
        </div>

        <Badge variant="critical" pulse className="font-mono text-xs">
          7 CHRONOLOGICAL EVENTS
        </Badge>
      </div>

      {/* Main Interactive Attack Timeline */}
      <AttackTimelineView />
    </div>
  )
}
