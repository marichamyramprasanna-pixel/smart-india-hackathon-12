import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  ArrowUpRight,
  Lock,
  CheckCircle,
  BrainCircuit,
  ExternalLink,
  Check,
} from 'lucide-react'
import { ThreatAlert } from '../../types/threat'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../common/Dialog'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { useInvestigation } from '../../context/InvestigationContext'

interface ThreatDetailModalProps {
  threat: ThreatAlert | null
  onClose: () => void
}

export const ThreatDetailModal: React.FC<ThreatDetailModalProps> = ({ threat, onClose }) => {
  const navigate = useNavigate()
  const { isolateDevice, isDeviceIsolated, blockIp, isIpBlocked } = useInvestigation()

  if (!threat) return null

  const isIsolated = isDeviceIsolated(threat.deviceId)

  return (
    <Dialog open={!!threat} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-slate-950 border-slate-700">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-red-400 text-sm">{threat.alertCode}</span>
            <Badge
              variant={threat.severity === 'CRITICAL' ? 'critical' : 'high'}
              className="text-[10px]"
            >
              {threat.severity}
            </Badge>
          </div>
          <DialogTitle className="text-base text-slate-100">{threat.title}</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Detected on target endpoint <strong className="text-cyan-300">{threat.deviceId}</strong> ({threat.deviceIp})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div>
            <h4 className="font-mono text-[11px] text-slate-400 uppercase font-semibold mb-1">Incident Summary</h4>
            <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              {threat.summary}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-950/20 text-purple-200">
            <div className="flex items-center gap-2 font-mono font-semibold text-purple-300 mb-1">
              <BrainCircuit className="h-4 w-4" />
              <span>AI Behavioral Explanation</span>
            </div>
            <p className="italic leading-relaxed">{threat.aiExplanation}</p>
          </div>

          <div>
            <h4 className="font-mono text-[11px] text-slate-400 uppercase font-semibold mb-1.5">
              Correlated Evidence & Bad IoCs
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {threat.indicators.map((ioc, idx) => {
                const isIp = ioc.type === 'IP' || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ioc.value)
                const blocked = isIp ? isIpBlocked(ioc.value) : false

                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">
                        {ioc.type}
                      </span>
                      <p className="font-mono font-bold text-slate-100 truncate mt-0.5">
                        {ioc.value}
                      </p>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {ioc.reputation}
                      </span>
                    </div>

                    {isIp && !ioc.value.startsWith('10.') && (
                      <Button
                        variant={blocked ? 'secondary' : 'destructive'}
                        size="sm"
                        onClick={() => blockIp(ioc.value, `Malicious IP in alert ${threat.alertCode}`)}
                        disabled={blocked}
                        className="h-6 px-2 text-[10px] font-mono shrink-0"
                      >
                        {blocked ? (
                          <span className="flex items-center gap-0.5 text-emerald-400">
                            <Check className="h-3 w-3" /> Blocked
                          </span>
                        ) : (
                          'Block IP'
                        )}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <Button
            variant={isIsolated ? 'secondary' : 'destructive'}
            size="sm"
            onClick={() => isolateDevice(threat.deviceId, threat.deviceHostname)}
            disabled={isIsolated}
            className="text-xs"
          >
            <Lock className="h-3.5 w-3.5 mr-1" />
            <span>{isIsolated ? 'Device Quarantined' : 'Quarantine Host'}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              navigate(`/devices/${threat.deviceId}`)
              onClose()
            }}
            className="text-xs font-semibold gap-1.5"
          >
            <span>Open Device Console</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
