import React from 'react'
import { AttackTimelineEvent } from '../../types/timeline'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../common/Dialog'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { ShieldCheck, ShieldAlert, Cpu, Sparkles } from 'lucide-react'

interface TimelineEventDetailProps {
  event: AttackTimelineEvent | null
  onClose: () => void
}

export const TimelineEventDetail: React.FC<TimelineEventDetailProps> = ({ event, onClose }) => {
  if (!event) return null

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-slate-950 border-slate-700">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-cyan-400 text-xs font-bold">STAGE 0{event.stageNumber}</span>
            <span className="font-mono text-slate-400 text-xs">[{event.timeStr} UTC]</span>
            <Badge variant={event.severity === 'CRITICAL' ? 'critical' : 'high'} className="text-[10px]">
              {event.severity}
            </Badge>
          </div>
          <DialogTitle className="text-base text-slate-100">{event.title}</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Target Host: <strong className="text-cyan-300">{event.deviceId}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div>
            <h4 className="font-mono text-[11px] text-slate-400 uppercase font-semibold mb-1">Observed Anomaly Description</h4>
            <p className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Technical Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="font-mono text-[10px] text-slate-500 uppercase block">MITRE Technique</span>
              <span className="font-mono font-bold text-slate-200">{event.technicalDetails.mitreTechniqueId || 'N/A'}</span>
              <p className="text-[10px] text-slate-400">{event.technicalDetails.mitreTactic}</p>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="font-mono text-[10px] text-slate-500 uppercase block">Statistical Baseline Delta</span>
              <span className="font-mono font-bold text-orange-400">{event.technicalDetails.baselineComparison}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-950/20 text-purple-200">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-purple-300 font-bold mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Recommended Containment Playbook</span>
            </div>
            <p className="leading-relaxed">{event.recommendedAction}</p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-800 pt-3">
          <Button variant="primary" size="sm" onClick={onClose} className="text-xs font-semibold">
            Close Inspection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
