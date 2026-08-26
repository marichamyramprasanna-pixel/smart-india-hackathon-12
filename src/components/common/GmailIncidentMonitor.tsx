import React, { useState, useEffect, useRef } from 'react'
import {
  Mail,
  ExternalLink,
  X,
  Send,
  Copy,
  Check,
  Download,
} from 'lucide-react'
import { useDemoScenario } from '../../context/DemoScenarioContext'
import { useDevices } from '../../hooks/useDevices'
import { Badge } from './Badge'
import { Button } from './Button'
import {
  gmailAlertService,
  getGmailRecipient,
  buildMailtoUrl,
} from '../../services/gmailAlertService'

interface HighRiskIncident {
  id: string
  deviceId: string
  hostname: string
  ip: string
  risk: number
  title: string
  tactic: string
  recipient: string
  composeUrl: string
  mailtoUrl: string
  anomalies: string[]
}

export const GmailIncidentMonitor: React.FC = () => {
  const { currentStage } = useDemoScenario()
  const { devices } = useDevices()

  const [activeAlert, setActiveAlert] = useState<HighRiskIncident | null>(null)
  const [copied, setCopied] = useState(false)
  const dispatchedIdsRef = useRef<Set<string>>(new Set())

  // Web Audio alert notification chime
  const playChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(784, ctx.currentTime) // G5
      osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.25) // C5
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.28)
    } catch {
      // Audio autoplay policy fallback
    }
  }

  useEffect(() => {
    const stageProb = currentStage.compromiseProbability || 0
    const dev42Risk = currentStage.device42Risk || 0

    // Find any custom inventory device or scenario device reaching >= 80% risk
    const highRiskDev = devices.find(
      (d) => (d.riskScore || 0) >= 80 || (d.compromiseProbability || 0) >= 80
    )

    let target: {
      id: string
      deviceId: string
      hostname: string
      ip: string
      risk: number
      title: string
      tactic: string
      anomalies: string[]
    } | null = null

    if (highRiskDev) {
      target = {
        id: `dev-${highRiskDev.id}-${highRiskDev.riskScore}`,
        deviceId: highRiskDev.id,
        hostname: highRiskDev.hostname,
        ip: highRiskDev.ip,
        risk: Math.max(highRiskDev.riskScore || 0, highRiskDev.compromiseProbability || 0),
        title: `High-Risk Behavioral Anomaly on ${highRiskDev.hostname}`,
        tactic: 'MITRE ATT&CK TA0040 Lateral Movement / Exfiltration',
        anomalies: highRiskDev.anomalies || ['High outbound Shannon DNS entropy'],
      }
    } else if (dev42Risk >= 80 || stageProb >= 80) {
      target = {
        id: `scenario-stage-${currentStage.stageNumber}-${dev42Risk}`,
        deviceId: 'DEVICE-042',
        hostname: 'Workstation-Fin (DEVICE-042)',
        ip: '10.0.4.42',
        risk: Math.max(dev42Risk, stageProb),
        title: 'Active Ransomware & C2 Exfiltration Burst',
        tactic: 'MITRE TA0040 Impact / TA0010 Exfiltration',
        anomalies: ['High Shannon entropy DNS queries', 'Pass-the-hash SMB connection burst'],
      }
    }

    if (target && target.risk >= 80 && !dispatchedIdsRef.current.has(target.id)) {
      dispatchedIdsRef.current.add(target.id)

      const recipient = getGmailRecipient()
      const subject = `🚨 [CRITICAL ADVISORY] ${target.risk}% Threat Risk on ${target.deviceId} (${target.hostname})`

      gmailAlertService
        .triggerRiskAlert(
          {
            id: target.id,
            deviceId: target.deviceId,
            hostname: target.hostname,
            ip: target.ip,
            riskScore: target.risk,
            compromiseProbability: target.risk,
            threatTitle: target.title,
            mitreTactic: target.tactic,
            anomalies: target.anomalies,
            recommendedAction: `Review telemetry and enforce 802.1X Port Isolation on ${target.deviceId} immediately.`,
            timestamp: new Date().toISOString(),
          },
          true,
          false // do not auto-open popup to avoid browser popup blockers; present interactive banner instead
        )
        .then((res) => {
          if (res.dispatched && res.composeUrl) {
            const mailtoUrl = buildMailtoUrl(
              recipient,
              subject,
              `SentinelX Incident Report for ${target!.deviceId} (${target!.risk}% Risk). Review live telemetry at http://localhost:5173/devices/${target!.deviceId}`
            )

            setActiveAlert({
              ...target!,
              recipient,
              composeUrl: res.composeUrl,
              mailtoUrl,
            })
            playChime()
          }
        })
    }
  }, [currentStage, devices])

  const handleOpenGmail = () => {
    if (!activeAlert) return
    const opened = gmailAlertService.openGmailCompose(activeAlert.composeUrl)
    if (!opened) {
      // If popup was blocked, fallback to direct mailto or window navigation
      window.open(activeAlert.composeUrl, '_blank')
    }
  }

  const handleCopyAdvisory = () => {
    if (!activeAlert) return
    const text = `🚨 SENTINEL-X EMERGENCY SECURITY ADVISORY\nTarget: ${activeAlert.deviceId} (${activeAlert.hostname})\nIP: ${activeAlert.ip}\nRisk: ${activeAlert.risk}%\nThreat: ${activeAlert.title}\nTactic: ${activeAlert.tactic}\nRecipient: ${activeAlert.recipient}\nIncident URL: http://localhost:5173/devices/${activeAlert.deviceId}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  if (!activeAlert) return null

  return (
    <aside aria-label="Incident Notification" className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] animate-in slide-in-from-bottom duration-300">
      <div className="rounded-2xl border-2 border-red-500/80 bg-slate-950/95 p-4 shadow-[0_0_40px_rgba(239,68,68,0.35)] backdrop-blur-2xl text-slate-100 font-mono space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/50 text-red-400">
              <Mail className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-400 tracking-wide">
                  GMAIL ESCALATION DISPATCH
                </span>
                <Badge variant="critical" className="text-[9px] px-1.5 py-0">
                  {activeAlert.risk}% RISK
                </Badge>
              </div>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                {activeAlert.deviceId} — {activeAlert.title}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            title="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Advisory recipient notice */}
        <div className="text-[11px] text-slate-300 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Target Recipient:</span>
            <span className="text-cyan-300 font-bold truncate max-w-[200px]">{activeAlert.recipient}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Host IPv4:</span>
            <span className="text-slate-200">{activeAlert.ip}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenGmail}
            className="flex-1 text-xs font-bold gap-1.5 bg-red-600 hover:bg-red-500 shadow-neon-red/40"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Open in Gmail</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAdvisory}
            className="text-xs gap-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            title="Copy advisory text to clipboard"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveAlert(null)}
            className="text-xs text-slate-400 border-slate-800 hover:text-slate-200"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </aside>
  )
}
