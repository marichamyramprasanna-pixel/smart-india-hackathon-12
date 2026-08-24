import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { useDevices } from '../../hooks/useDevices'
import { useAlerts } from '../../hooks/useAlerts'
import { useSentinelAI } from '../../context/SentinelAIContext'
import { calculateDeviceRisk } from '../../utils/riskCalculator'

export const AIExplainabilityCard: React.FC = () => {
  const navigate = useNavigate()
  const { devices } = useDevices()
  const { alerts } = useAlerts()
  const { toggleOpen, sendMessage, setCurrentContext } = useSentinelAI()

  const compromised = devices.filter((d) => d.status === 'COMPROMISED')
  const suspicious = devices.filter((d) => d.status === 'SUSPICIOUS')
  const targetDevice = compromised[0] || suspicious[0] || devices[0]

  const riskResult = targetDevice
    ? calculateDeviceRisk(targetDevice, alerts)
    : {
        overallRisk: 18,
        compromiseProbability: 18,
        confidence: 96.4,
        status: 'PROTECTED' as const,
        aiAssessment:
          'All monitored telemetry parameters are within normal baseline thresholds.',
        contributions: [
          { name: 'DNS Shannon Entropy & DGA Queries', percentage: 12, delta: 12, impact: 'low' as const },
          { name: 'Outbound Data Exfiltration Volume', percentage: 8, delta: 8, impact: 'low' as const },
          { name: 'Periodic C2 Cadence & Beacon Jitter', percentage: 5, delta: 5, impact: 'low' as const },
        ],
      }

  const handleAskDetailedAI = () => {
    if (targetDevice) {
      setCurrentContext({ type: 'device', id: targetDevice.id, name: targetDevice.hostname })
      toggleOpen()
      sendMessage(`Explain the exact mathematical contributions for why ${targetDevice.id} (${targetDevice.hostname}) was flagged.`)
    } else {
      toggleOpen()
      sendMessage('Provide a deep forensic breakdown of active AI behavioral anomaly models.')
    }
  }

  return (
    <Card variant="ai" className="rounded-xl overflow-hidden shadow-purple-glow">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-purple-900/50 border border-purple-500/40 text-purple-300">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm">
              <span>AI Behavioural Anomaly Attribution</span>
              <Badge variant="ai" className="text-[10px] ml-1.5 font-mono">
                EXPLAINABILITY ENGINE
              </Badge>
            </CardTitle>
            <p className="text-xs text-slate-400">
              {targetDevice ? (
                <>
                  Telemetry Analysis for{' '}
                  <strong className="text-purple-300">
                    {targetDevice.id} ({targetDevice.hostname})
                  </strong>
                </>
              ) : (
                'Real-time behavioral telemetry baseline'
              )}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/ai-analysis')}
          className="text-xs h-7 gap-1 border-purple-500/40 text-purple-300 hover:bg-purple-950/40"
        >
          <span>Full Analysis</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 pt-3">
        {/* Top 4 Anomaly KPI gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500">Anomaly Score</span>
            <p className="text-base font-bold font-mono text-purple-300">
              {targetDevice ? `${Math.min(99, targetDevice.riskScore + 3)}%` : '18%'}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500">Behavioural Risk</span>
            <p className="text-base font-bold font-mono text-orange-400">
              {targetDevice ? `${targetDevice.riskScore}%` : '15%'}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500">Compromise Prob</span>
            <p className="text-base font-bold font-mono text-red-400">
              {riskResult.compromiseProbability}%
            </p>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500">Model Confidence</span>
            <p className="text-base font-bold font-mono text-cyan-300">{riskResult.confidence}%</p>
          </div>
        </div>

        {/* Feature Importance Contribution Waterfall Bars */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px] uppercase font-semibold">
              Multivariate Feature Contribution (SHAP Deviation Breakdown)
            </span>
            <span className="font-mono text-[11px] text-purple-300">
              Deviations: +{Math.max(0, riskResult.compromiseProbability - 15)}%
            </span>
          </div>

          <div className="space-y-2">
            {riskResult.contributions.map((factor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{factor.name}</span>
                  <span className="font-mono font-bold text-purple-300">+{factor.percentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      factor.impact === 'critical'
                        ? 'bg-gradient-to-r from-purple-500 to-red-500 shadow-red-glow-sm'
                        : factor.impact === 'high'
                        ? 'bg-gradient-to-r from-purple-500 to-orange-500'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(8, factor.percentage * 2.6))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Probabilistic AI Assessment Box */}
        <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-950/20 text-xs text-purple-200 leading-relaxed">
          <p className="font-mono text-[11px] text-purple-400 font-bold mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            AI BEHAVIOURAL ASSESSMENT
          </p>
          <p className="italic">"{riskResult.aiAssessment}"</p>
          <div className="mt-2 pt-2 border-t border-purple-900/40 flex items-center justify-between text-[11px] text-slate-400">
            <span>Model: Multivariate Bayesian Autoencoder (v3.4)</span>
            <button
              onClick={handleAskDetailedAI}
              className="text-purple-300 hover:text-purple-200 underline font-medium"
            >
              Ask Sentinel AI for deep forensics →
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
