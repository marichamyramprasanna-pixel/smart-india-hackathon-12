import React from 'react'
import { BrainCircuit, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { DeviceTelemetry } from '../../types/device'
import { calculateDeviceRisk } from '../../utils/riskCalculator'
import { useAlerts } from '../../hooks/useAlerts'

interface DeviceExplainabilityProps {
  device?: DeviceTelemetry
}

export const DeviceExplainability: React.FC<DeviceExplainabilityProps> = ({ device }) => {
  const { alerts } = useAlerts()

  const riskResult = device
    ? calculateDeviceRisk(device, alerts)
    : {
        aiAssessment:
          'Behavioral anomaly engine continuously evaluates Shannon entropy, FFT beaconing cadence, egress volume, and authentication timings.',
        contributions: [
          { name: 'DNS Shannon Entropy & DGA Queries', percentage: 31, impact: 'critical' as const },
          { name: 'Outbound Data Exfiltration Volume', percentage: 24, impact: 'high' as const },
          { name: 'Periodic C2 Cadence & Beacon Jitter', percentage: 14, impact: 'medium' as const },
          { name: 'Lateral Movement SMB / RPC Staging', percentage: 7, impact: 'low' as const },
        ],
      }

  return (
    <Card variant="ai" className="rounded-xl overflow-hidden shadow-purple-glow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-purple-400" />
            <CardTitle className="text-sm">
              Multivariate Explainability Analysis (SHAP Feature Attribution)
            </CardTitle>
          </div>
          {device && (
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-500/40 px-2 py-0.5 rounded">
              Target: {device.id}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-purple-200 italic leading-relaxed">
          "{riskResult.aiAssessment}"
        </p>

        <div className="space-y-2.5">
          {riskResult.contributions.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium">{item.name}</span>
                <span className="font-mono font-bold text-purple-300">+{item.percentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full ${
                    item.impact === 'critical'
                      ? 'bg-red-500'
                      : item.impact === 'high'
                      ? 'bg-orange-500'
                      : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, item.percentage * 2.5))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
