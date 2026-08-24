import React, { useState } from 'react'
import { ReportPreview } from '../components/reports/ReportPreview'
import { defaultIncidentReport } from '../api/reports'
import { IncidentReport } from '../types/report'
import { useDevices } from '../hooks/useDevices'
import { useAlerts } from '../hooks/useAlerts'
import { Button } from '../components/common/Button'
import { FileText, Download, Printer, RefreshCw, CheckCircle, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import confetti from 'canvas-confetti'

export const ReportsPage: React.FC = () => {
  const { devices } = useDevices()
  const { alerts } = useAlerts()
  const [report, setReport] = useState<IncidentReport>(defaultIncidentReport)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateFreshReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      // Build report from real live data
      const compromised = devices.filter((d) => d.status === 'COMPROMISED')
      const suspicious = devices.filter((d) => d.status === 'SUSPICIOUS')
      const topThreat = compromised[0] || suspicious[0] || devices[0]
      const activeAlerts = alerts.filter((a) => a.status === 'NEW' || a.status === 'INVESTIGATING')
      const topAlert = activeAlerts[0] || alerts[0]

      const severity: IncidentReport['incidentSeverity'] =
        compromised.length > 0 ? 'CRITICAL' :
        suspicious.length > 0 ? 'HIGH' :
        alerts.length > 0 ? 'MEDIUM' : 'LOW'

      const affectedDevices: IncidentReport['affectedDevices'] = [...compromised, ...suspicious]
        .slice(0, 6)
        .map((d) => ({
          deviceId: d.id,
          hostname: d.hostname,
          ip: d.ip,
          role: d.department || d.type || 'Unknown',
          compromiseProbability: d.compromiseProbability || d.riskScore,
          status: d.status,
        }))

      const technicalIoCs: IncidentReport['technicalIoCs'] = []
      activeAlerts.slice(0, 5).forEach((a) => {
        if (a.indicators) {
          a.indicators.slice(0, 2).forEach((ind) => {
            technicalIoCs.push({
              type: ind.type === 'IP' ? 'IP' : ind.type === 'Domain' ? 'Domain' : ind.type === 'Port' ? 'Port' : 'Hash',
              value: ind.value,
              notes: ind.reputation || `Detected on ${a.deviceId}`,
            })
          })
        }
      })

      const recommendedActions: string[] = [
        ...compromised.map((d) => `Isolate ${d.id} (${d.hostname}) via 802.1X immediately`),
        ...suspicious.map((d) => `Investigate ${d.id} (${d.hostname}) for lateral movement indicators`),
        activeAlerts.length > 0 ? `Triage and close ${activeAlerts.length} open security alert(s)` : '',
        'Revoke and reissue Kerberos tickets for all affected domain users',
        'Conduct forensic memory acquisition before rebooting affected endpoints',
        'Review perimeter firewall logs for exfiltration activity',
      ].filter(Boolean) as string[]

      const attackTimeline: IncidentReport['attackTimeline'] = activeAlerts.slice(0, 4).map((a) => ({
        time: new Date(a.detectedAt).toLocaleString(),
        phase: a.threatCategory,
        event: a.title,
        impact: a.summary?.slice(0, 100) || `${a.severity} severity alert on ${a.deviceId}`,
      }))

      const aiFindings: IncidentReport['aiFindings'] = activeAlerts.slice(0, 3).map((a) => ({
        category: a.threatCategory,
        contribution: `${a.confidenceScore}%`,
        deviationDetails: a.aiExplanation?.slice(0, 120) || a.summary?.slice(0, 120) || 'Behavioral deviation detected.',
      }))

      const freshReport: IncidentReport = {
        ...defaultIncidentReport,
        reportNumber: `SX-INC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
        generatedAt: new Date().toISOString(),
        title: topThreat
          ? `Active Network Incident — ${topThreat.id} (${topThreat.hostname}) ${severity} Threat`
          : 'SentinelX Network Security Incident Report',
        executiveSummary: topThreat
          ? `SentinelX has detected a ${severity.toLowerCase()} severity security incident affecting ${affectedDevices.length || 'multiple'} endpoint(s) in the monitored network. The primary affected host is ${topThreat.id} (${topThreat.hostname}, IP: ${topThreat.ip}) in the ${topThreat.department} department with a risk score of ${topThreat.riskScore}%. ${activeAlerts.length} alert(s) are currently active and require analyst triage.`
          : 'No critical incidents detected. Network is within normal operating parameters.',
        incidentSeverity: severity,
        affectedDevices: affectedDevices.length > 0 ? affectedDevices : defaultIncidentReport.affectedDevices,
        attackTimeline: attackTimeline.length > 0 ? attackTimeline : defaultIncidentReport.attackTimeline,
        aiFindings: aiFindings.length > 0 ? aiFindings : defaultIncidentReport.aiFindings,
        technicalIoCs: technicalIoCs.length > 0 ? technicalIoCs : defaultIncidentReport.technicalIoCs,
        recommendedActions: recommendedActions.length > 0 ? recommendedActions : defaultIncidentReport.recommendedActions,
        analystSignOff: {
          name: 'Sentinel AI Automated System',
          role: 'AI-Assisted Tier-3 SOC Analysis',
          date: new Date().toLocaleDateString(),
        },
      }

      setReport(freshReport)
      setIsGenerating(false)
      // Subtle celebration confetti for successful report compile
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00F0FF', '#A855F7', '#38BDF8'],
      })
    }, 600)
  }

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${report.reportNumber}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handlePrint = () => {
    window.print()
  }

  // Derive live stats for header display
  const compromisedCount = devices.filter((d) => d.status === 'COMPROMISED').length
  const activeAlertCount = alerts.filter((a) => a.status === 'NEW' || a.status === 'INVESTIGATING').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              AUDIT COMPLIANCE
            </span>
            <span className="text-xs font-mono text-slate-400">
              SOC 2 / ISO 27001 Format
            </span>
            {compromisedCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                {compromisedCount} COMPROMISED HOST{compromisedCount > 1 ? 'S' : ''}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
            Incident Forensics &amp; Executive Report Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {devices.length} monitored endpoints · {activeAlertCount} active alert{activeAlertCount !== 1 ? 's' : ''} · Generate audit-ready forensic summaries from your live inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateFreshReport}
            isLoading={isGenerating}
            className="text-xs font-semibold gap-1.5 shadow-cyan-glow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Live Report</span>
          </Button>
        </div>
      </div>

      {/* Main Report Document View */}
      <ReportPreview
        report={report}
        onExportJson={handleExportJson}
        onPrint={handlePrint}
      />
    </div>
  )
}
