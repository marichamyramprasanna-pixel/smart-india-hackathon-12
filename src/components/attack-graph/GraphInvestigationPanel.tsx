import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  ArrowRight,
  Laptop,
  Server,
  Zap,
  Lock,
  Unlock,
  ExternalLink,
  Flame,
  Globe,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { useInvestigation } from '../../context/InvestigationContext'
import { useSentinelAI } from '../../context/SentinelAIContext'
import { useDevices } from '../../hooks/useDevices'

interface GraphInvestigationPanelProps {
  selectedNodeId?: string
}

export const GraphInvestigationPanel: React.FC<GraphInvestigationPanelProps> = ({
  selectedNodeId,
}) => {
  const navigate = useNavigate()
  const { devices, setIsolation, isIsolating } = useDevices()
  const { isolateDevice, unisolateDevice, isDeviceIsolated, blockIp, isIpBlocked } =
    useInvestigation()
  const { toggleOpen, sendMessage, setCurrentContext } = useSentinelAI()

  const compromised = devices.filter((d) => d.status === 'COMPROMISED')
  const suspicious = devices.filter((d) => d.status === 'SUSPICIOUS')
  const fallbackDevice = compromised[0] || suspicious[0] || devices[0]

  const activeId = selectedNodeId || fallbackDevice?.id || 'NODE-INET'
  const matchedDevice = devices.find((d) => d.id === activeId)

  const isDevice = !!matchedDevice || activeId.startsWith('DEVICE-') || activeId.startsWith('WS-')
  const isIsolated = matchedDevice
    ? matchedDevice.isolationStatus?.isIsolated || isDeviceIsolated(matchedDevice.id)
    : isDeviceIsolated(activeId)

  const isC2 = activeId === 'C2-RELAY'
  const isC2Blocked = isIpBlocked('185.220.101.5')

  const handleAskAI = () => {
    if (matchedDevice) {
      setCurrentContext({ type: 'device', id: matchedDevice.id, name: matchedDevice.hostname })
    }
    toggleOpen()
    sendMessage(`Analyze the blast radius, multi-hop propagation, and forensic IoCs associated with ${activeId}.`)
  }

  const handleToggleIsolation = async () => {
    if (!matchedDevice) return
    const nextState = !isIsolated
    if (nextState) {
      isolateDevice(matchedDevice.id, matchedDevice.hostname, 'Graph containment action')
    } else {
      unisolateDevice(matchedDevice.id)
    }

    try {
      await setIsolation({
        deviceId: matchedDevice.id,
        isIsolated: nextState,
        reason: 'Quarantined from Attack Graph panel',
      })
    } catch {
      // Handled
    }
  }

  return (
    <Card variant="cyber" className="rounded-xl overflow-hidden p-4 space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
          ATTACK GRAPH INVESTIGATION
        </span>
        <h3 className="text-sm font-bold text-slate-100 mt-0.5">
          Selected Node: <span className="text-cyan-400 font-mono">{activeId}</span>
        </h3>
      </div>

      {/* Primary Node Telemetry State */}
      <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
            {isC2 ? <Flame className="h-3.5 w-3.5 text-red-400" /> : <Laptop className="h-3.5 w-3.5 text-cyan-400" />}
            {isC2 ? 'Adversary C2 Relay' : matchedDevice ? `${matchedDevice.department} Endpoint` : 'Network Asset'}
          </span>
          <Badge
            variant={matchedDevice?.status === 'COMPROMISED' || isC2 ? 'critical' : 'high'}
            className="text-[9px]"
          >
            {matchedDevice ? `${matchedDevice.riskScore}% RISK` : isC2 ? '99% RISK' : 'ACTIVE'}
          </Badge>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">IP Socket:</span>
            <span className="font-mono text-cyan-300">
              {matchedDevice?.ip || (isC2 ? '185.220.101.5' : '10.0.2.7')}
            </span>
          </div>
          {matchedDevice && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Hostname:</span>
              <span className="font-mono text-slate-200">{matchedDevice.hostname}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="font-mono text-slate-300">
              {matchedDevice?.status || (isC2 ? 'EXTERNAL_HOSTILE' : 'MONITORED')}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          {matchedDevice && (
            <button
              onClick={() => navigate(`/devices/${matchedDevice.id}`)}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Inspect Full Telemetry</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}

          {isC2 && (
            <Button
              variant={isC2Blocked ? 'secondary' : 'destructive'}
              size="sm"
              onClick={() => blockIp('185.220.101.5')}
              disabled={isC2Blocked}
              className="h-7 px-2.5 text-xs"
            >
              {isC2Blocked ? 'C2 IP Blocked' : 'Block C2 IP at Firewall'}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Tactical Actions */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <Button
          variant="ai"
          size="sm"
          onClick={handleAskAI}
          className="w-full gap-2 text-xs font-semibold justify-center h-9 shadow-purple-glow-sm"
        >
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>Ask Sentinel AI About {activeId}</span>
        </Button>

        {matchedDevice && (
          <Button
            variant={isIsolated ? 'secondary' : 'destructive'}
            size="sm"
            onClick={handleToggleIsolation}
            isLoading={isIsolating}
            className="w-full gap-2 text-xs font-semibold justify-center h-9"
          >
            {isIsolated ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            <span>{isIsolated ? `Release Quarantine on ${matchedDevice.id}` : `Quarantine ${matchedDevice.id}`}</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/reports')}
          className="w-full gap-2 text-xs font-semibold justify-center h-9 border-slate-700 text-slate-300 hover:text-slate-100"
        >
          <span>Export Incident Briefing</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  )
}
