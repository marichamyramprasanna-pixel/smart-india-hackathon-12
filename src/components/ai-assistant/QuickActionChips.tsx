import React from 'react'
import {
  ShieldAlert,
  Laptop,
  BrainCircuit,
  Clock,
  Radio,
  FileText,
} from 'lucide-react'

interface QuickActionChipsProps {
  onSelectAction: (prompt: string) => void
}

export const QuickActionChips: React.FC<QuickActionChipsProps> = ({ onSelectAction }) => {
  const actions = [
    { label: 'Investigate Threats', prompt: 'List all active critical threats and triage status.', icon: <ShieldAlert className="h-3 w-3 text-red-400" /> },
    { label: 'Analyze DEVICE-042', prompt: 'Analyze DEVICE-042 telemetry deviations and compromise probability.', icon: <Laptop className="h-3 w-3 text-cyan-400" /> },
    { label: 'Explain AI Detection', prompt: 'Explain why SentinelX flagged DEVICE-042 through multivariate behavioral features.', icon: <BrainCircuit className="h-3 w-3 text-purple-400" /> },
    { label: 'Show Recent Incidents', prompt: 'Summarize recent network security incidents across all subnets.', icon: <Clock className="h-3 w-3 text-amber-400" /> },
    { label: 'Analyze Network', prompt: 'Provide a complete network baseline health assessment.', icon: <Radio className="h-3 w-3 text-emerald-400" /> },
    { label: 'Generate Incident Summary', prompt: 'Generate an executive incident summary for the active C2 compromise.', icon: <FileText className="h-3 w-3 text-blue-400" /> },
  ]

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin px-3">
      {actions.map((act, idx) => (
        <button
          key={idx}
          onClick={() => onSelectAction(act.prompt)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-850 text-[11px] text-slate-300 font-medium whitespace-nowrap transition-colors"
        >
          {act.icon}
          <span>{act.label}</span>
        </button>
      ))}
    </div>
  )
}
