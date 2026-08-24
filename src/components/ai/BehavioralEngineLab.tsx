import React, { useState, useMemo } from 'react'
import {
  BrainCircuit,
  Calculator,
  Sliders,
  Radio,
  Globe,
  Activity,
  Zap,
  Flame,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../common/Tabs'
import {
  calculateShannonEntropy,
  analyzeBeaconingCadence,
  calculateMultivariateAnomaly,
} from '../../utils/behavioralEngine'

export const BehavioralEngineLab: React.FC = () => {
  // Tab 1: DNS Entropy Sandbox
  const [testDomain, setTestDomain] = useState('d3x9a10-tunnel-c2.biz')
  const entropyResult = useMemo(() => calculateShannonEntropy(testDomain), [testDomain])

  // Tab 2: Beaconing Timing Sandbox
  const [intervalString, setIntervalString] = useState('30.01, 30.03, 29.98, 30.02, 30.05, 29.99, 30.02')
  const beaconResult = useMemo(() => {
    const parsed = intervalString
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n) && n > 0)
    return analyzeBeaconingCadence(parsed)
  }, [intervalString])

  // Tab 3: Multivariate Telemetry Sliders
  const [outboundMB, setOutboundMB] = useState(4800) // 4.8 GB
  const [failedLogins, setFailedLogins] = useState(14)
  const [dnsQps, setDnsQps] = useState(342)
  const [activeSockets, setActiveSockets] = useState(18)
  const [entropyInput, setEntropyInput] = useState(4.88)

  const multivariateResult = useMemo(
    () =>
      calculateMultivariateAnomaly({
        outboundBytes: outboundMB * 1_000_000,
        failedLogins24h: failedLogins,
        dnsQps: dnsQps,
        activeSockets: activeSockets,
        dnsEntropy: entropyInput,
      }),
    [outboundMB, failedLogins, dnsQps, activeSockets, entropyInput]
  )

  const handleResetBaselines = () => {
    setOutboundMB(250)
    setFailedLogins(1)
    setDnsQps(25)
    setActiveSockets(8)
    setEntropyInput(2.1)
  }

  const handleSetCompromisePreset = () => {
    setOutboundMB(4800)
    setFailedLogins(14)
    setDnsQps(342)
    setActiveSockets(18)
    setEntropyInput(4.88)
  }

  return (
    <Card variant="cyber" className="rounded-2xl overflow-hidden shadow-2xl border border-purple-500/40 bg-slate-950/90">
      <CardHeader className="pb-3 border-b border-slate-800/80 bg-gradient-to-r from-purple-950/60 via-slate-950 to-cyan-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-500/50 text-purple-300 shadow-neon-purple/30">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <span>Autonomous Behavioral Engine & Mathematical Profiler Lab</span>
                <Badge variant="ai" className="text-[9px] font-mono">
                  LIVE MODEL SIMULATOR
                </Badge>
              </CardTitle>
              <p className="text-xs text-slate-400">
                Interactive real-time execution sandbox for Shannon Entropy, FFT Periodicity, and Bayesian multivariate anomaly scoring.
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <Tabs defaultValue="multivariate" className="w-full">
          <TabsList className="w-full justify-start bg-slate-900/90 border-slate-800">
            <TabsTrigger value="multivariate">1. Multivariate Anomaly Scorer</TabsTrigger>
            <TabsTrigger value="entropy">2. DNS Shannon Entropy</TabsTrigger>
            <TabsTrigger value="beaconing">3. FFT Beaconing Cadence</TabsTrigger>
          </TabsList>

          {/* TAB 1: Multivariate Gaussian Z-Score Scorer */}
          <TabsContent value="multivariate" className="space-y-5 mt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs">
              <span className="text-purple-200">
                Simulate endpoint telemetry features to calculate composite Gaussian Z-score and posterior compromise probability:
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetBaselines}
                  className="text-xs gap-1 h-7 border-slate-700 text-slate-300"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clean Baseline</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleSetCompromisePreset}
                  className="text-xs gap-1 h-7 font-semibold"
                >
                  <Zap className="h-3 w-3 fill-current" />
                  <span>Compromise Preset</span>
                </Button>
              </div>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                  Bayesian Compromise Prob
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className={`text-3xl font-display font-extrabold font-mono-numbers ${
                      multivariateResult.compromiseProbability >= 80
                        ? 'text-red-400'
                        : multivariateResult.compromiseProbability >= 40
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {multivariateResult.compromiseProbability}%
                  </span>
                  <Badge
                    variant={
                      multivariateResult.riskTier === 'CRITICAL'
                        ? 'critical'
                        : multivariateResult.riskTier === 'HIGH'
                        ? 'high'
                        : 'healthy'
                    }
                    className="text-[9px]"
                  >
                    {multivariateResult.riskTier}
                  </Badge>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                  Composite Z-Score Deviation
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-display font-extrabold font-mono-numbers text-purple-300">
                    +{multivariateResult.compositeZScore}σ
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">above mean</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                  Dominant Anomaly Vector
                </span>
                <span className="text-sm font-bold text-slate-100 mt-1 line-clamp-1">
                  {multivariateResult.dominantAnomalyVector}
                </span>
              </div>
            </div>

            {/* Interactive Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Slider 1 */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 text-xs">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-300">Outbound Data Egress:</span>
                  <span className="text-cyan-300 font-bold">{outboundMB.toLocaleString()} MB ({(outboundMB / 1000).toFixed(1)} GB)</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="10000"
                  step="50"
                  value={outboundMB}
                  onChange={(e) => setOutboundMB(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Slider 2 */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 text-xs">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-300">Failed Kerberos / AD Logins:</span>
                  <span className="text-amber-300 font-bold">{failedLogins} attempts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={failedLogins}
                  onChange={(e) => setFailedLogins(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Slider 3 */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 text-xs">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-300">DNS Query Velocity:</span>
                  <span className="text-purple-300 font-bold">{dnsQps} queries/min</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="600"
                  step="5"
                  value={dnsQps}
                  onChange={(e) => setDnsQps(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              {/* Slider 4 */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 text-xs">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-300">DNS Shannon Entropy:</span>
                  <span className={`font-bold ${entropyInput >= 3.5 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {entropyInput} {entropyInput >= 3.5 ? '(DGA Tunneling)' : '(Linguistic Baseline)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.05"
                  value={entropyInput}
                  onChange={(e) => setEntropyInput(Number(e.target.value))}
                  className="w-full accent-red-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Feature Contribution SHAP Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
                Feature Attribution & Z-Score Variance:
              </span>
              <div className="space-y-2">
                {multivariateResult.contributions.map((c, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">{c.feature}</span>
                      <span className="text-purple-300 font-bold">
                        +{c.zScore}σ ({c.impactPercent}% contribution)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(c.impactPercent * 1.5, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: DNS Shannon Entropy */}
          <TabsContent value="entropy" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 block">
                Enter Domain / Subdomain String for Information Entropy Calculation:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={testDomain}
                  onChange={(e) => setTestDomain(e.target.value)}
                  placeholder="e.g. d3x9a10-tunnel-c2.biz"
                  className="h-9 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
                />
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTestDomain('google.com')}
                    className="text-xs h-9 border-slate-700"
                  >
                    google.com (Normal)
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setTestDomain('d3x9a10-tunnel-c2.biz')}
                    className="text-xs h-9"
                  >
                    DGA Tunnel (Malicious)
                  </Button>
                </div>
              </div>
            </div>

            {/* Entropy Calculation Card */}
            <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-cyan-400" />
                  <span className="font-mono text-sm font-bold text-slate-100">
                    Shannon Entropy: {entropyResult.entropy}
                  </span>
                </div>
                <Badge variant={entropyResult.isDga ? 'critical' : 'healthy'}>
                  {entropyResult.isDga ? 'DGA ANOMALY DETECTED' : 'NORMAL LINGUISTIC DOMAIN'}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {entropyResult.explanation}
              </p>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-purple-300">
                Formula: H(X) = -Σ P(x) · log₂(P(x)) | Confidence Score: {entropyResult.confidence}%
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: FFT Beaconing Cadence */}
          <TabsContent value="beaconing" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 block">
                Socket Check-in Intervals in Seconds (Comma Separated):
              </label>
              <input
                type="text"
                value={intervalString}
                onChange={(e) => setIntervalString(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-red-400 animate-pulse" />
                  <span className="font-mono text-sm font-bold text-slate-100">
                    Dominant Cadence: {beaconResult.dominantIntervalSec}s (Jitter: {beaconResult.jitterPercent}%)
                  </span>
                </div>
                <Badge variant={beaconResult.isBeaconing ? 'critical' : 'healthy'}>
                  {beaconResult.isBeaconing ? 'PERIODIC C2 BEACONING' : 'IRREGULAR HUMAN TRAFFIC'}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {beaconResult.explanation}
              </p>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-cyan-300">
                Autocorrelation Peak: {beaconResult.autocorrelationPeak} | Confidence: {beaconResult.confidenceScore}%
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
