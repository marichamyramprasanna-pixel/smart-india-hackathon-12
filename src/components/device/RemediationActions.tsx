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
  const { isolateDevice, unisolateDevice, isDeviceIsolated, addInvestigationNote } = useInvestigation()
  const isIsolated = isDeviceIsolated(deviceId)
  const [memoryDumped, setMemoryDumped] = useState(false)
  const [credsRotated, setCredsRotated] = useState(false)

  const handleDumpMemory = () => {
    setMemoryDumped(true)
    addInvestigationNote(deviceId, 'Analyst initiated raw volatility memory acquisition dump (memdump.raw).')
  }

  const handleRotateCreds = () => {
    setCredsRotated(true)
    addInvestigationNote(deviceId, 'Active Directory Kerberos tickets and user passwords revoked across domain.')
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
            onClick={() => {
              if (isIsolated) unisolateDevice(deviceId)
              else isolateDevice(deviceId, hostname, 'Incident responder isolation')
            }}
            className="w-full gap-2 text-xs font-semibold justify-start h-10 shadow-red-glow-sm"
          >
            {isIsolated ? <Unlock className="h-4 w-4 text-emerald-400" /> : <Lock className="h-4 w-4 text-red-300" />}
            <span>{isIsolated ? 'Release Quarantine' : 'Quarantine 802.1X Host'}</span>
          </Button>

          {/* Action 2: Memory Dump */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDumpMemory}
            disabled={memoryDumped}
            className="w-full gap-2 text-xs justify-start h-10"
          >
            {memoryDumped ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <HardDriveDownload className="h-4 w-4 text-cyan-400" />}
            <span>{memoryDumped ? 'Memory Captured' : 'Dump Volatility Memory'}</span>
          </Button>

          {/* Action 3: Rotate Creds */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotateCreds}
            disabled={credsRotated}
            className="w-full gap-2 text-xs justify-start h-10"
          >
            {credsRotated ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <KeyRound className="h-4 w-4 text-orange-400" />}
            <span>{credsRotated ? 'Kerberos Revoked' : 'Revoke Kerberos Tickets'}</span>
          </Button>

          {/* Action 4: Generate Report */}
          <Button
            variant="primary"
            size="sm"
            onClick={onGenerateReport}
            className="w-full gap-2 text-xs font-semibold justify-start h-10"
          >
            <FileDown className="h-4 w-4" />
            <span>Generate Forensic Report</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
