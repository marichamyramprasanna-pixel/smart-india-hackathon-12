import React from 'react'
import { BrainCircuit, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { useDemoScenario } from '../../context/DemoScenarioContext'

export const DeviceExplainability: React.FC = () => {
  const { currentStage } = useDemoScenario()

  return (
    <Card variant="ai" className="rounded-xl overflow-hidden shadow-purple-glow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-purple-400" />
          <CardTitle className="text-sm">Multivariate Explainability Analysis (SHAP Feature Breakdown)</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-purple-200 italic leading-relaxed">
          "{currentStage.aiAssessment}"
        </p>

        <div className="space-y-2.5">
          {currentStage.anomalyContributions.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium">{item.name}</span>
                <span className="font-mono font-bold text-purple-300">+{item.percentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full ${
                    item.impact === 'critical' ? 'bg-red-500' :
                    item.impact === 'high' ? 'bg-orange-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(100, item.percentage * 2.8)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
