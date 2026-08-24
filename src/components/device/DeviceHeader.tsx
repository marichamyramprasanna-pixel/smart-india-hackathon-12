import React, { useState } from 'react'
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
  Trash2,
} from 'lucide-react'
import { DeviceTelemetry } from '../../types/device'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../common/Dialog'
import { useInvestigation } from '../../context/InvestigationContext'

interface DeviceHeaderProps {
  device: DeviceTelemetry
  onDelete?: () => void
}

export const DeviceHeader: React.FC<DeviceHeaderProps> = ({ device, onDelete }) => {
  const { isolateDevice, unisolateDevice, isDeviceIsolated } = useInvestigation()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const isIsolated = isDeviceIsolated(device.id)
  const riskScore = device.riskScore
  const compromiseProb = device.compromiseProbability

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
                  device.status === 'COMPROMISED'
                    ? 'critical'
                    : device.status === 'SUSPICIOUS'
                    ? 'high'
                    : 'healthy'
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

        {/* Risk Gauges & Quick Actions */}
        <div className="flex items-center gap-4 sm:gap-6 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-6">
          <div className="text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Compromise Prob
            </span>
            <span
              className={`text-2xl font-display font-extrabold font-mono-numbers ${
                compromiseProb >= 80
                  ? 'text-red-400'
                  : compromiseProb >= 50
                  ? 'text-orange-400'
                  : 'text-cyan-400'
              }`}
            >
              {compromiseProb}%
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Risk Score
            </span>
            <span
              className={`text-2xl font-display font-extrabold font-mono-numbers ${
                riskScore >= 80
                  ? 'text-red-400'
                  : riskScore >= 50
                  ? 'text-orange-400'
                  : 'text-cyan-400'
              }`}
            >
              {riskScore}/100
            </span>
          </div>

          <div className="flex items-center gap-2">
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

            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-xs gap-1 border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            )}
          </div>
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
          <span className="font-mono text-slate-300">{device.mac || '—'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[11px] block">Operating System:</span>
          <span className="text-slate-200 truncate block">{device.os || device.type}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[11px] block">Department:</span>
          <span className="text-slate-200 truncate block">{device.department || '—'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[11px] block">Assigned Owner:</span>
          <span className="text-slate-200 truncate block">{device.owner || '—'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[11px] block">Telemetry Status:</span>
          <span className="text-emerald-400 font-mono font-medium">ONLINE (STREAMING)</span>
        </div>
      </div>

      {/* Delete Device Modal */}
      {onDelete && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md bg-slate-950 border-slate-800">
            <DialogHeader className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <Trash2 className="h-5 w-5" />
                <DialogTitle className="text-base text-slate-100">Delete Device Record</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-400">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-200 font-mono">{device.id}</strong> (
                <span className="font-mono text-cyan-300">{device.hostname}</span>)?
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 text-xs text-slate-300 space-y-2">
              <p>
                This will remove all associated telemetry, NetFlow history, and AI baseline models for this device from Supabase.
              </p>
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 text-[11px]">
                ⚠️ This action cannot be undone.
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  onDelete()
                }}
                className="text-xs font-semibold gap-1.5 shadow-red-glow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Confirm Delete</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
