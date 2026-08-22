export type AnalyticsEventType =
  | 'dashboard_view'
  | 'threat_opened'
  | 'device_opened'
  | 'attack_graph_opened'
  | 'timeline_event_clicked'
  | 'ai_chat_opened'
  | 'ai_question_submitted'
  | 'ai_action_clicked'
  | 'report_generated'
  | 'demo_scenario_started'
  | 'demo_scenario_stage_changed'
  | 'device_isolated'
  | 'theme_changed'

export interface AnalyticsPayload {
  [key: string]: string | number | boolean | undefined
}

export function trackEvent(eventType: AnalyticsEventType, properties?: AnalyticsPayload): void {
  // Privacy-safety check: strictly omit sensitive fields
  const sanitizedProps = { ...(properties || {}) }
  delete (sanitizedProps as Record<string, unknown>)['password']
  delete (sanitizedProps as Record<string, unknown>)['token']
  delete (sanitizedProps as Record<string, unknown>)['secret']
  delete (sanitizedProps as Record<string, unknown>)['raw_payload']

  if ((import.meta as any).env?.DEV) {
    // eslint-disable-next-line no-console
    console.debug(`[SentinelX Telemetry] ${eventType}`, sanitizedProps)
  }
}
