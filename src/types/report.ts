export interface IncidentReport {
  id: string
  reportNumber: string
  generatedAt: string
  title: string
  executiveSummary: string
  incidentSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  affectedDevices: {
    deviceId: string
    hostname: string
    ip: string
    role: string
    compromiseProbability: number
    status: string
  }[]
  attackTimeline: {
    time: string
    phase: string
    event: string
    impact: string
  }[]
  aiFindings: {
    category: string
    contribution: string
    deviationDetails: string
  }[]
  technicalIoCs: {
    type: 'IP' | 'Domain' | 'Hash' | 'Port'
    value: string
    notes: string
  }[]
  containmentStatus: string
  recommendedActions: string[]
  analystSignOff: {
    name: string
    role: string
    date: string
  }
}
