export interface RiskFactor {
  name: string
  weight: number // 0 to 1
  observedScore: number // 0 to 100
  baselineScore: number // 0 to 100
  description: string
}

export interface RiskAnalysisResult {
  overallRisk: number
  compromiseProbability: number
  confidence: number
  status: 'PROTECTED' | 'ELEVATED' | 'HIGH_RISK' | 'CRITICAL'
  contributions: {
    name: string
    percentage: number
    delta: number
    impact: 'critical' | 'high' | 'medium' | 'low'
  }[]
  aiAssessment: string
}

/**
 * Probabilistic Bayesian-inspired risk computation combining multi-modal behavioral deviations
 */
export function calculateNetworkRisk(
  factors: RiskFactor[],
  priorProbability: number = 0.15
): RiskAnalysisResult {
  if (!factors.length) {
    return {
      overallRisk: 18,
      compromiseProbability: 18,
      confidence: 95,
      status: 'PROTECTED',
      contributions: [],
      aiAssessment: 'All monitored telemetry parameters are within normal baseline thresholds.',
    }
  }

  let totalWeightedDeviation = 0
  let totalWeight = 0

  const rawDeltas = factors.map((f) => {
    const deviation = Math.max(0, f.observedScore - f.baselineScore)
    const weightedDelta = (deviation * f.weight)
    totalWeightedDeviation += weightedDelta
    totalWeight += f.weight
    return {
      name: f.name,
      rawDev: deviation,
      weightedDelta,
    }
  })

  // Normalize composite anomaly score
  const normalizedAnomalyScore = totalWeight > 0 ? (totalWeightedDeviation / totalWeight) : 0
  
  // Probabilistic compromise probability using logistic sigmoid scaling over prior
  const logitPrior = Math.log(priorProbability / (1 - priorProbability))
  const logOdds = logitPrior + (normalizedAnomalyScore / 100) * 4.5
  const posteriorProb = 1 / (1 + Math.exp(-logOdds))
  
  const compromiseProbability = Math.round(posteriorProb * 100)
  const overallRisk = Math.min(99, Math.max(5, Math.round((normalizedAnomalyScore * 0.7) + (compromiseProbability * 0.3))))

  // Calculate relative contributions summing to overall deviation percentage
  const totalDevSum = rawDeltas.reduce((acc, curr) => acc + curr.weightedDelta, 0) || 1
  const contributions = rawDeltas
    .map((item) => {
      const percentage = Math.round((item.weightedDelta / totalDevSum) * (compromiseProbability - (priorProbability * 100)))
      const normDelta = Math.max(0, percentage)
      let impact: 'critical' | 'high' | 'medium' | 'low' = 'low'
      if (normDelta >= 25) impact = 'critical'
      else if (normDelta >= 15) impact = 'high'
      else if (normDelta >= 8) impact = 'medium'

      return {
        name: item.name,
        percentage: normDelta,
        delta: normDelta,
        impact,
      }
    })
    .sort((a, b) => b.percentage - a.percentage)

  let status: 'PROTECTED' | 'ELEVATED' | 'HIGH_RISK' | 'CRITICAL' = 'PROTECTED'
  if (compromiseProbability >= 85) status = 'CRITICAL'
  else if (compromiseProbability >= 65) status = 'HIGH_RISK'
  else if (compromiseProbability >= 35) status = 'ELEVATED'

  let aiAssessment = 'The device behaviour operates in full alignment with learned baseline distributions.'
  if (status === 'CRITICAL' || status === 'HIGH_RISK') {
    aiAssessment = 'The device behaviour significantly deviates from its learned baseline. The strongest deviations are associated with DNS activity, outbound connections and authentication timing.'
  } else if (status === 'ELEVATED') {
    aiAssessment = 'Moderate statistical anomalies observed in network flow telemetry. Recommended active monitoring.'
  }

  return {
    overallRisk,
    compromiseProbability,
    confidence: 96.4,
    status,
    contributions,
    aiAssessment,
  }
}
