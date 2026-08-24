import React, { useState } from 'react'
import {
  Clock,
  KeyRound,
  Globe,
  Radio,
  HardDriveDownload,
  Server,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  BrainCircuit,
  Zap,
} from 'lucide-react'
import { AttackTimelineEvent, TimelineEventCategory } from '../../types/timeline'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { useDemoScenario } from '../../context/DemoScenarioContext'
import { TimelineEventDetail } from './TimelineEventDetail'
import { useSentinelAI } from '../../context/SentinelAIContext'
import { useAlerts } from '../../hooks/useAlerts'

export const AttackTimelineView: React.FC = () => {
  const { currentStage } = useDemoScenario()
  const { alerts } = useAlerts()
  const { toggleOpen, sendMessage } = useSentinelAI()
  const [selectedEvent, setSelectedEvent] = useState<AttackTimelineEvent | null>(null)

  // Map live alerts into timeline events if available
  const liveAlertEvents: AttackTimelineEvent[] = alerts.map((a, idx) => {
    let category: TimelineEventCategory = 'COMPROMISE_FLAG'
    if (a.threatCategory === 'Command & Control') category = 'BEACONING'
    else if (a.threatCategory === 'DGA Tunneling') category = 'DNS_DGA'
    else if (a.threatCategory === 'Data Exfiltration') category = 'DATA_EXFIL'
    else if (a.threatCategory === 'Lateral Movement') category = 'LATERAL_MOVEMENT'
    else if (a.threatCategory === 'Credential Access') category = 'AUTH_ANOMALY'

    const timeStr = a.detectedAt
      ? new Date(a.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : `09:${String(12 + idx * 3).padStart(2, '0')}`

    return {
      id: a.id,
      stageNumber: idx + 1,
      timeStr,
      timestamp: a.detectedAt || new Date().toISOString(),
      title: a.title,
      category,
      severity: a.severity,
      deviceId: a.deviceId,
      targetEntity: a.deviceIp,
      confidenceScore: a.confidenceScore || 90,
      description: a.summary || a.aiExplanation || 'Anomalous behavioral signature identified.',
      technicalDetails: {
        mitreTechniqueId: a.alertCode || 'T1071.001',
        mitreTactic: a.threatCategory,
        signatureMatch: a.alertCode,
        observedAnomaly: a.aiExplanation || 'Statistical deviation from learned baseline.',
        baselineComparison: 'Deviates by > 4.5 sigma from historical cluster distribution.',
        payloadSummary: `${a.severity} severity incident on ${a.deviceId}`,
      },
      recommendedAction: 'Isolate endpoint via 802.1X quarantine and dump memory.',
    }
  })

  // Combine live alerts + demo events
  const events = liveAlertEvents.length > 0 ? liveAlertEvents : currentStage.timelineEvents

  const getEventIcon = (category: string) => {
    switch (category) {
      case 'AUTH_ANOMALY':
        return <KeyRound className="h-4 w-4 text-orange-400" />
      case 'DNS_DGA':
        return <Globe className="h-4 w-4 text-purple-400" />
      case 'EXTERNAL_CONNECT':
        return <Radio className="h-4 w-4 text-cyan-400" />
      case 'BEACONING':
        return <Radio className="h-4 w-4 text-red-400 animate-pulse" />
      case 'DATA_EXFIL':
        return <HardDriveDownload className="h-4 w-4 text-red-400" />
      case 'LATERAL_MOVEMENT':
        return <Server className="h-4 w-4 text-orange-400" />
      case 'COMPROMISE_FLAG':
      default:
        return <ShieldAlert className="h-4 w-4 text-red-400" />
    }
  }

  const handleAskAIAboutEvent = (event: AttackTimelineEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleOpen()
    sendMessage(
      `Analyze attack timeline stage ${event.stageNumber} (${event.title}) detected at ${event.timeStr} on ${event.deviceId}.`
    )
  }

  return (
    <div className="space-y-6">
      <Card variant="cyber" className="rounded-xl overflow-hidden shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm">
              Chronological Attack Progression & Forensic Timeline
            </CardTitle>
            <p className="text-xs text-slate-400">
              Interactive multi-stage behavioral timeline correlated by SentinelX pattern correlation
              engine.
            </p>
          </div>
          <Badge variant="critical" className="text-[10px] font-mono">
            {events.length} CORRELATED STAGES
          </Badge>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {events.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Clock className="mx-auto h-8 w-8 text-cyan-400/50 mb-2" />
              <p className="font-semibold text-slate-200">Baseline telemetry active</p>
              <p className="text-xs text-slate-500 mt-1">
                No active threats detected. All monitored endpoints operate within normal parameters.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-6 space-y-6">
              {events.map((evt) => {
                const isCritical = evt.severity === 'CRITICAL'

                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="relative pl-6 sm:pl-8 group cursor-pointer"
                  >
                    {/* Node Dot / Icon on Line */}
                    <div
                      className={`absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full border bg-slate-950 transition-all duration-200 ${
                        isCritical
                          ? 'border-red-500 shadow-red-glow-sm group-hover:scale-110'
                          : 'border-cyan-500/60 shadow-cyan-glow-sm group-hover:scale-110'
                      }`}
                    >
                      {getEventIcon(evt.category)}
                    </div>

                    {/* Timeline Event Card */}
                    <div
                      className={`rounded-xl border p-4 transition-all duration-200 ${
                        isCritical
                          ? 'border-red-500/30 bg-red-950/20 hover:border-red-500/60 hover:bg-red-950/30'
                          : 'border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-850/60'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-400">
                            [{evt.timeStr} UTC]
                          </span>
                          <span className="font-semibold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                            {evt.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {evt.technicalDetails.mitreTechniqueId && (
                            <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">
                              {evt.technicalDetails.mitreTechniqueId}
                            </span>
                          )}
                          <Badge
                            variant={evt.severity === 'CRITICAL' ? 'critical' : 'high'}
                            className="text-[9px]"
                          >
                            {evt.severity}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                          <span>
                            Target: <strong className="text-slate-200">{evt.deviceId}</strong>
                          </span>
                          <span>
                            Confidence:{' '}
                            <strong className="text-orange-400">{evt.confidenceScore}%</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ai"
                            size="sm"
                            onClick={(e) => handleAskAIAboutEvent(evt, e)}
                            className="h-6 px-2 text-[10px] gap-1"
                          >
                            <Zap className="h-2.5 w-2.5 fill-current" />
                            <span>AI Triage</span>
                          </Button>

                          <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span>Deep Details</span>
                            <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deep Event Details Modal */}
      <TimelineEventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  )
}
