import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  Zap,
  Network,
  Clock,
  Lock,
  Unlock,
  Radio,
} from 'lucide-react'
import { Network3DNode } from '../../types/network'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { useInvestigation } from '../../context/InvestigationContext'
import { useSentinelAI } from '../../context/SentinelAIContext'
import { formatBytes } from '../../utils/formatters'

interface NodeDetailsDrawerProps {
  node: Network3DNode | null
  onClose: () => void
}

export const NodeDetailsDrawer: React.FC<NodeDetailsDrawerProps> = ({ node, onClose }) => {
  const navigate = useNavigate()
  const { isolateDevice, unisolateDevice, isDeviceIsolated } = useInvestigation()
  const { toggleOpen, sendMessage, setCurrentContext } = useSentinelAI()

  if (!node) return null

  const isIsolated = isDeviceIsolated(node.id)

  const handleInvestigate = () => {
    navigate(`/devices/${node.id}`)
    onClose()
  }

  const handleTracePath = () => {
    navigate('/attack-graph')
    onClose()
  }

  const handleViewTimeline = () => {
    navigate('/timeline')
    onClose()
  }

  const handleAskAI = () => {
    setCurrentContext({ type: 'device', id: node.id, name: node.label })
    toggleOpen()
    sendMessage(`Provide an AI behavioral assessment for ${node.id} (${node.label}).`)
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[420px] bg-slate-950/95 border-l border-slate-800 backdrop-blur-xl p-5 shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
      <div>
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
              <Radio className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold text-slate-100">{node.id}</h3>
                <Badge
                  variant={
                    node.status === 'COMPROMISED' ? 'critical' :
                    node.status === 'SUSPICIOUS' ? 'high' :
                    node.status === 'AI_FLAGGED' ? 'ai' : 'healthy'
                  }
                  pulse={node.status === 'COMPROMISED'}
                  className="text-[10px]"
                >
                  {node.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">{node.label}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Risk Score & Compromise Probability Gauge Card */}
        <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Compromise Probability
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-display font-bold font-mono-numbers ${
                  node.compromiseProbability >= 80 ? 'text-red-400' :
                  node.compromiseProbability >= 50 ? 'text-orange-400' : 'text-cyan-400'
                }`}>
                  {node.compromiseProbability}%
                </span>
                <span className="text-xs text-slate-400">Bayesian Posterior</span>
              </div>
            </div>

            {/* Circular Mini Gauge */}
            <div className="relative h-14 w-14 flex items-center justify-center">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    node.compromiseProbability >= 80 ? 'text-red-500 stroke-red-500' :
                    node.compromiseProbability >= 50 ? 'text-orange-500 stroke-orange-500' : 'text-cyan-400 stroke-cyan-400'
                  }
                  strokeDasharray={`${node.compromiseProbability}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-mono font-bold text-slate-200">
                {node.riskScore}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 text-[11px]">IP Address:</span>
              <p className="font-mono text-slate-200">{node.ip}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Network Zone:</span>
              <p className="text-slate-200">{node.zone}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Active Conns:</span>
              <p className="font-mono text-slate-200">{node.activeConnectionsCount}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Bandwidth:</span>
              <p className="font-mono text-slate-200">{node.bandwidthMbps} Mbps</p>
            </div>
          </div>
        </div>

        {/* Behavioral Anomalies List */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Observed Anomalies ({node.anomalies.length})
            </span>
          </div>

          {node.anomalies.length === 0 ? (
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 text-xs text-slate-400">
              No behavioral anomalies detected. All parameters within baseline.
            </div>
          ) : (
            <div className="space-y-2">
              {node.anomalies.map((anomaly, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg border border-red-500/25 bg-red-950/20 text-xs text-slate-200"
                >
                  <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{anomaly}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Isolation Status Flag */}
        {isIsolated && (
          <div className="mt-4 p-3 rounded-lg border border-amber-500/40 bg-amber-950/30 flex items-center gap-2.5 text-xs text-amber-200">
            <Lock className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Host is currently <strong>quarantined</strong> from enterprise VLAN.</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleInvestigate}
            className="w-full gap-1.5 text-xs font-semibold"
          >
            <span>Investigate</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleTracePath}
            className="w-full gap-1.5 text-xs"
          >
            <Network className="h-3.5 w-3.5" />
            <span>Trace Path</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleViewTimeline}
            className="w-full gap-1.5 text-xs"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>View Timeline</span>
          </Button>

          <Button
            variant="ai"
            size="sm"
            onClick={handleAskAI}
            className="w-full gap-1.5 text-xs"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Ask Sentinel AI</span>
          </Button>
        </div>

        {/* Isolation Toggle */}
        <Button
          variant={isIsolated ? 'secondary' : 'destructive'}
          size="sm"
          onClick={() => {
            if (isIsolated) unisolateDevice(node.id)
            else isolateDevice(node.id, node.label)
          }}
          className="w-full gap-1.5 text-xs mt-1"
        >
          {isIsolated ? (
            <>
              <Unlock className="h-3.5 w-3.5" />
              <span>Release Quarantine</span>
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              <span>Isolate Host from Network</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
