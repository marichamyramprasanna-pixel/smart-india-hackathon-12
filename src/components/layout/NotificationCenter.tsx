import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ShieldAlert, CheckCircle, ArrowRight, X } from 'lucide-react'
import { useDemoScenario } from '../../context/DemoScenarioContext'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'

interface NotificationCenterProps {
  onClose: () => void
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const navigate = useNavigate()
  const { currentStage, threatsList } = useDemoScenario()

  return (
    <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-cyan-400" />
          <h4 className="text-sm font-semibold text-slate-100">SOC Notifications</h4>
          {threatsList.length > 0 && (
            <Badge variant="critical" className="text-[10px] px-1.5 py-0">
              {threatsList.length} Active
            </Badge>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:text-slate-100"
          aria-label="Close notifications"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1">
        {threatsList.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-400/60 mb-2" />
            <p className="font-medium text-slate-300">No unhandled security alerts</p>
            <p className="text-[11px] text-slate-500 mt-1">Network is operating within normal baseline.</p>
          </div>
        ) : (
          threatsList.map((threat) => (
            <div
              key={threat.id}
              onClick={() => {
                navigate('/threats')
                onClose()
              }}
              className="group cursor-pointer rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 transition-colors hover:border-cyan-500/40 hover:bg-slate-850"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] font-bold text-red-400">
                  {threat.alertCode}
                </span>
                <span className="text-[10px] text-slate-500">{threat.detectedAt}</span>
              </div>
              <p className="text-xs font-medium text-slate-200 line-clamp-1 group-hover:text-cyan-300">
                {threat.title}
              </p>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Target: <strong className="text-slate-300">{threat.deviceId}</strong></span>
                <span className="font-mono text-orange-400">{threat.confidenceScore}% conf</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">Telemetry: {currentStage.timeStr} UTC</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigate('/threats')
            onClose()
          }}
          className="text-xs text-cyan-400 hover:text-cyan-300 p-0 h-auto gap-1"
        >
          <span>View all threats</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
