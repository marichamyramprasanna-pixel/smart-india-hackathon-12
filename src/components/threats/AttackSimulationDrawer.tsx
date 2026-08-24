import React, { useState } from 'react'
import {
  Flame,
  Zap,
  Globe,
  Radio,
  HardDriveDownload,
  KeyRound,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Play,
  Shield,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../common/Dialog'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { useDemoScenario } from '../../context/DemoScenarioContext'
import { useDevices } from '../../hooks/useDevices'
import { useAlerts } from '../../hooks/useAlerts'

interface AttackSimulationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const AttackSimulationDrawer: React.FC<AttackSimulationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { setStageIndex, resetScenario } = useDemoScenario()
  const { devices, refetch: refetchDevices } = useDevices()
  const { refetch: refetchAlerts } = useAlerts()
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null)

  const scenarios = [
    {
      id: 'dga-burst',
      title: 'DGA DNS Tunneling Flood',
      category: 'DNS_TUNNELING',
      severity: 'HIGH',
      stageIndex: 1,
      icon: <Globe className="h-4 w-4 text-purple-400" />,
      description: 'Generates 342 queries/min to pseudorandom DGA domains with Shannon entropy of 4.88.',
      mitre: 'T1568.002',
    },
    {
      id: 'c2-beacon',
      title: 'Cobalt Strike C2 Beaconing Pulse',
      category: 'C2_COMMUNICATION',
      severity: 'CRITICAL',
      stageIndex: 3,
      icon: <Radio className="h-4 w-4 text-red-400 animate-pulse" />,
      description: 'Sends periodic TCP TLS check-ins every 30.02s with 0.4% jitter to adversary relay 185.220.101.5.',
      mitre: 'T1071.001',
    },
    {
      id: 'lateral-hop',
      title: 'Kerberos Pass-the-Hash Lateral Hop',
      category: 'LATERAL_MOVEMENT',
      severity: 'HIGH',
      stageIndex: 4,
      icon: <KeyRound className="h-4 w-4 text-amber-400" />,
      description: 'Simulates unauthorized administrative SMB logon on TCP 445 targeting Core Database SERVER-07.',
      mitre: 'T1021.002',
    },
    {
      id: 'data-exfil',
      title: 'Volumetric Egress Exfiltration Spike',
      category: 'DATA_EXFILTRATION',
      severity: 'CRITICAL',
      stageIndex: 5,
      icon: <HardDriveDownload className="h-4 w-4 text-red-400" />,
      description: 'Simulates 4.8 GB encrypted data dump transferring during off-hours to unclassified foreign IP.',
      mitre: 'T1048.003',
    },
  ]

  const handleRunSimulation = async (scenario: (typeof scenarios)[0]) => {
    setActiveSimulation(scenario.id)
    setStageIndex(scenario.stageIndex)
    await refetchDevices()
    await refetchAlerts()
    setTimeout(() => setActiveSimulation(null), 1800)
  }

  const handleReset = async () => {
    resetScenario()
    await refetchDevices()
    await refetchAlerts()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-red-400 mb-1">
            <Zap className="h-5 w-5 fill-current" />
            <DialogTitle className="text-base text-slate-100">
              Red Team Attack Simulation & Telemetry Injector Lab
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Simulate live adversary multi-vector attack scenarios against your monitored network infrastructure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          {scenarios.map((sc) => {
            const isRunning = activeSimulation === sc.id

            return (
              <div
                key={sc.id}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                    {sc.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-slate-200">{sc.title}</h4>
                      <Badge
                        variant={sc.severity === 'CRITICAL' ? 'critical' : 'high'}
                        className="text-[9px]"
                      >
                        {sc.severity}
                      </Badge>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                        {sc.mitre}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {sc.description}
                    </p>
                  </div>
                </div>

                <Button
                  variant={sc.severity === 'CRITICAL' ? 'destructive' : 'primary'}
                  size="sm"
                  onClick={() => handleRunSimulation(sc)}
                  isLoading={isRunning}
                  className="gap-1.5 text-xs font-semibold shrink-0"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Inject Attack</span>
                </Button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs gap-1.5 text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Telemetry to Clean Baseline</span>
          </Button>

          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close Lab
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
