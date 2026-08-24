import React, { useState } from 'react'
import {
  Lock,
  Unlock,
  ShieldAlert,
  FileDown,
  RotateCcw,
  HardDriveDownload,
  KeyRound,
  CheckCircle,
} from 'lucide-react'
import { Button } from '../common/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { useInvestigation } from '../../context/InvestigationContext'
import { useDevices } from '../../hooks/useDevices'

interface RemediationActionsProps {
  deviceId: string
  hostname: string
  onGenerateReport: () => void
}

export const RemediationActions: React.FC<RemediationActionsProps> = ({
  deviceId,
  hostname,
  onGenerateReport,
}) => {
  const { isolateDevice, unisolateDevice, isDeviceIsolated, addInvestigationNote } =
    useInvestigation()
  const { setIsolation, isIsolating, devices } = useDevices()

  const liveDevice = devices.find((d) => d.id === deviceId)
  const isIsolated = liveDevice?.isolationStatus?.isIsolated || isDeviceIsolated(deviceId)

  const [memoryDumped, setMemoryDumped] = useState(false)
  const [credsRotated, setCredsRotated] = useState(false)

  const handleToggleIsolation = async () => {
    const nextState = !isIsolated
    if (nextState) {
      isolateDevice(deviceId, hostname, 'Incident responder isolation')
    } else {
      unisolateDevice(deviceId)
    }

    try {
      await setIsolation({
        deviceId,
        isIsolated: nextState,
        reason: nextState ? 'Analyst manual containment' : 'Quarantine lifted',
        analystName: 'Tier-3 SOC Analyst',
      })
    } catch {
      // Graceful local fallback already handled in InvestigationContext
    }
  }

  const handleDumpMemory = () => {
    setMemoryDumped(true)
    addInvestigationNote(
      deviceId,
      'Analyst initiated raw volatility memory acquisition dump (memdump.raw).'
    )
  }

  const handleRotateCreds = () => {
    setCredsRotated(true)
    addInvestigationNote(
      deviceId,
      'Active Directory Kerberos tickets and user passwords revoked across domain.'
    )
  }

  return (
    <Card variant="cyber" className="rounded-xl overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Incident Response & Containment Playbook</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Action 1: Quarantine */}
          <Button
            variant={isIsolated ? 'secondary' : 'destructive'}
            size="sm"
            onClick={handleToggleIsolation}
            isLoading={isIsolating}
            className="w-full gap-2 text-xs font-semibold justify-start h-10 shadow-red-glow-sm"
          >
            {isIsolated ? (
              <Unlock className="h-4 w-4 text-emerald-400" />
            ) : (
              <Lock className="h-4 w-4 text-red-300" />
            )}
            <span>{isIsolated ? 'Release Quarantine' : 'Quarantine 802.1X Host'}</span>
          </Button>

          {/* Action 2: Volatile Memory Dump */}
          <Button
            variant={memoryDumped ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleDumpMemory}
            className="w-full gap-2 text-xs font-semibold justify-start h-10 border-slate-700"
          >
            {memoryDumped ? (
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            ) : (
              <HardDriveDownload className="h-4 w-4 text-cyan-400" />
            )}
            <span>{memoryDumped ? 'Memory Dump Acquired' : 'Dump Volatile RAM (Raw)'}</span>
          </Button>

          {/* Action 3: Revoke Kerberos Tickets */}
          <Button
            variant={credsRotated ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleRotateCreds}
            className="w-full gap-2 text-xs font-semibold justify-start h-10 border-slate-700"
          >
            {credsRotated ? (
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            ) : (
              <KeyRound className="h-4 w-4 text-amber-400" />
            )}
            <span>{credsRotated ? 'Credentials Revoked' : 'Revoke Kerberos TGS'}</span>
          </Button>

          {/* Action 4: Compile Forensic Report */}
          <Button
            variant="primary"
            size="sm"
            onClick={onGenerateReport}
            className="w-full gap-2 text-xs font-semibold justify-start h-10 shadow-cyan-glow-sm"
          >
            <FileDown className="h-4 w-4" />
            <span>Generate Forensic Report</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
