import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BrainCircuit,
  Send,
  Sparkles,
  Zap,
  Trash2,
  Lock,
  Unlock,
  ArrowRight,
  ShieldAlert,
  Laptop,
  Server,
  FileText,
  Clock,
  CheckCircle,
  Radio,
  ExternalLink,
  ChevronRight,
  Flame,
  Search,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { useSentinelAI } from '../context/SentinelAIContext'
import { useInvestigation } from '../context/InvestigationContext'
import { useDevices } from '../hooks/useDevices'
import { useAlerts } from '../hooks/useAlerts'

export const AIChatPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    messages,
    isLoading,
    currentContext,
    setCurrentContext,
    sendMessage,
    clearChat,
  } = useSentinelAI()

  const { isolateDevice, unisolateDevice, isDeviceIsolated } = useInvestigation()
  const { devices } = useDevices()
  const { alerts } = useAlerts()

  // Dynamically detect highest-risk device from live inventory
  const compromised = devices.filter((d) => d.status === 'COMPROMISED')
  const suspicious = devices.filter((d) => d.status === 'SUSPICIOUS')
  const topDevice = compromised[0] || suspicious[0] || devices[0]
  const isTopDeviceIsolated = topDevice ? isDeviceIsolated(topDevice.id) : false

  const [inputVal, setInputVal] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim() || isLoading) return
    sendMessage(inputVal)
    setInputVal('')
  }

  // Build playbooks dynamically around live device inventory
  const promptPlaybooks = [
    {
      title: topDevice ? `Triage ${topDevice.id}` : 'Triage Highest-Risk Device',
      prompt: topDevice
        ? `Perform an exhaustive behavioral triage on ${topDevice.id} (${topDevice.hostname}, IP: ${topDevice.ip}) and list all detected anomaly vectors.`
        : 'What devices are currently monitored and which require immediate attention?',
      icon: <Laptop className="h-3.5 w-3.5 text-cyan-400" />,
      tag: topDevice?.status === 'COMPROMISED' ? 'CRITICAL' : 'TRIAGE',
    },
    {
      title: 'Explain AI Behavioral Detection',
      prompt: topDevice
        ? `Why did SentinelX flag ${topDevice.id} as ${topDevice.status}? Explain the behavioral model's reasoning.`
        : 'How does SentinelX AI behavioral detection model work?',
      icon: <Radio className="h-3.5 w-3.5 text-purple-400" />,
      tag: 'EXPLAINABILITY',
    },
    {
      title: 'Analyze C2 Beaconing Cadence',
      prompt: topDevice
        ? `Analyze potential C2 beaconing patterns from ${topDevice.id} and evaluate jitter variance.`
        : 'How do I detect C2 beaconing patterns in network telemetry?',
      icon: <Flame className="h-3.5 w-3.5 text-red-400" />,
      tag: 'C2 DETECTION',
    },
    {
      title: 'Trace Lateral Movement',
      prompt: compromised.length > 0
        ? `Trace potential lateral movement paths from ${compromised[0].id} to other network segments and assess blast radius.`
        : 'How do I detect lateral movement across network segments?',
      icon: <Server className="h-3.5 w-3.5 text-orange-400" />,
      tag: 'LATERAL MOVEMENT',
    },
    {
      title: 'Generate SOC Incident Brief',
      prompt: `Generate an executive incident summary for the current network state with ${compromised.length} compromised and ${suspicious.length} suspicious devices, including MITRE ATT&CK tactics.`,
      icon: <FileText className="h-3.5 w-3.5 text-emerald-400" />,
      tag: 'EXECUTIVE REPORT',
    },
    {
      title: 'Enforce Containment Playbook',
      prompt: topDevice
        ? `What are the required containment actions to isolate ${topDevice.id} and prevent further lateral expansion?`
        : 'What containment actions should I take for an active network compromise?',
      icon: <Lock className="h-3.5 w-3.5 text-amber-400" />,
      tag: 'REMEDIATION',
    },
  ]

  // Render markdown helper
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n')
    return (
      <div className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <p key={idx} className="font-bold text-cyan-300 text-sm sm:text-base">
                {line.replace(/\*\*/g, '')}
              </p>
            )
          }
          if (line.startsWith('- **')) {
            const parts = line.replace('- **', '').split('**')
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 sm:ml-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <span>
                  <strong className="text-slate-100">{parts[0]}</strong>
                  {parts.slice(1).join('')}
                </span>
              </div>
            )
          }
          if (line.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 sm:ml-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                <span>{line.replace('- ', '')}</span>
              </div>
            )
          }
          if (line.startsWith('*') && line.endsWith('*')) {
            return (
              <p key={idx} className="text-slate-400 italic text-xs">
                {line.replace(/\*/g, '')}
              </p>
            )
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />
          }
          return <p key={idx}>{line}</p>
        })}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-950/90 to-slate-950/90 backdrop-blur-2xl shadow-purple-glow">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-glow shrink-0">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-display font-bold text-slate-100">
                Sentinel AI — Security Analyst Copilot Workspace
              </h1>
              <Badge variant="ai" className="text-[10px] font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                PROBABILISTIC MODEL ONLINE
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Context-aware autonomous cybersecurity assistant trained on multivariate network baselines, IoC telemetry, and MITRE ATT&CK tactics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="text-xs gap-1.5 border-slate-700 text-slate-300 hover:text-slate-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Session</span>
          </Button>

          {topDevice && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/devices/${topDevice.id}`)}
              className="text-xs font-semibold gap-1.5"
            >
              <span>Target Host: {topDevice.id}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* 3-Column Layout: Playbooks (Left) | Chat Stream (Center) | Context Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-250px)] min-h-[640px]">
        {/* Left Column: Forensic Prompt Playbooks */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-3 overflow-y-auto pr-1">
          <Card variant="cyber" className="p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-mono font-bold uppercase text-purple-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                Forensic Prompt Playbooks
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Execute standardized investigative reasoning workflows against live network state:
            </p>
          </Card>

          <div className="space-y-2 overflow-y-auto flex-1">
            {promptPlaybooks.map((item, idx) => (
              <div
                key={idx}
                onClick={() => sendMessage(item.prompt)}
                className="group p-3 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-purple-500/50 hover:bg-slate-850 cursor-pointer transition-all duration-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-slate-950 border border-slate-800 group-hover:border-purple-500/40 text-slate-300 group-hover:text-purple-300 transition-colors">
                      {item.icon}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                    {item.tag}
                  </span>
                  <span className="text-[10px] text-slate-500 group-hover:text-cyan-400 font-mono flex items-center gap-0.5">
                    <span>Ask</span>
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Full-Height Chat Stream */}
        <div className="lg:col-span-6 flex flex-col rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Active Context Banner */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-mono text-[11px]">ACTIVE CONTEXT:</span>
              <span className="font-mono font-bold text-cyan-300 flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                <Laptop className="h-3.5 w-3.5 text-cyan-400" />
                {currentContext.id || topDevice?.id || 'No Device Selected'}
              </span>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              Risk: <strong className={topDevice && topDevice.riskScore >= 80 ? 'text-red-400' : topDevice && topDevice.riskScore >= 50 ? 'text-orange-400' : 'text-cyan-400'}>{topDevice?.riskScore ?? 0}%</strong>
            </span>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user'
              const isSystem = msg.sender === 'system'

              if (isSystem) {
                return (
                  <div key={msg.id} className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 text-center">
                    {msg.content}
                  </div>
                )
              }

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-300 shadow-purple-glow">
                      <BrainCircuit className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] rounded-2xl p-4 space-y-3 ${
                      isUser
                        ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/40 rounded-tr-none shadow-cyan-glow-sm'
                        : 'bg-slate-900/90 text-slate-100 border border-slate-800 rounded-tl-none shadow-xl'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/60 pb-1.5 font-mono">
                      <span>{isUser ? 'SOC Analyst' : 'Sentinel AI (Probabilistic Intelligence Engine)'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {renderMessageContent(msg.content)}

                    {/* Structured Threat Insight Card */}
                    {msg.structuredInsight && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/40 space-y-2.5 shadow-purple-glow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-purple-300">
                            {msg.structuredInsight.title}
                          </span>
                          <Badge variant="critical" className="text-[9px]">
                            RISK {msg.structuredInsight.riskScore}%
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs text-slate-300">
                          <span className="text-[10px] font-mono uppercase text-slate-500 block">
                            Correlated Evidence Vectors:
                          </span>
                          {msg.structuredInsight.evidence.map((ev, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                              <span>{ev}</span>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs text-cyan-300 font-medium pt-2 border-t border-slate-800">
                          💡 {msg.structuredInsight.recommendedMitigation}
                        </p>
                      </div>
                    )}

                    {/* Action Triggers */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2">
                        {msg.suggestedActions.map((act) => (
                          <button
                            key={act.id}
                            onClick={() => {
                              if (act.actionType === 'navigate' && act.payload?.path) {
                                navigate(act.payload.path as string)
                              } else if (act.actionType === 'isolate_device') {
                                isolateDevice(act.payload?.deviceId as string || 'DEVICE-042')
                              } else if (act.actionType === 'generate_report') {
                                navigate('/reports')
                              } else {
                                sendMessage(act.label)
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex gap-3 items-center text-xs text-purple-300 bg-purple-950/30 p-3.5 rounded-xl border border-purple-500/30">
                <BrainCircuit className="h-5 w-5 animate-spin text-purple-400" />
                <span className="font-mono">Sentinel AI is computing multi-dimensional Bayesian anomaly correlations...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Console */}
          <form
            onSubmit={handleSend}
            className="p-3.5 border-t border-slate-800 bg-slate-900/95 flex items-center gap-2.5"
          >
            <input
              type="text"
              placeholder="Ask Sentinel AI to analyze telemetry, trace C2 hops, explain anomalies, or isolate host..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isLoading}
              className="flex-1 h-10 rounded-xl border border-slate-700 bg-slate-950 px-4 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
            />
            <Button
              variant="ai"
              size="md"
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              className="h-10 px-5 text-xs font-semibold gap-1.5 shadow-purple-glow"
            >
              <span>Send</span>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>

        {/* Right Column: Live Context & Evidence Inspector */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-3 overflow-y-auto pl-1">
          {/* Target Host Card */}
          <Card variant="cyber" className="p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                TARGET TELEMETRY STATE
              </span>
              <Badge variant={topDevice && topDevice.riskScore >= 80 ? 'critical' : 'high'} className="text-[9px]">
                {topDevice?.riskScore ?? 0}% RISK
              </Badge>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Host ID:</span>
                <span className="font-mono font-bold text-slate-100">{topDevice?.id ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hostname:</span>
                <span className="font-mono text-slate-300">{topDevice?.hostname ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">IP Socket:</span>
                <span className="font-mono text-cyan-300">{topDevice?.ip ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="text-slate-300">{topDevice?.department ?? '—'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              {topDevice ? (
                <Button
                  variant={isTopDeviceIsolated ? 'secondary' : 'destructive'}
                  size="sm"
                  onClick={() => {
                    if (isTopDeviceIsolated) unisolateDevice(topDevice.id)
                    else isolateDevice(topDevice.id, topDevice.hostname)
                  }}
                  className="w-full text-xs gap-1.5 shadow-red-glow-sm"
                >
                  {isTopDeviceIsolated ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  <span>{isTopDeviceIsolated ? 'Release Quarantine' : `Quarantine ${topDevice.id}`}</span>
                </Button>
              ) : (
                <p className="text-xs text-slate-500 text-center">No devices in inventory</p>
              )}
            </div>
          </Card>

          {/* IoCs & Firewall Rules */}
          <Card variant="cyber" className="p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                ACTIVE EVIDENCE & IOCS
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {alerts.slice(0, 2).flatMap((a) => a.indicators?.slice(0, 1) || []).map((ind, i) => (
                <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[9px] font-mono text-cyan-400 uppercase block">{ind.type}</span>
                  <p className="font-mono text-slate-200 text-[11px]">{ind.value}</p>
                  <span className="text-[10px] text-slate-500 font-mono">{ind.reputation}</span>
                </div>
              ))}
              {alerts.flatMap((a) => a.indicators || []).length === 0 && (
                <p className="text-xs text-slate-500 py-2 text-center">No active IoCs</p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/attack-graph')}
                className="w-full text-xs gap-1.5 justify-center"
              >
                <span>View Attack Graph</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
