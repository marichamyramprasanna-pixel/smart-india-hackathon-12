import React from 'react'
import {
  Laptop,
  Lock,
  Unlock,
  ShieldAlert,
  Activity,
  User,
  Building,
  Clock,
  Radio,
  FileDown,
} from 'lucide-react'
import { DeviceTelemetry } from '../../types/device'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { useInvestigation } from '../../context/InvestigationContext'
import { useDemoScenario } from '../../context/DemoScenarioContext'

interface DeviceHeaderProps {
  device: DeviceTelemetry
}

export const DeviceHeader: React.FC<DeviceHeaderProps> = ({ device }) => {
  const { isolateDevice, unisolateDevice, isDeviceIsolated } = useInvestigation()
  const { currentStage } = useDemoScenario()

  const isIsolated = isDeviceIsolated(device.id)

  // Use dynamic reactive risk if it's DEVICE-042
  const riskScore = device.id === 'DEVICE-042' ? currentStage.device42Risk : device.riskScore
  const compromiseProb = device.id === 'DEVICE-042' ? currentStage.compromiseProbability : device.compromiseProbability

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl p-5 md:p-6 shadow-2xl space-y-4">
      {/* Top row: Status, Host ID, Risk Gauge & Action */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 shrink-0">
            <Laptop className="h-6 w-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-mono font-bold text-slate-100">
                {device.id}
              </h1>
              <Badge
                variant={
                  device.status === 'COMPROMISED' ? 'critical' :
                  device.status === 'SUSPICIOUS' ? 'high' : 'healthy'
                }
                pulse={device.status === 'COMPROMISED'}
                className="text-xs font-mono font-bold"
              >
                {device.status}
              </Badge>
              {isIsolated && (
                <Badge variant="medium" className="text-xs font-mono">
                  <Lock className="h-3 w-3 mr-1" /> QUARANTINED
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{device.hostname}</p>
          </div>
        </div>

        {/* Risk Gauges & Quick Quarantine Action */}
        <div className="flex items-center gap-4 sm:gap-6 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-6">
          <div className="text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Compromise Prob
            </span>
            <span className={`text-2xl font-display font-extrabold font-mono-numbers ${
              compromiseProb >= 80 ? 'text-red-400' : compromiseProb >= 50 ? 'text-orange-400' : 'text-cyan-400'
            }`}>
              {compromiseProb}%
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Risk Score
            </span>
            <span className={`text-2xl font-display font-extrabold font-mono-numbers ${
              riskScore >= 80 ? 'text-red-400' : riskScore >= 50 ? 'text-orange-400' : 'text-cyan-400'
            }`}>
              {riskScore}/100
            </span>
          </div>

          <Button
            variant={isIsolated ? 'secondary' : 'destructive'}
            size="sm"
            onClick={() => {
              if (isIsolated) unisolateDevice(device.id)
              else isolateDevice(device.id, device.hostname)
            }}
            className="text-xs gap-1.5 whitespace-nowrap shadow-red-glow-sm"
          >
            {isIsolated ? (
              <>
                <Unlock className="h-3.5 w-3.5" />
                <span>Release Host</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                <span>Isolate Host</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-800 text-xs">
        <div>
          <span className="text-slate-500 text-[11px] block">IP Address:</span>
          <span className="font-mono text-slate-200 font-medium">{device.ip}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[11px] block">MAC Address:</span>
          <span className="font-mono text-slate-300">{device.mac}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[11px] block">Operating System:</span>
          <span className="text-slate-200 truncate block">{device.os}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[11px] block">Department:</span>
          <span className="text-slate-200 truncate block">{device.department}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[11px] block">Assigned Owner:</span>
          <span className="text-slate-200 truncate block">{device.owner}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[11px] block">Telemetry Status:</span>
          <span className="text-emerald-400 font-mono font-medium">ONLINE (STREAMING)</span>
        </div>
      </div>
    </div>
  )
}
