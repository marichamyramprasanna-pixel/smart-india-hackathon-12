import React from 'react'
import {
  BrainCircuit,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { AIExplainabilityCard } from '../components/dashboard/AIExplainabilityCard'
import { useDemoScenario } from '../context/DemoScenarioContext'
import { useSentinelAI } from '../context/SentinelAIContext'
import { useNavigate } from 'react-router-dom'

export const AIAnalysisPage: React.FC = () => {
  const navigate = useNavigate()
  const { currentStage } = useDemoScenario()
  const { toggleOpen, sendMessage } = useSentinelAI()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-purple-500/30 bg-purple-950/20 backdrop-blur-xl shadow-purple-glow">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
              <Zap className="h-3 w-3 fill-current" />
              INTELLIGENCE ENGINE
            </span>
            <span className="text-xs font-mono text-slate-400">
              48 Continuous Classifiers Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
            AI Behavioural Anomaly & Explainability Hub
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Transparent probabilistic feature importance, baseline divergence distributions, and SHAP attribution models.
          </p>
        </div>

        <Button
          variant="ai"
          size="sm"
          onClick={() => {
            toggleOpen()
            sendMessage('Provide a deep forensic breakdown of all active AI behavioral anomaly models.')
          }}
          className="text-xs font-semibold gap-1.5"
        >
          <BrainCircuit className="h-4 w-4" />
          <span>Consult Sentinel AI</span>
        </Button>
      </div>

      {/* Main Explainability Card */}
      <AIExplainabilityCard />

      {/* Model Architectures & Feature Extraction Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card variant="cyber" className="p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-cyan-300">DNS Entropy Model</span>
            <Badge variant="ai" className="text-[9px]">ONLINE</Badge>
          </div>
          <p className="text-xs text-slate-300">
            Measures Shannon entropy of subdomains in real-time. Flags algorithmically generated dynamic DGA tunnels with p-value &lt; 0.001.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            Observed Entropy: <strong className="text-purple-300">4.88</strong> (Baseline: 1.90)
          </div>
        </Card>

        <Card variant="cyber" className="p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-cyan-300">Beaconing FFT Analyzer</span>
            <Badge variant="ai" className="text-[9px]">ONLINE</Badge>
          </div>
          <p className="text-xs text-slate-300">
            Computes Fast Fourier Transform frequency periodicity over socket packet intervals. Flags deterministic bot heartbeats with low jitter.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            Cadence: <strong className="text-red-400">30.02s</strong> (Jitter: 0.4%)
          </div>
        </Card>

        <Card variant="cyber" className="p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-cyan-300">Graph Lateral Hop Model</span>
            <Badge variant="ai" className="text-[9px]">ONLINE</Badge>
          </div>
          <p className="text-xs text-slate-300">
            Tracks topological adjacency probabilities between workstation VLANs and core database subnets to intercept Pass-the-Hash staging.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            Target Asset: <strong className="text-orange-400">DB-CORE-07 (Port 445)</strong>
          </div>
        </Card>
      </div>
    </div>
  )
}
