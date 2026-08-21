import { describe, it, expect } from 'vitest'
import { calculateNetworkRisk, RiskFactor } from '../utils/riskCalculator'

describe('calculateNetworkRisk', () => {
  it('returns baseline protected metrics when factors array is empty', () => {
    const result = calculateNetworkRisk([])
    expect(result.status).toBe('PROTECTED')
    expect(result.compromiseProbability).toBe(18)
    expect(result.confidence).toBe(95)
  })

  it('correctly calculates critical compromise probability for multi-vector deviations', () => {
    const factors: RiskFactor[] = [
      { name: 'Abnormal DNS Behaviour', weight: 0.35, observedScore: 98, baselineScore: 12, description: 'DGA flood' },
      { name: 'Outbound Traffic Anomaly', weight: 0.25, observedScore: 95, baselineScore: 15, description: '4.8 GB egress' },
      { name: 'Authentication Anomaly', weight: 0.20, observedScore: 85, baselineScore: 10, description: 'Off-hours Kerberos' },
      { name: 'Beaconing Pattern', weight: 0.15, observedScore: 92, baselineScore: 5, description: '30s cadence' },
      { name: 'Lateral Movement', weight: 0.05, observedScore: 80, baselineScore: 5, description: 'SMB hop' },
    ]

    const result = calculateNetworkRisk(factors)
    expect(result.compromiseProbability).toBeGreaterThanOrEqual(85)
    expect(result.status).toBe('CRITICAL')
    expect(result.contributions.length).toBe(5)
    expect(result.contributions[0].name).toBe('Abnormal DNS Behaviour')
    expect(result.contributions[0].impact).toBe('critical')
  })
})
