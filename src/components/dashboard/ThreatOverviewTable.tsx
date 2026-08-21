import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Flame,
  CheckCircle,
  Eye,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { useDemoScenario } from '../../context/DemoScenarioContext'

export const ThreatOverviewTable: React.FC = () => {
  const navigate = useNavigate()
  const { threatsList, currentStage } = useDemoScenario()

  return (
    <Card variant="cyber" className="rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-red-950/60 border border-red-500/40 text-red-400">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm">
              <span>Active Threat Triage</span>
              {threatsList.length > 0 && (
                <Badge variant="critical" className="text-[10px] ml-2 font-mono">
                  {threatsList.length} INTERCEPTED
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-slate-400">
              Live alerts ranked by AI compromise probability and behavioral deviation severity.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/threats')}
          className="text-xs h-7 gap-1"
        >
          <span>All Threats</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {threatsList.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-400/60 mb-2" />
            <p className="font-semibold text-slate-200">No active threats detected</p>
            <p className="text-[11px] text-slate-500 mt-1">All 1,248 monitored endpoints are within normal parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Alert ID</th>
                  <th className="py-2.5 px-4">Target Device</th>
                  <th className="py-2.5 px-4">Threat Type</th>
                  <th className="py-2.5 px-4">AI Confidence</th>
                  <th className="py-2.5 px-4">Detected</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {threatsList.map((threat) => (
                  <tr
                    key={threat.id}
                    className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/devices/${threat.deviceId}`)}
                  >
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          threat.severity === 'CRITICAL' ? 'critical' :
                          threat.severity === 'HIGH' ? 'high' :
                          threat.severity === 'MEDIUM' ? 'medium' : 'low'
                        }
                        pulse={threat.severity === 'CRITICAL'}
                        className="text-[10px]"
                      >
                        {threat.severity}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                      {threat.alertCode}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {threat.deviceId}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {threat.deviceIp}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div className="line-clamp-1 max-w-xs">{threat.title}</div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className="text-orange-400 font-bold">
                        {threat.confidenceScore}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {threat.detectedAt}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/devices/${threat.deviceId}`)
                        }}
                        className="h-7 px-2 text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        <span>Investigate</span>
                        <Eye className="h-3 w-3 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
