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
  Mail,
  ExternalLink,
} from 'lucide-react'
import { useDemoScenario } from '../../context/DemoScenarioContext'
import { useInvestigation } from '../../context/InvestigationContext'
import { useDevices } from '../../hooks/useDevices'
import { useAlerts } from '../../hooks/useAlerts'
import { Button } from './Button'
import { Badge } from './Badge'
import {
  gmailAlertService,
  getGmailRecipient,
  isGmailAutoSendEnabled,
} from '../../services/gmailAlertService'

export const ThreatAutoBlockInterceptor: React.FC = () => {
  const { currentStage } = useDemoScenario()
  const { isolateDevice, isDeviceIsolated, addInvestigationNote } = useInvestigation()
  const { devices } = useDevices()
  const { alerts } = useAlerts()

  // State for Auto-Block prompt (>90%)
  const [activePrompt, setActivePrompt] = useState<{
    id: string
    title: string
    deviceId: string
    hostname: string
    risk: number
    tactic: string
  } | null>(null)

  // State for Gmail Alert Banner (>80%)
  const [activeGmailAlert, setActiveGmailAlert] = useState<{
    id: string
    deviceId: string
    hostname: string
    risk: number
    recipient: string
    composeUrl: string
  } | null>(null)

  const [autoBlockAlways, setAutoBlockAlways] = useState<boolean>(() => {
    return localStorage.getItem('sentinelx_auto_block_90') === 'true'
  })

  const [recentActionNotice, setRecentActionNotice] = useState<string | null>(null)
  const dismissedBlockIdsRef = useRef<Set<string>>(new Set())
  const dispatchedGmailIdsRef = useRef<Set<string>>(new Set())

  // Web Audio alert chime
  const playAlertChime = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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

  // Monitor threat feeds and active devices for Risk >= 80% (Gmail dispatch) and Risk >= 90% (802.1X block)
  useEffect(() => {
    const stageRisk = currentStage.compromiseProbability
    const dev42Risk = currentStage.device42Risk

    let highRiskTarget: {
      id: string
      deviceId: string
      hostname: string
      ip: string
      risk: number
      title: string
      tactic: string
      anomalies: string[]
    } | null = null

    // Check custom devices in active inventory
    const highRiskDev = devices.find(
      (d) => (d.riskScore || 0) >= 80 || (d.compromiseProbability || 0) >= 80
    )

    if (highRiskDev) {
      highRiskTarget = {
        id: `dev-high-${highRiskDev.id}`,
        deviceId: highRiskDev.id,
        hostname: highRiskDev.hostname,
        ip: highRiskDev.ip,
        risk: Math.max(highRiskDev.riskScore || 0, highRiskDev.compromiseProbability || 0),
        title: `High-Risk Anomaly Detected on ${highRiskDev.hostname}`,
        tactic: 'MITRE ATT&CK Lateral Movement / Exfiltration',
        anomalies: highRiskDev.anomalies || ['High outbound connection entropy'],
      }
    } else if (dev42Risk >= 80 && !isDeviceIsolated('DEVICE-042')) {
      highRiskTarget = {
        id: `threat-dev42-${currentStage.stageNumber}`,
        deviceId: 'DEVICE-042',
        hostname: 'Workstation-Fin (DEVICE-042)',
        ip: '10.0.4.42',
        risk: dev42Risk,
        title: 'Active Ransomware & C2 Exfiltration Burst',
        tactic: 'MITRE TA0040 Impact / TA0010 Exfiltration',
        anomalies: ['High Shannon entropy DNS queries', 'Pass-the-hash SMB connection'],
      }
    }

    if (highRiskTarget) {
      // ══════════════════════════════════════════════════════════════════════
      // 1. GMAIL ALERT DISPATCH (TRIGGERED WHEN RISK >= 80%)
      // ══════════════════════════════════════════════════════════════════════
      if (highRiskTarget.risk >= 80 && !dispatchedGmailIdsRef.current.has(highRiskTarget.id)) {
        dispatchedGmailIdsRef.current.add(highRiskTarget.id)

        gmailAlertService
          .triggerRiskAlert({
            id: highRiskTarget.id,
            deviceId: highRiskTarget.deviceId,
            hostname: highRiskTarget.hostname,
            ip: highRiskTarget.ip,
            riskScore: highRiskTarget.risk,
            compromiseProbability: highRiskTarget.risk,
            threatTitle: highRiskTarget.title,
            mitreTactic: highRiskTarget.tactic,
            anomalies: highRiskTarget.anomalies,
            recommendedAction: `Enforce 802.1X Port Isolation on ${highRiskTarget.deviceId} immediately to halt lateral propagation.`,
            timestamp: new Date().toISOString(),
          })
          .then((res) => {
            if (res.dispatched && res.composeUrl) {
              setActiveGmailAlert({
                id: highRiskTarget!.id,
                deviceId: highRiskTarget!.deviceId,
                hostname: highRiskTarget!.hostname,
                risk: highRiskTarget!.risk,
                recipient: getGmailRecipient(),
                composeUrl: res.composeUrl,
              })
              playAlertChime()
            }
          })
      }

      // ══════════════════════════════════════════════════════════════════════
      // 2. 802.1X QUARANTINE INTERCEPTOR (TRIGGERED WHEN RISK >= 90%)
      // ══════════════════════════════════════════════════════════════════════
      if (
        highRiskTarget.risk >= 90 &&
        !isDeviceIsolated(highRiskTarget.deviceId) &&
        !dismissedBlockIdsRef.current.has(highRiskTarget.id)
      ) {
        if (autoBlockAlways) {
          executeAutoBlock(highRiskTarget.deviceId, highRiskTarget.hostname, highRiskTarget.risk)
          dismissedBlockIdsRef.current.add(highRiskTarget.id)
        } else {
          setActivePrompt({
            id: highRiskTarget.id,
            title: highRiskTarget.title,
            deviceId: highRiskTarget.deviceId,
            hostname: highRiskTarget.hostname,
            risk: highRiskTarget.risk,
            tactic: highRiskTarget.tactic,
          })
          playAlertChime()
        }
      }
    } else {
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
    setTimeout(() => setRecentActionNotice(null), 4500)
    setActivePrompt(null)
  }

  const handleConfirmBlock = () => {
    if (!activePrompt) return
    dismissedBlockIdsRef.current.add(activePrompt.id)
    executeAutoBlock(activePrompt.deviceId, activePrompt.hostname, activePrompt.risk)
  }

  const handleDismissBlock = () => {
    if (activePrompt) {
      dismissedBlockIdsRef.current.add(activePrompt.id)
      setActivePrompt(null)
    }
  }

  const handleToggleAutoBlockAlways = (checked: boolean) => {
    setAutoBlockAlways(checked)
    try {
      localStorage.setItem('sentinelx_auto_block_90', checked ? 'true' : 'false')
    } catch {}
  }

  return (
    <>
      {/* 1. GMAIL EMERGENCY ESCALATION NOTIFICATION BANNER (>80% RISK) */}
      {activeGmailAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom duration-300">
          <div className="rounded-2xl border-2 border-red-500/80 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-2xl text-slate-100 font-mono space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/50 text-red-400">
                  <Mail className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-red-400">GMAIL ALERT DISPATCHED</span>
                    <Badge variant="critical" className="text-[9px]">
                      {activeGmailAlert.risk}% RISK
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold mt-0.5">
                    Security advisory sent for {activeGmailAlert.deviceId}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveGmailAlert(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              Escalation email delivered to <span className="text-cyan-300 font-bold">{activeGmailAlert.recipient}</span>.
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => gmailAlertService.openGmailCompose(activeGmailAlert.composeUrl)}
                className="flex-1 text-xs gap-1.5 bg-red-600 hover:bg-red-500 shadow-neon-red/30"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Gmail Advisory</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveGmailAlert(null)}
                className="text-xs text-slate-400 border-slate-800"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUCCESS ACTION TOAST NOTICE */}
      {recentActionNotice && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/50 bg-slate-950/95 px-4 py-3 text-xs font-mono text-emerald-300 shadow-2xl backdrop-blur-xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{recentActionNotice}</span>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE 802.1X BLOCK INTERCEPTOR MODAL (>90% RISK) */}
      {activePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-mono">
          <div className="relative w-full max-w-lg rounded-2xl border-2 border-red-500/80 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 border border-red-500 text-red-400 shadow-neon-red">
                  <ShieldAlert className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="critical" pulse className="text-[10px]">
                      CRITICAL RISK: {activePrompt.risk}%
                    </Badge>
                    <span className="text-xs text-slate-400">AUTONOMOUS SOAR INTERCEPTOR</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1">
                    Threat Exceeded 90% Containment Threshold
                  </h3>
                </div>
              </div>

              <button
                onClick={handleDismissBlock}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Incident Details Card */}
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/20 p-4 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                <span className="text-slate-400">Target Endpoint</span>
                <span className="font-bold text-slate-100">{activePrompt.deviceId}</span>
              </div>
              <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                <span className="text-slate-400">Hostname</span>
                <span className="font-bold text-slate-100">{activePrompt.hostname}</span>
              </div>
              <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                <span className="text-slate-400">Threat Behavior</span>
                <span className="font-bold text-red-400">{activePrompt.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">MITRE ATT&CK</span>
                <span className="font-bold text-amber-300">{activePrompt.tactic}</span>
              </div>
            </div>

            {/* Containment Prompt Question */}
            <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-xs text-cyan-200 flex items-start gap-2.5">
              <Zap className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-cyan-300">Automated Remediation Available:</span>
                <span>Would you like to automatically block and isolate this device via 802.1X port quarantine?</span>
              </div>
            </div>

            {/* Toggle Always Auto-Block */}
            <div className="mt-4 flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-purple-400" />
                <span>Always Auto-Block threats &gt;90% in background</span>
              </div>
              <input
                type="checkbox"
                checked={autoBlockAlways}
                onChange={(e) => handleToggleAutoBlockAlways(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismissBlock}
                className="text-xs text-slate-400 border-slate-700"
              >
                Ignore for Now
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmBlock}
                className="text-xs font-bold gap-2 bg-red-600 hover:bg-red-500 shadow-neon-red"
              >
                <Lock className="h-4 w-4" />
                <span>Yes, Automatically Block Device</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
