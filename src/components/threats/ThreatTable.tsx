import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  BrainCircuit,
  Eye,
  CheckCircle,
  Clock,
  Zap,
  Lock,
  Check,
} from 'lucide-react'
import { ThreatAlert } from '../../types/threat'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { useSentinelAI } from '../../context/SentinelAIContext'
import { useInvestigation } from '../../context/InvestigationContext'

interface ThreatTableProps {
  threats: ThreatAlert[]
  onSelectThreat?: (threat: ThreatAlert) => void
}

export const ThreatTable: React.FC<ThreatTableProps> = ({ threats, onSelectThreat }) => {
  const navigate = useNavigate()
  const { toggleOpen, sendMessage, setCurrentContext } = useSentinelAI()
  const { blockIp, isIpBlocked } = useInvestigation()
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({ 'AL-2041': true })
  const [sortField, setSortField] = useState<keyof ThreatAlert>('confidenceScore')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAskAIAboutAlert = (threat: ThreatAlert, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentContext({ type: 'threat', id: threat.alertCode, name: threat.title })
    toggleOpen()
    sendMessage(`Explain alert ${threat.alertCode} on ${threat.deviceId} and outline the recommended containment steps.`)
  }

  const sortedThreats = [...threats].sort((a, b) => {
    const valA = a[sortField] ?? ''
    const valB = b[sortField] ?? ''
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'desc' ? valB - valA : valA - valB
    }
    return sortDirection === 'desc'
      ? String(valB).localeCompare(String(valA))
      : String(valA).localeCompare(String(valB))
  })

  return (
    <Card variant="cyber" className="rounded-xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono uppercase text-slate-400">
              <th className="py-3 px-4 w-10"></th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Alert ID</th>
              <th className="py-3 px-4">Target Device</th>
              <th className="py-3 px-4">Threat Description</th>
              <th className="py-3 px-4">AI Confidence</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedThreats.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <CheckCircle className="mx-auto h-8 w-8 text-emerald-400/50 mb-2" />
                  <p className="font-semibold text-slate-200">No matching threat alerts found</p>
                  <p className="text-xs text-slate-500 mt-1">Adjust your filter criteria to inspect other telemetry logs.</p>
                </td>
              </tr>
            ) : (
              sortedThreats.map((threat) => {
                const isExpanded = !!expandedRows[threat.id]
                const isCritical = threat.severity === 'CRITICAL'

                return (
                  <React.Fragment key={threat.id}>
                    <tr
                      onClick={() => onSelectThreat ? onSelectThreat(threat) : navigate(`/devices/${threat.deviceId}`)}
                      className={`hover:bg-slate-850/60 transition-colors cursor-pointer group ${
                        isCritical ? 'bg-red-950/10' : ''
                      }`}
                    >
                      {/* Expand Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={(e) => toggleRow(threat.id, e)}
                          className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-cyan-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Severity Badge */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            threat.severity === 'CRITICAL' ? 'critical' :
                            threat.severity === 'HIGH' ? 'high' :
                            threat.severity === 'MEDIUM' ? 'medium' : 'low'
                          }
                          pulse={isCritical}
                          className="text-[10px]"
                        >
                          {threat.severity}
                        </Badge>
                      </td>

                      {/* Alert Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                        {threat.alertCode}
                      </td>

                      {/* Target Device */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {threat.deviceId}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {threat.deviceIp}
                        </div>
                      </td>

                      {/* Threat Summary */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-medium text-slate-200 truncate">{threat.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{threat.summary}</p>
                      </td>

                      {/* Confidence */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 rounded-full"
                              style={{ width: `${threat.confidenceScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-200">{threat.confidenceScore}%</span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {threat.detectedAt}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            threat.status === 'INVESTIGATING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : threat.status === 'NEW'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {threat.status}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ai"
                            size="sm"
                            onClick={(e) => handleAskAIAboutAlert(threat, e)}
                            className="h-7 px-2 text-[11px] gap-1"
                            title="Analyze with Sentinel AI"
                          >
                            <Zap className="h-3 w-3 fill-current" />
                            <span>AI Triage</span>
                          </Button>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/devices/${threat.deviceId}`)
                            }}
                            className="h-7 px-2.5 text-[11px] gap-1 font-semibold"
                          >
                            <span>Investigate</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Deep Forensic Inspection Row */}
                    {isExpanded && (
                      <tr className="bg-slate-950/90 border-b border-slate-800/80">
                        <td colSpan={9} className="p-4 sm:p-5">
                          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2">
                                <BrainCircuit className="h-4 w-4 text-purple-400" />
                                <span className="font-mono text-xs font-bold text-purple-300 uppercase tracking-wider">
                                  AI Forensic Assessment & IoC Evidence
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">
                                Assigned: {threat.assignedAnalyst || 'Unassigned'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed italic">
                              "{threat.aiExplanation}"
                            </p>

                            {/* Indicators of Compromise Pills */}
                            <div>
                              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1.5">
                                Correlated Evidence & IoCs:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                {threat.indicators.map((ioc, idx) => {
                                  const isIp = ioc.type === 'IP' || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ioc.value)
                                  const blocked = isIp ? isIpBlocked(ioc.value) : false

                                  return (
                                    <div
                                      key={idx}
                                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] flex flex-col justify-between space-y-1.5 hover:border-slate-700 transition-colors"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase block">
                                          {ioc.type}
                                        </span>
                                        {isIp && !ioc.value.startsWith('10.') && (
                                          <Button
                                            variant={blocked ? 'secondary' : 'destructive'}
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              blockIp(ioc.value, `Malicious IP in alert ${threat.alertCode}`)
                                            }}
                                            disabled={blocked}
                                            className="h-5 px-1.5 text-[9px] font-mono"
                                          >
                                            {blocked ? (
                                              <span className="flex items-center gap-0.5 text-emerald-400">
                                                <Check className="h-2.5 w-2.5" /> Blocked
                                              </span>
                                            ) : (
                                              'Block IP'
                                            )}
                                          </Button>
                                        )}
                                      </div>

                                      <p className="font-mono font-bold text-slate-100 truncate">
                                        {ioc.value}
                                      </p>
                                      <span className="text-[10px] text-slate-400 truncate block">
                                        {ioc.reputation}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Recommended Remediation Steps */}
                            <div className="pt-2 border-t border-slate-800/60">
                              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
                                Recommended Containment Actions:
                              </span>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                                {threat.remediationSteps.map((step, idx) => (
                                  <li key={idx} className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
