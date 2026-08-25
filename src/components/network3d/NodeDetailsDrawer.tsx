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
  RotateCcw,
  ShieldBan,
  Archive,
} from 'lucide-react'
import { Network3DNode } from '../../types/network'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { useInvestigation } from '../../context/InvestigationContext'
import { useSentinelAI } from '../../context/SentinelAIContext'
import { deviceService, getDeletedDevices } from '../../services/deviceService'
import { formatBytes } from '../../utils/formatters'

interface NodeDetailsDrawerProps {
  node: Network3DNode | null
  onClose: () => void
}

export const NodeDetailsDrawer: React.FC<NodeDetailsDrawerProps> = ({ node, onClose }) => {
  const navigate = useNavigate()
  const { isolateDevice, unisolateDevice, isDeviceIsolated, unblockIp } = useInvestigation()
  const { toggleOpen, sendMessage, setCurrentContext } = useSentinelAI()

  if (!node) return null

  const isIsolated = isDeviceIsolated(node.id) || node.isIsolated || node.status === 'ISOLATED'
  const isDecomm = node.isDecommissioned || node.status === 'DECOMMISSIONED'
  const isBlockedIp = node.status === 'BLOCKED_PERIMETER'

  const handleInvestigate = () => {
    if (isDecomm) {
      navigate('/deleted-devices')
    } else if (isBlockedIp || isIsolated) {
      navigate('/blocked-devices')
    } else {
      navigate(`/devices/${node.id}`)
    }
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

  const handleRestoreTombstone = async () => {
    const deletedList = getDeletedDevices()
    const target = deletedList.find((d) => d.id === node.id)
    if (target) {
      await deviceService.restoreDevice(target)
      onClose()
      window.location.reload()
    }
  }

  const handleToggleQuarantine = () => {
    if (isIsolated) {
      unisolateDevice(node.id)
    } else {
      isolateDevice(node.id, node.label, 'Manual 802.1X Port Quarantine via 3D Spatial Visualizer')
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[420px] bg-slate-950/95 border-l border-slate-800 backdrop-blur-xl p-5 shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200 font-mono text-xs">
      <div>
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${
              isIsolated
                ? 'bg-red-950/80 border-red-500/60 text-red-400'
                : isBlockedIp
                ? 'bg-red-950/80 border-red-500/60 text-red-400'
                : isDecomm
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-cyan-400'
            }`}>
              {isDecomm ? (
                <Archive className="h-5 w-5" />
              ) : isIsolated || isBlockedIp ? (
                <ShieldBan className="h-5 w-5" />
              ) : (
                <Radio className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold text-slate-100">{node.id}</h3>
                <Badge
                  variant={
                    isIsolated ? 'critical' :
                    isBlockedIp ? 'critical' :
                    isDecomm ? 'medium' :
                    node.status === 'COMPROMISED' ? 'critical' :
                    node.status === 'SUSPICIOUS' ? 'high' : 'healthy'
                  }
                  pulse={isIsolated || node.status === 'COMPROMISED'}
                  className="text-[10px]"
                >
                  {isIsolated ? '802.1X ISOLATED' : isBlockedIp ? 'FW DROP' : isDecomm ? 'DECOMMISSIONED' : node.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[240px]">{node.label}</p>
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

        {/* Status Notice Card */}
        {isIsolated && (
          <div className="mt-4 p-3 rounded-xl border border-red-500/50 bg-red-950/40 text-red-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <Lock className="h-3.5 w-3.5" />
              <span>802.1X PORT QUARANTINE ENFORCED</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Endpoint is segregated into VLAN-999 Remediation Subnet. Packet traffic is null-routed.
            </p>
          </div>
        )}

        {isDecomm && (
          <div className="mt-4 p-3 rounded-xl border border-amber-500/50 bg-amber-950/40 text-amber-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Archive className="h-3.5 w-3.5" />
              <span>TOMBSTONE ARCHIVAL NODE</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Asset retired from active inventory. Forensic telemetry snapshot preserved in archive.
            </p>
          </div>
        )}

        {/* Risk Score & Compromise Probability Gauge Card */}
        <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Compromise Probability
              </span>
              <div className="text-2xl font-bold font-mono text-slate-100 mt-0.5">
                {node.compromiseProbability || node.riskScore || 0}%
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Bayesian Risk
              </span>
              <div
                className={`text-2xl font-bold font-mono mt-0.5 ${
                  node.riskScore > 75
                    ? 'text-red-400'
                    : node.riskScore > 40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {node.riskScore}/100
              </div>
            </div>
          </div>

          <div className="mt-3 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                node.riskScore > 75
                  ? 'bg-red-500'
                  : node.riskScore > 40
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${node.riskScore}%` }}
            />
          </div>
        </div>

        {/* Node Telemetry Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">IPV4 ADDRESS</span>
            <span className="font-bold text-slate-200">{node.ip}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">TOPOLOGY ZONE</span>
            <span className="font-bold text-cyan-300">{node.zone}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">ACTIVE SOCKETS</span>
            <span className="font-bold text-slate-200">
              {node.activeConnectionsCount} Established
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">BANDWIDTH RATE</span>
            <span className="font-bold text-slate-200">
              {node.bandwidthMbps} Mbps
            </span>
          </div>
        </div>

        {/* Active Behavioral Anomalies */}
        {node.anomalies && node.anomalies.length > 0 && (
          <div className="mt-4 space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Flagged Behavioral Telemetry
            </span>
            <div className="space-y-1.5">
              {node.anomalies.map((anom, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span>{anom}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
        {/* Dynamic Action: Restore Tombstone / Release Quarantine / Quarantine */}
        {isDecomm ? (
          <Button
            variant="primary"
            size="sm"
            onClick={handleRestoreTombstone}
            className="w-full text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-500"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restore to Active 3D Inventory</span>
          </Button>
        ) : isBlockedIp ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              unblockIp(node.ip)
              onClose()
            }}
            className="w-full text-xs font-semibold gap-1.5 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40"
          >
            <Unlock className="h-3.5 w-3.5" />
            <span>Unblock Perimeter IP</span>
          </Button>
        ) : (
          <Button
            variant={isIsolated ? 'outline' : 'destructive'}
            size="sm"
            onClick={handleToggleQuarantine}
            className={`w-full text-xs font-semibold gap-1.5 ${
              isIsolated
                ? 'border-emerald-500/50 text-emerald-300 hover:bg-emerald-950/40'
                : 'bg-red-600 hover:bg-red-500 shadow-neon-red/30'
            }`}
          >
            {isIsolated ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            <span>{isIsolated ? 'Release 802.1X Quarantine' : 'Quarantine Device (802.1X)'}</span>
          </Button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAskAI}
            className="text-xs gap-1.5 border-purple-500/40 text-purple-300 hover:bg-purple-950/30"
          >
            <Zap className="h-3.5 w-3.5 text-purple-400" />
            <span>Ask Sentinel AI</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleInvestigate}
            className="text-xs gap-1.5"
          >
            <span>Full Forensics</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
