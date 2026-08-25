import React, { useState, useEffect, useRef } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  X,
  AlertTriangle,
  Radio,
  Sliders,
  Volume2,
  Sparkles,
} from 'lucide-react'
import { useDemoScenario } from '../../context/DemoScenarioContext'
import { useInvestigation } from '../../context/InvestigationContext'
import { useDevices } from '../../hooks/useDevices'
import { useAlerts } from '../../hooks/useAlerts'
import { Button } from './Button'
import { Badge } from './Badge'

export const ThreatAutoBlockInterceptor: React.FC = () => {
  const { currentStage } = useDemoScenario()
  const { isolateDevice, isDeviceIsolated, addInvestigationNote } = useInvestigation()
  const { devices } = useDevices()
  const { alerts } = useAlerts()

  // State for prompt
  const [activePrompt, setActivePrompt] = useState<{
    id: string
    title: string
    deviceId: string
    hostname: string
    risk: number
    tactic: string
  } | null>(null)

  const [autoBlockAlways, setAutoBlockAlways] = useState<boolean>(() => {
    return localStorage.getItem('sentinelx_auto_block_90') === 'true'
  })

  const [recentActionNotice, setRecentActionNotice] = useState<string | null>(null)
  const dismissedIdsRef = useRef<Set<string>>(new Set())

  // Web Audio alert chime
  const playAlertChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Detect threats >90%
  useEffect(() => {
    // 1. Check current demo stage compromise probability
    const stageRisk = currentStage.compromiseProbability
    const dev42Risk = currentStage.device42Risk

    let targetThreat: {
      id: string
      title: string
      deviceId: string
      hostname: string
      risk: number
      tactic: string
    } | null = null

    if (dev42Risk >= 90 && !isDeviceIsolated('DEVICE-042')) {
      targetThreat = {
        id: `threat-dev42-${currentStage.stageNumber}`,
        title: 'Active Ransomware & C2 Exfiltration Burst',
        deviceId: 'DEVICE-042',
        hostname: 'Workstation-Fin (DEVICE-042)',
        risk: dev42Risk,
        tactic: 'MITRE TA0040 Impact / TA0010 Exfiltration',
      }
    } else if (stageRisk >= 90) {
      // Check high risk devices
      const highRiskDev = devices.find(
        (d) => (d.compromiseProbability || 0) >= 90 && !isDeviceIsolated(d.id)
      )
      if (highRiskDev) {
        targetThreat = {
          id: `threat-dev-${highRiskDev.id}`,
          title: `Critical Network Compromise on ${highRiskDev.hostname}`,
          deviceId: highRiskDev.id,
          hostname: highRiskDev.hostname,
          risk: highRiskDev.compromiseProbability || 94,
          tactic: 'MITRE Lateral Movement / C2 Beaconing',
        }
      }
    }

    if (targetThreat && !dismissedIdsRef.current.has(targetThreat.id)) {
      if (autoBlockAlways) {
        // Autonomous execution
        executeAutoBlock(targetThreat.deviceId, targetThreat.hostname, targetThreat.risk)
        dismissedIdsRef.current.add(targetThreat.id)
      } else {
        // Prompt user
        setActivePrompt(targetThreat)
        playAlertChime()
      }
    } else if (!targetThreat) {
      setActivePrompt(null)
    }
  }, [currentStage, devices, autoBlockAlways, isDeviceIsolated])

  const executeAutoBlock = (deviceId: string, hostname: string, risk: number) => {
    isolateDevice(
      deviceId,
      hostname,
      `Autonomous 802.1X Quarantine: Threat risk exceeded ${risk}% threshold.`
    )
    addInvestigationNote(
      deviceId,
      `[AUTONOMOUS SOAR CONTAINMENT] Critical threat evaluated at ${risk}% risk. 802.1X Port Isolation enforced.`
    )
    setRecentActionNotice(`Host ${hostname} quarantined & isolated successfully via 802.1X!`)
    setTimeout(() => setRecentActionNotice(null), 4000)
    setActivePrompt(null)
  }

  const handleConfirmBlock = () => {
    if (!activePrompt) return
    dismissedIdsRef.current.add(activePrompt.id)
    executeAutoBlock(activePrompt.deviceId, activePrompt.hostname, activePrompt.risk)
  }

  const handleDismiss = () => {
    if (!activePrompt) return
    dismissedIdsRef.current.add(activePrompt.id)
    setActivePrompt(null)
  }

  const handleToggleAutoBlockAlways = () => {
    const nextVal = !autoBlockAlways
    setAutoBlockAlways(nextVal)
    localStorage.setItem('sentinelx_auto_block_90', nextVal.toString())
    if (nextVal && activePrompt) {
      handleConfirmBlock()
    }
  }

  return (
    <>
      {/* 1. High-Priority Interactive Quarantine Prompt Modal / Banner */}
      {activePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border-2 border-red-500 bg-slate-950 p-6 shadow-neon-red space-y-4 font-mono">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/30 border border-red-500/60 text-red-400 animate-pulse">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-wide">
                      CRITICAL THREAT DETECTED (&gt;90% RISK)
                    </h3>
                    <Badge variant="critical" className="text-[10px]">
                      {activePrompt.risk}% PROBABILITY
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{activePrompt.title}</p>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target Host:</span>
                <strong className="text-slate-100 font-bold">{activePrompt.hostname}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Attack Vector:</span>
                <span className="text-cyan-300 font-mono text-[11px]">{activePrompt.tactic}</span>
              </div>
              <div className="pt-1.5 border-t border-red-500/20 text-slate-300 text-[11px] leading-relaxed">
                SentinelX Bayesian detector confirmed active compromise with high confidence. 
                <strong className="text-red-300 block mt-1">
                  Would you like to automatically block and quarantine this host from the network?
                </strong>
              </div>
            </div>

            {/* Autonomous Auto-Block Checkbox */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-slate-300 text-[11px]">
                  Always automatically block threats &gt;90% in background
                </span>
              </div>
              <button
                onClick={handleToggleAutoBlockAlways}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                  autoBlockAlways
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {autoBlockAlways ? 'ENABLED' : 'OFF'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="text-xs border-slate-700 text-slate-300 hover:text-white"
              >
                Manual Review (Ignore)
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmBlock}
                className="text-xs font-semibold gap-1.5 bg-red-600 hover:bg-red-500 shadow-neon-red/40"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Yes, Automatically Block & Quarantine</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Success Feedback Notice Toast */}
      {recentActionNotice && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 p-3.5 rounded-2xl border border-emerald-500/50 bg-slate-950/95 text-emerald-300 text-xs font-mono shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{recentActionNotice}</span>
        </div>
      )}
    </>
  )
}
