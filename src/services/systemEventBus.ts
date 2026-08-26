/**
 * SYSTEM ACTION EVENT BUS
 * Broadcasts real-time administrative actions (deleting, blocking, quarantining, restoring)
 * across Sentinel AI Copilot, live telemetry graphs, and audit loggers.
 */

export type SystemActionType =
  | 'DEVICE_ISOLATED'
  | 'DEVICE_UNISOLATED'
  | 'DEVICE_DELETED'
  | 'ALL_DEVICES_DELETED'
  | 'DEVICE_RESTORED'
  | 'DEVICE_REGISTERED'
  | 'IP_BLOCKED'
  | 'IP_UNBLOCKED'

export interface SystemActionEvent {
  type: SystemActionType
  targetId: string
  targetName?: string
  details?: string
  timestamp: string
}

export function emitSystemAction(event: Omit<SystemActionEvent, 'timestamp'>): void {
  if (typeof window === 'undefined') return
  const fullEvent: SystemActionEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  }
  window.dispatchEvent(new CustomEvent('sentinelx_system_action', { detail: fullEvent }))
}
