import React, { useState } from 'react'
import { ReportPreview } from '../components/reports/ReportPreview'
import { defaultIncidentReport } from '../api/reports'
import { IncidentReport } from '../types/report'
import { useDemoScenario } from '../context/DemoScenarioContext'
import { Button } from '../components/common/Button'
import { FileText, Download, Printer, RefreshCw, CheckCircle, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import confetti from 'canvas-confetti'

export const ReportsPage: React.FC = () => {
  const { currentStage } = useDemoScenario()
  const [report, setReport] = useState<IncidentReport>(defaultIncidentReport)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateFreshReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setReport({
        ...defaultIncidentReport,
        reportNumber: `SX-INC-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
        generatedAt: new Date().toISOString(),
        incidentSeverity: currentStage.compromiseProbability >= 80 ? 'CRITICAL' : 'HIGH',
      })
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
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
            Incident Forensics & Executive Report Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate, customize, and export audit-ready forensic summaries detailing IoCs, AI findings, and containment status.
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
            <span>Generate Fresh Report</span>
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
