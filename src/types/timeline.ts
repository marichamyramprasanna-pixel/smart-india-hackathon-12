export type TimelineEventCategory = 
  | 'AUTH_ANOMALY' 
  | 'DNS_DGA' 
  | 'EXTERNAL_CONNECT' 
  | 'BEACONING' 
  | 'DATA_EXFIL' 
  | 'LATERAL_MOVEMENT' 
  | 'COMPROMISE_FLAG' 
  | 'CONTAINMENT'

export interface AttackTimelineEvent {
  id: string
  stageNumber: number // 1 to 7
  timeStr: string // e.g. "09:12"
  timestamp: string // ISO
  title: string
  category: TimelineEventCategory
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  deviceId: string
  targetEntity?: string
  confidenceScore: number
  description: string
  technicalDetails: {
    mitreTechniqueId?: string // e.g. T1071.004
    mitreTactic?: string
    signatureMatch: string
    observedAnomaly: string
    baselineComparison: string
    payloadSummary?: string
  }
  recommendedAction: string
}
