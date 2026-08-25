import React, { useState, useMemo } from 'react'
import {
  Mail,
  Send,
  FileText,
  Download,
  Printer,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  Paperclip,
  User,
  Laptop,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Eye,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { useDevices } from '../hooks/useDevices'
import { useAlerts } from '../hooks/useAlerts'
import { useDemoScenario } from '../context/DemoScenarioContext'
import {
  gmailAlertService,
  getGmailRecipient,
  setGmailRecipient,
  getGmailDispatchLogs,
  GmailDispatchLog,
  DEFAULT_TARGET_GMAIL,
  generateSecurityAdvisoryBody,
  buildGmailComposeUrl,
} from '../services/gmailAlertService'
import { ReportPreview } from '../components/reports/ReportPreview'
import { defaultIncidentReport } from '../api/reports'
import { IncidentReport } from '../types/report'
import confetti from 'canvas-confetti'

export const GmailDispatchPage: React.FC = () => {
  const { devices } = useDevices()
  const { alerts } = useAlerts()
  const { currentStage } = useDemoScenario()

  // Email form state
  const [recipient, setRecipient] = useState<string>(() => getGmailRecipient() || DEFAULT_TARGET_GMAIL)
  const [subject, setSubject] = useState<string>(
    '🚨 [SOC CRITICAL ADVISORY] High-Risk Incident Telemetry & Forensic Report'
  )
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    devices.length > 0 ? devices[0].id : 'DEVICE-042'
  )
  const [attachPdf, setAttachPdf] = useState<boolean>(true)
  const [copied, setCopied] = useState<boolean>(false)
  const [dispatchedSuccess, setDispatchedSuccess] = useState<boolean>(false)
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false)
  const [dispatchLogs, setDispatchLogs] = useState<GmailDispatchLog[]>(() => getGmailDispatchLogs())

  // Dynamic incident report calculation
  const report = useMemo<IncidentReport>(() => {
    const selectedDev = devices.find((d) => d.id === selectedDeviceId)
    const compromised = devices.filter((d) => d.status === 'COMPROMISED')
    const suspicious = devices.filter((d) => d.status === 'SUSPICIOUS')
    const activeAlerts = alerts.filter((a) => a.status === 'NEW' || a.status === 'INVESTIGATING')

    const severity: IncidentReport['incidentSeverity'] =
      selectedDev?.status === 'COMPROMISED' || currentStage.compromiseProbability >= 80
        ? 'CRITICAL'
        : selectedDev?.status === 'SUSPICIOUS' || currentStage.compromiseProbability >= 60
        ? 'HIGH'
        : 'MEDIUM'

    const affected = selectedDev
      ? [
          {
            deviceId: selectedDev.id,
            hostname: selectedDev.hostname,
            ip: selectedDev.ip,
            role: selectedDev.department || selectedDev.type,
            compromiseProbability: selectedDev.compromiseProbability || selectedDev.riskScore,
            status: selectedDev.status,
          },
        ]
      : defaultIncidentReport.affectedDevices

    return {
      ...defaultIncidentReport,
      reportNumber: `SX-INC-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
      generatedAt: new Date().toISOString(),
      title: selectedDev
        ? `Security Incident Telemetry & Investigation — Host ${selectedDev.id} (${selectedDev.hostname})`
        : 'SentinelX Enterprise Incident Forensic Advisory',
      executiveSummary: `Automated high-risk security escalation generated for ${recipient}. Critical behavioral deviations, elevated Shannon DNS entropy, and lateral socket anomalies detected on monitored endpoint ${selectedDev?.id || 'DEVICE-042'} with a risk score of ${selectedDev?.riskScore || currentStage.device42Risk}%.`,
      incidentSeverity: severity,
      affectedDevices: affected,
      analystSignOff: {
        name: 'Sentinel AI SOC Copilot',
        role: `Automated Dispatch to ${recipient}`,
        date: new Date().toLocaleDateString(),
      },
    }
  }, [devices, alerts, selectedDeviceId, currentStage, recipient])

  // Generate formatted email advisory text
  const emailBodyText = useMemo(() => {
    const selectedDev = devices.find((d) => d.id === selectedDeviceId)
    const risk = selectedDev?.riskScore || currentStage.device42Risk || 92
    const ip = selectedDev?.ip || '10.0.4.42'
    const hostname = selectedDev?.hostname || 'Workstation-Fin (DEVICE-042)'

    const pdfNotice = attachPdf
      ? `\n\n📄 ATTACHED FORENSIC INCIDENT REPORT:
- Report ID: ${report.reportNumber}
- Format: Printable Forensic PDF / Executive Summary
- Direct Web Download: http://localhost:5174/reports`
      : ''

    return `${generateSecurityAdvisoryBody({
      id: `incident-${Date.now()}`,
      deviceId: selectedDeviceId,
      hostname,
      ip,
      riskScore: risk,
      compromiseProbability: risk,
      threatTitle: 'High-Risk Network Threat Exceeded 80% Threshold',
      mitreTactic: 'MITRE ATT&CK TA0040 Impact / TA0010 Exfiltration',
      anomalies: selectedDev?.anomalies || [
        'Shannon Entropy DGA DNS Tunneling',
        'Abnormal Outbound Socket Burst',
        'Off-Hours Administrative Authentication Probe',
      ],
      recommendedAction: `Enforce 802.1X Host Quarantine on ${selectedDeviceId} immediately.`,
      timestamp: new Date().toISOString(),
    })}${pdfNotice}`
  }, [devices, selectedDeviceId, currentStage, attachPdf, report])

  const composeUrl = useMemo(() => {
    return buildGmailComposeUrl(recipient, subject, emailBodyText)
  }, [recipient, subject, emailBodyText])

  // Handle Send via Gmail Web App
  const handleSendGmail = () => {
    setGmailRecipient(recipient)
    gmailAlertService.openGmailCompose(composeUrl)

    // Save to audit logs
    const log: GmailDispatchLog = {
      id: `gmail-manual-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipient,
      deviceId: selectedDeviceId,
      hostname: devices.find((d) => d.id === selectedDeviceId)?.hostname || selectedDeviceId,
      riskScore: devices.find((d) => d.id === selectedDeviceId)?.riskScore || 92,
      subject,
      status: 'SENT',
      composeUrl,
    }
    const updated = [log, ...dispatchLogs].slice(0, 50)
    setDispatchLogs(updated)
    try {
      localStorage.setItem('sentinelx_gmail_dispatch_logs', JSON.stringify(updated))
    } catch {}

    setDispatchedSuccess(true)
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } })
    setTimeout(() => setDispatchedSuccess(false), 5000)
  }

  // Handle Copy Formatted Email
  const handleCopyBody = () => {
    navigator.clipboard.writeText(emailBodyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  // Handle PDF Export / Print
  const handlePrintPdf = () => {
    window.print()
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 rounded-2xl border border-red-500/40 bg-gradient-to-r from-slate-950 via-red-950/20 to-slate-950 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/50 text-red-400 shadow-neon-red/30 shrink-0">
            <Mail className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-100">
                Gmail Emergency Dispatch & PDF Report Hub
              </h1>
              <Badge variant="critical" className="text-[10px]">
                RECIPIENT: {recipient}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Compose, attach comprehensive PDF incident reports, and dispatch emergency security advisories directly to Gmail.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPdfPreview((prev) => !prev)}
            className="text-xs gap-1.5 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{showPdfPreview ? 'Hide Report Preview' : 'Preview Incident PDF'}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrintPdf}
            className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 shadow-neon-emerald/30"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export / Print PDF</span>
          </Button>
        </div>
      </div>

      {/* Main Form & PDF Bundle Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email Dispatch Console (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <Card variant="cyber" className="p-5 space-y-4 border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-cyan-400" />
                <CardTitle className="text-sm text-slate-100">Compose Emergency Security Advisory</CardTitle>
              </div>
              <Badge variant="healthy" className="text-[10px]">
                GMAIL INTEGRATION READY
              </Badge>
            </div>

            {/* Recipient Input */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block flex items-center justify-between">
                <span>Target Recipient Gmail Address</span>
                <span className="text-[10px] text-cyan-400 font-normal">Default: ramprasannamarichamy31@gmail.com</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="h-10 flex-1 rounded-xl border border-slate-700 bg-slate-900/90 px-3 text-xs text-slate-100 font-mono focus:border-red-400 focus:outline-none"
                  placeholder="ramprasannamarichamy31@gmail.com"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecipient(DEFAULT_TARGET_GMAIL)}
                  className="text-[11px] border-slate-700 text-slate-400 hover:text-slate-200"
                  title="Reset to ramprasannamarichamy31@gmail.com"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Subject Line */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Incident Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Target Endpoint Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Associated Device / Target</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
                >
                  {devices.length > 0 ? (
                    devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.id} — {d.hostname} ({d.riskScore}% Risk)
                      </option>
                    ))
                  ) : (
                    <option value="DEVICE-042">DEVICE-042 — Workstation-Fin (94% Risk)</option>
                  )}
                </select>
              </div>

              {/* PDF Attachment Toggle */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">PDF Report Bundle</label>
                <div className="flex items-center justify-between h-10 px-3 rounded-xl border border-slate-700 bg-slate-900/90 text-xs">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-200">Include PDF Incident Report</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={attachPdf}
                    onChange={(e) => setAttachPdf(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Email Body Preview & Code Editor Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold block">Security Advisory Body (Formatted)</label>
                <button
                  type="button"
                  onClick={handleCopyBody}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Body'}</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={12}
                value={emailBodyText}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-[11px] text-slate-300 font-mono focus:outline-none select-all"
              />
            </div>

            {/* Dispatch Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <div className="text-[11px] text-slate-400">
                Dispatches pre-filled draft to <span className="text-cyan-300 font-bold">{recipient}</span>.
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleCopyBody}
                  className="text-xs gap-1.5 border-slate-700 text-slate-300"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Text</span>
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSendGmail}
                  className="text-xs font-bold gap-2 bg-red-600 hover:bg-red-500 shadow-neon-red/40 px-5"
                >
                  <Send className="h-4 w-4" />
                  <span>Send via Gmail</span>
                </Button>
              </div>
            </div>

            {dispatchedSuccess && (
              <div className="p-3 rounded-xl border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Security advisory successfully queued and Gmail compose window opened for {recipient}!</span>
              </div>
            )}
          </Card>

          {/* Recent Dispatches Log Card */}
          <Card variant="cyber" className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-400" />
                <CardTitle className="text-xs text-slate-100 uppercase tracking-wider">
                  Recent Gmail Security Dispatches ({dispatchLogs.length})
                </CardTitle>
              </div>
            </div>

            {dispatchLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3">No previous Gmail security alerts recorded.</p>
            ) : (
              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                {dispatchLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-200">{log.recipient}</span>
                        <span className="text-slate-500 ml-2">({log.deviceId} • {log.riskScore}% Risk)</span>
                        <p className="text-[10px] text-slate-400 truncate max-w-sm">{log.subject}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => gmailAlertService.openGmailCompose(log.composeUrl)}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 shrink-0"
                    >
                      <span>Re-open</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Printable PDF Security Report Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="cyber" className="p-5 space-y-4 border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-sm text-slate-100">Forensic PDF Incident Report</CardTitle>
              </div>
              <Badge variant="critical" className="text-[10px]">
                {report.incidentSeverity}
              </Badge>
            </div>

            {/* PDF Report Header Specs */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Report Serial:</span>
                <span className="font-bold text-cyan-300">{report.reportNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Classification:</span>
                <span className="font-bold text-red-400">TLP:AMBER / SOC RESTRICTED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Export Standard:</span>
                <span className="font-bold text-slate-200">NIST SP 800-61 Rev 2</span>
              </div>
            </div>

            {/* Compact Printable Report Preview */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 max-h-[580px] overflow-y-auto space-y-4 text-slate-300">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="font-bold text-slate-100 text-xs">{report.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{report.executiveSummary}</p>
              </div>

              {/* Affected Endpoints Table */}
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Targeted & Compromised Endpoints
                </h5>
                <div className="space-y-1.5">
                  {report.affectedDevices.map((dev) => (
                    <div
                      key={dev.deviceId}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]"
                    >
                      <span className="font-bold text-slate-200">{dev.deviceId}</span>
                      <span className="text-slate-400">{dev.ip}</span>
                      <Badge variant={dev.status === 'COMPROMISED' ? 'critical' : 'high'} className="text-[9px]">
                        {dev.compromiseProbability}% PROB
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action Checklist */}
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Recommended Containment Actions
                </h5>
                <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                  {report.recommendedActions.slice(0, 4).map((action, idx) => (
                    <li key={idx} className="truncate">
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Signoff */}
              <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Signoff: {report.analystSignOff.name}</span>
                <span>{report.analystSignOff.date}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintPdf}
              className="w-full text-xs font-semibold gap-1.5 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save as PDF Document</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
