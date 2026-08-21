export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
export type ThreatStatus = 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'FALSE_POSITIVE'

export interface ThreatAlert {
  id: string
  alertCode: string // e.g. AL-2041
  title: string
  deviceId: string
  deviceHostname: string
  deviceIp: string
  threatCategory: 'Command & Control' | 'Data Exfiltration' | 'Lateral Movement' | 'Credential Access' | 'DGA Tunneling' | 'Reconnaissance'
  severity: ThreatSeverity
  confidenceScore: number // 0 to 100
  compromiseProbability: number // 0 to 100
  detectedAt: string
  status: ThreatStatus
  summary: string
  indicators: {
    type: 'IP' | 'Domain' | 'Port' | 'Entropy' | 'Process' | 'Jitter'
    value: string
    reputation: string
  }[]
  aiExplanation: string
  remediationSteps: string[]
  assignedAnalyst?: string
}
