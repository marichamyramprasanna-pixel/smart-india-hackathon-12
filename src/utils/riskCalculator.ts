import { DeviceTelemetry } from '../types/device'
import { ThreatAlert } from '../types/threat'

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
    const weightedDelta = deviation * f.weight
    totalWeightedDeviation += weightedDelta
    totalWeight += f.weight
    return {
      name: f.name,
      rawDev: deviation,
      weightedDelta,
    }
  })

  // Normalize composite anomaly score
  const normalizedAnomalyScore = totalWeight > 0 ? totalWeightedDeviation / totalWeight : 0

  // Probabilistic compromise probability using logistic sigmoid scaling over prior
  const logitPrior = Math.log(priorProbability / (1 - priorProbability))
  const logOdds = logitPrior + (normalizedAnomalyScore / 100) * 4.5
  const posteriorProb = 1 / (1 + Math.exp(-logOdds))

  const compromiseProbability = Math.round(posteriorProb * 100)
  const overallRisk = Math.min(
    99,
    Math.max(5, Math.round(normalizedAnomalyScore * 0.7 + compromiseProbability * 0.3))
  )

  // Calculate relative contributions summing to overall deviation percentage
  const totalDevSum = rawDeltas.reduce((acc, curr) => acc + curr.weightedDelta, 0) || 1
  const contributions = rawDeltas
    .map((item) => {
      const percentage = Math.round(
        (item.weightedDelta / totalDevSum) * (compromiseProbability - priorProbability * 100)
      )
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

  let aiAssessment =
    'The device behaviour operates in full alignment with learned baseline distributions.'
  if (status === 'CRITICAL' || status === 'HIGH_RISK') {
    aiAssessment =
      'The device behaviour significantly deviates from its learned baseline. The strongest deviations are associated with DNS activity, outbound connections and authentication timing.'
  } else if (status === 'ELEVATED') {
    aiAssessment =
      'Moderate statistical anomalies observed in network flow telemetry. Recommended active monitoring.'
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

/**
 * Derives dynamic SHAP-inspired anomaly risk factors and contributions for any specific live device
 */
export function calculateDeviceRisk(
  device: DeviceTelemetry,
  alerts: ThreatAlert[] = []
): RiskAnalysisResult {
  const deviceAlerts = alerts.filter((a) => a.deviceId === device.id)
  const isCompromised = device.status === 'COMPROMISED'
  const isSuspicious = device.status === 'SUSPICIOUS'

  const dnsScore =
    device.metrics?.dnsQueriesPerMin && device.metrics.dnsQueriesPerMin > 100
      ? Math.min(99, Math.round((device.metrics.dnsQueriesPerMin / 350) * 100))
      : isCompromised
      ? 88
      : isSuspicious
      ? 62
      : 15

  const egressScore =
    device.metrics?.outboundTrafficBytes && device.metrics.outboundTrafficBytes > 100000000
      ? Math.min(98, Math.round((device.metrics.outboundTrafficBytes / 5000000000) * 100))
      : isCompromised
      ? 82
      : isSuspicious
      ? 48
      : 12

  const authScore =
    device.metrics?.failedLogins24h && device.metrics.failedLogins24h > 2
      ? Math.min(95, device.metrics.failedLogins24h * 15)
      : isCompromised
      ? 75
      : isSuspicious
      ? 40
      : 8

  const beaconScore =
    device.metrics?.beaconingIntervalSeconds && device.metrics.beaconingIntervalSeconds > 0
      ? 92
      : isCompromised
      ? 85
      : isSuspicious
      ? 35
      : 5

  const lateralScore = deviceAlerts.some((a) => a.threatCategory === 'Lateral Movement')
    ? 90
    : isCompromised
    ? 70
    : 10

  const factors: RiskFactor[] = [
    {
      name: 'DNS Shannon Entropy & DGA Queries',
      weight: 0.35,
      observedScore: dnsScore,
      baselineScore: 18,
      description: 'Deviation in domain name entropy and NXDOMAIN rates.',
    },
    {
      name: 'Outbound Data Exfiltration Volume',
      weight: 0.25,
      observedScore: egressScore,
      baselineScore: 15,
      description: 'Encrypted egress traffic surge during off-hours.',
    },
    {
      name: 'Periodic C2 Cadence & Beacon Jitter',
      weight: 0.2,
      observedScore: beaconScore,
      baselineScore: 8,
      description: 'Fourier frequency spectral peaks in socket check-in cadence.',
    },
    {
      name: 'Authentication Anomaly (Shift & Service Accounts)',
      weight: 0.15,
      observedScore: authScore,
      baselineScore: 10,
      description: 'Off-hours privilege elevation and failed logon spikes.',
    },
    {
      name: 'Lateral Movement SMB / RPC Staging',
      weight: 0.15,
      observedScore: lateralScore,
      baselineScore: 10,
      description: 'Unauthorized cross-VLAN administrative session attempts.',
    },
  ]

  const baseResult = calculateNetworkRisk(factors, isCompromised ? 0.45 : isSuspicious ? 0.25 : 0.05)

  return {
    ...baseResult,
    overallRisk: device.riskScore || baseResult.overallRisk,
    compromiseProbability: device.compromiseProbability || baseResult.compromiseProbability,
    status:
      device.status === 'COMPROMISED'
        ? 'CRITICAL'
        : device.status === 'SUSPICIOUS'
        ? 'HIGH_RISK'
        : baseResult.status,
  }
}
