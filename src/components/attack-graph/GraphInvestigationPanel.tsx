import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  ArrowRight,
  Laptop,
  Server,
  Zap,
  Lock,
  ExternalLink,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { useInvestigation } from '../../context/InvestigationContext'
import { useSentinelAI } from '../../context/SentinelAIContext'

interface GraphInvestigationPanelProps {
  selectedNodeId?: string
}

export const GraphInvestigationPanel: React.FC<GraphInvestigationPanelProps> = ({
  selectedNodeId = 'DEVICE-042',
}) => {
  const navigate = useNavigate()
  const { isolateDevice, isDeviceIsolated } = useInvestigation()
  const { toggleOpen, sendMessage, setCurrentContext } = useSentinelAI()

  const isIsolated = isDeviceIsolated('DEVICE-042')

  const handleAskAI = () => {
    setCurrentContext({ type: 'device', id: 'DEVICE-042', name: 'FIN-WS-042' })
    toggleOpen()
    sendMessage('Analyze the blast radius and multi-hop attack progression from DEVICE-042 to SERVER-07.')
  }

  return (
    <Card variant="cyber" className="rounded-xl overflow-hidden p-4 space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
          ATTACK GRAPH INVESTIGATION
        </span>
        <h3 className="text-sm font-bold text-slate-100 mt-0.5">
          Compromise Blast Radius & Correlation
        </h3>
      </div>

      {/* Primary Suspicious Endpoint */}
      <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-950/20 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-red-400 font-bold">
            Initial Compromised Endpoint
          </span>
          <Badge variant="critical" className="text-[9px]">94% PROBABILITY</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-mono font-bold text-slate-100">DEVICE-042</h4>
            <p className="text-[11px] text-slate-400">FIN-WS-042.internal.corp (10.0.4.42)</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/devices/DEVICE-042')}
            className="text-xs h-7 gap-1 font-semibold"
          >
            <span>Triage</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Related Targeted Entities */}
      <div>
        <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block mb-2">
          Downstream Impacted Assets (2)
        </span>
        <div className="space-y-2">
          <div
            onClick={() => navigate('/devices/SERVER-07')}
            className="p-3 rounded-lg border border-orange-500/30 bg-slate-900/60 hover:bg-slate-850 cursor-pointer transition-colors flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2.5">
              <Server className="h-4 w-4 text-orange-400" />
              <div>
                <span className="font-mono font-bold text-slate-200">SERVER-07</span>
                <p className="text-[10px] text-slate-400">DB-CORE-07 (Production DB)</p>
              </div>
            </div>
            <Badge variant="high" className="text-[9px]">78% RISK</Badge>
          </div>

          <div
            onClick={() => navigate('/devices/DEVICE-118')}
            className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-850 cursor-pointer transition-colors flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2.5">
              <Laptop className="h-4 w-4 text-slate-400" />
              <div>
                <span className="font-mono font-bold text-slate-200">DEVICE-118</span>
                <p className="text-[10px] text-slate-400">ENG-LAP-118 (Engineering)</p>
              </div>
            </div>
            <Badge variant="low" className="text-[9px]">58% RISK</Badge>
          </div>
        </div>
      </div>

      {/* AI Confidence & Containment CTA */}
      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Correlation Confidence:</span>
          <span className="font-mono font-bold text-cyan-300">89.2% Calibrated</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Lateral movement from DEVICE-042 to SERVER-07 matches Pass-the-Hash staging. Quarantine is advised before credentials rotate.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        <Button
          variant="ai"
          size="sm"
          onClick={handleAskAI}
          className="w-full text-xs gap-1.5"
        >
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>Ask AI Copilot</span>
        </Button>

        <Button
          variant={isIsolated ? 'secondary' : 'destructive'}
          size="sm"
          onClick={() => isolateDevice('DEVICE-042', 'FIN-WS-042')}
          disabled={isIsolated}
          className="w-full text-xs gap-1.5"
        >
          <Lock className="h-3.5 w-3.5" />
          <span>{isIsolated ? 'Quarantined' : 'Isolate 042'}</span>
        </Button>
      </div>
    </Card>
  )
}
