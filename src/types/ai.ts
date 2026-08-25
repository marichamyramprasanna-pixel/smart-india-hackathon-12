export interface AIChatMessage {
  id: string
  sender: 'user' | 'assistant' | 'system'
  timestamp: string
  content: string
  confidence?: number
  context?: {
    type: 'device' | 'threat' | 'network' | 'global'
    id?: string
    name?: string
  }
  suggestedActions?: {
    id: string
    label: string
    actionType: 'navigate' | 'isolate_device' | 'block_ip' | 'generate_report' | 'filter_threats' | 'explain_anomaly' | 'delete_all' | 'quarantine' | 'restore_device' | string
    payload?: Record<string, unknown>
  }[]
  structuredInsight?: {
    title: string
    riskScore: number
    evidence: string[]
    recommendedMitigation: string
  }
}

export interface AIChatRequestPayload {
  message: string
  context: {
    type: 'device' | 'threat' | 'network' | 'global'
    id?: string
    name?: string
  }
  conversation_id: string
}

export interface AIChatResponsePayload {
  message: string
  confidence: number
  actions: {
    id: string
    label: string
    actionType: string
    payload?: Record<string, unknown>
  }[]
  structuredInsight?: {
    title: string
    riskScore: number
    evidence: string[]
    recommendedMitigation: string
  }
}
