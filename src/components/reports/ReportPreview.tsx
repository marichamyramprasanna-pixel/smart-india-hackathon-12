import React from 'react'
import { IncidentReport } from '../../types/report'
import {
  ShieldAlert,
  Printer,
  Download,
  FileText,
  CheckCircle,
  Share2,
  Lock,
} from 'lucide-react'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'

interface ReportPreviewProps {
  report: IncidentReport
  onExportJson: () => void
  onPrint: () => void
  onExportSTIX?: () => void
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  report,
  onExportJson,
  onPrint,
  onExportSTIX,
}) => {
  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 print:hidden">
        <div>
          <span className="font-mono text-xs text-slate-400">REPORT IDENTIFIER</span>
          <h2 className="font-mono font-bold text-base text-cyan-300">{report.reportNumber}</h2>
        </div>

        <div className="flex items-center gap-2">
          {onExportSTIX && (
            <Button variant="outline" size="sm" onClick={onExportSTIX} className="text-xs gap-1.5 border-purple-500/40 hover:bg-purple-950/20 text-purple-300">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Export STIX 2.1</span>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onExportJson} className="text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </Button>
          <Button variant="primary" size="sm" onClick={onPrint} className="text-xs font-semibold gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Formal Executive Document Sheet */}
      <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6 sm:p-10 shadow-2xl space-y-8 text-xs text-slate-200 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                SENTINELX FORENSIC INTELLIGENCE
              </span>
              <Badge variant="critical" className="text-[10px] font-mono">
                {report.incidentSeverity} SEVERITY
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100 print:text-black leading-tight">
              {report.title}
            </h1>
          </div>

          <div className="text-right font-mono text-[11px] text-slate-400 print:text-gray-600">
            <p>Generated: {new Date(report.generatedAt).toLocaleString()}</p>
            <p>Classification: TACTICAL RESTRICTED</p>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="space-y-2">
          <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-blue-700">
            1.0 Executive Summary
          </h3>
          <p className="leading-relaxed text-slate-300 print:text-gray-800 text-xs sm:text-sm bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 print:bg-gray-50 print:border-gray-300">
            {report.executiveSummary}
          </p>
        </section>

        {/* Affected Devices Table */}
        <section className="space-y-3">
          <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-blue-700">
            2.0 Affected Network Assets & Compromise Assessment
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-gray-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800 print:bg-gray-100 print:text-gray-700">
                  <th className="py-2.5 px-4">Device ID</th>
                  <th className="py-2.5 px-4">Hostname</th>
                  <th className="py-2.5 px-4">IP Address</th>
                  <th className="py-2.5 px-4">Organizational Role</th>
                  <th className="py-2.5 px-4">Compromise Prob</th>
                  <th className="py-2.5 px-4">Containment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                {report.affectedDevices.map((dev) => (
                  <tr key={dev.deviceId} className="font-mono">
                    <td className="py-2.5 px-4 font-bold text-cyan-300 print:text-blue-700">{dev.deviceId}</td>
                    <td className="py-2.5 px-4 text-slate-300 print:text-gray-800">{dev.hostname}</td>
                    <td className="py-2.5 px-4 text-slate-400">{dev.ip}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-300">{dev.role}</td>
                    <td className="py-2.5 px-4 text-red-400 font-bold">{dev.compromiseProbability}%</td>
                    <td className="py-2.5 px-4 font-sans text-amber-300">{dev.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* AI Multivariate Behavioral Findings */}
        <section className="space-y-3">
          <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-blue-700">
            3.0 AI Multivariate Behavioral Findings (Explainability Breakdown)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.aiFindings.map((finding, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 print:bg-gray-50 print:border-gray-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 print:text-gray-900">{finding.category}</span>
                  <span className="font-mono font-bold text-purple-300 print:text-purple-700">{finding.contribution}</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-gray-600 leading-relaxed">{finding.deviationDetails}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Attack Timeline */}
        <section className="space-y-3">
          <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-blue-700">
            4.0 Attack Progression Chronology
          </h3>
          <div className="space-y-2">
            {report.attackTimeline.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 print:bg-gray-50 print:border-gray-200">
                <span className="font-mono text-cyan-400 font-bold text-xs shrink-0 w-16 print:text-blue-600">
                  {item.time} UTC
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300 print:bg-gray-200">
                      {item.phase}
                    </span>
                    <span className="font-semibold text-slate-200 text-xs print:text-gray-800 truncate">{item.event}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 print:text-gray-600">{item.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Indicators of Compromise */}
        <section className="space-y-3">
          <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-blue-700">
            5.0 Correlated Indicators of Compromise (IoCs)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {report.technicalIoCs.map((ioc, idx) => (
              <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] print:bg-gray-50 print:border-gray-300">
                <span className="text-[9px] font-bold text-cyan-400 uppercase block">{ioc.type}</span>
                <p className="font-bold text-slate-200 truncate mt-0.5">{ioc.value}</p>
                <span className="text-[10px] text-slate-400 font-sans block mt-0.5 truncate">{ioc.notes}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Actions & Containment */}
        <section className="space-y-3">
          <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-blue-700">
            6.0 Required Containment & Remediation Actions
          </h3>
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 space-y-2 print:bg-gray-50 print:border-gray-300">
            {report.recommendedActions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-200 print:text-gray-900">
                <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{action}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Analyst Sign-off */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs text-slate-400">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">INVESTIGATING ANALYST</span>
            <p className="font-bold text-slate-200">{report.analystSignOff.name}</p>
            <p className="text-[11px]">{report.analystSignOff.role}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block">AUTHENTICATION TIMESTAMP</span>
            <p className="text-slate-200">{report.analystSignOff.date} 09:30:00 UTC</p>
          </div>
        </div>
      </div>
    </div>
  )
}
