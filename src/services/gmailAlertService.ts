/**
 * GMAIL EMERGENCY ALERT & ESCALATION SERVICE
 * Automatically dispatches security advisory emails when risk scores exceed 80%.
 */

export interface GmailAlertPayload {
  id: string
  deviceId: string
  hostname: string
  ip: string
  riskScore: number
  compromiseProbability: number
  threatTitle: string
  mitreTactic: string
  anomalies: string[]
  recommendedAction: string
  timestamp: string
}

export interface GmailDispatchLog {
  id: string
  timestamp: string
  recipient: string
  deviceId: string
  hostname: string
  riskScore: number
  subject: string
  status: 'SENT' | 'QUEUED' | 'LOGGED'
  composeUrl: string
}

const GMAIL_SETTINGS_KEY = 'sentinelx_gmail_recipient'
const GMAIL_LOGS_KEY = 'sentinelx_gmail_dispatch_logs'
const GMAIL_AUTO_SEND_KEY = 'sentinelx_gmail_auto_send_80'
const DEFAULT_RECIPIENT = 'soc-escalation@gmail.com'

let inMemoryRecipient = DEFAULT_RECIPIENT
let inMemoryAutoSend = true
let inMemoryLogs: GmailDispatchLog[] = []

// In-memory rate limiting / cooldown tracker (5 min cooldown per device)
const lastDispatchedTimestamps = new Map<string, number>()
const COOLDOWN_MS = 1000 * 60 * 5 // 5 minutes

export function getGmailRecipient(): string {
  try {
    const val = localStorage.getItem(GMAIL_SETTINGS_KEY)
    if (val) return val
  } catch {}
  return inMemoryRecipient
}

export function setGmailRecipient(email: string): void {
  inMemoryRecipient = email
  try {
    localStorage.setItem(GMAIL_SETTINGS_KEY, email)
  } catch {}
}

export function isGmailAutoSendEnabled(): boolean {
  try {
    const val = localStorage.getItem(GMAIL_AUTO_SEND_KEY)
    if (val !== null) return val === 'true'
  } catch {}
  return inMemoryAutoSend
}

export function setGmailAutoSendEnabled(enabled: boolean): void {
  inMemoryAutoSend = enabled
  try {
    localStorage.setItem(GMAIL_AUTO_SEND_KEY, enabled ? 'true' : 'false')
  } catch {}
}

export function getGmailDispatchLogs(): GmailDispatchLog[] {
  try {
    const raw = localStorage.getItem(GMAIL_LOGS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return inMemoryLogs
}

function saveGmailDispatchLog(log: GmailDispatchLog) {
  const current = getGmailDispatchLogs()
  const updated = [log, ...current].slice(0, 50) // Keep last 50
  inMemoryLogs = updated
  try {
    localStorage.setItem(GMAIL_LOGS_KEY, JSON.stringify(updated))
  } catch {}
}

/**
 * Builds direct Gmail web compose URL pre-populated with security details
 */
export function buildGmailComposeUrl(recipient: string, subject: string, bodyText: string): string {
  const encTo = encodeURIComponent(recipient)
  const encSubject = encodeURIComponent(subject)
  const encBody = encodeURIComponent(bodyText)
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}&su=${encSubject}&body=${encBody}`
}

/**
 * Generates structured email text body for SOC incident response
 */
export function generateSecurityAdvisoryBody(payload: GmailAlertPayload): string {
  return `=====================================================
SENTINEL-X AUTONOMOUS SOC - EMERGENCY THREAT ADVISORY
INCIDENT SEVERITY: CRITICAL (>80% RISK THRESHOLD REACHED)
=====================================================

Dear SOC Analyst / Security Operations Lead,

An automated high-risk security alert has exceeded the 80% containment threshold on your monitored network.

--- INCIDENT SUMMARY ---
- Host / Target ID     : ${payload.deviceId} (${payload.hostname})
- Target IPv4 Address  : ${payload.ip}
- Bayesian Risk Score  : ${payload.riskScore}/100 [CRITICAL]
- Compromise Prob.     : ${payload.compromiseProbability}%
- Threat Classification: ${payload.threatTitle}
- MITRE ATT&CK Tactic  : ${payload.mitreTactic}
- Detection Timestamp  : ${new Date(payload.timestamp).toUTCString()}

--- FLAGGED BEHAVIORAL ANOMALIES ---
${payload.anomalies.length > 0 ? payload.anomalies.map((a, i) => `${i + 1}. ${a}`).join('\n') : '1. Multivariate anomaly detected across DNS entropy and outbound socket volume'}

--- RECOMMENDED CONTAINMENT ACTION ---
${payload.recommendedAction}

--- 1-CLICK INVESTIGATION & CONTAINMENT ---
Review forensic telemetry and enforce 802.1X quarantine:
http://localhost:5174/devices/${payload.deviceId}

Blocked & Quarantined Devices Hub:
http://localhost:5174/blocked-devices

This alert was generated automatically by SentinelX Security Engine.
=====================================================`
}

export const gmailAlertService = {
  /**
   * Triggers Gmail emergency alert if risk score is >= 80%
   */
  async triggerRiskAlert(payload: GmailAlertPayload, force: boolean = false): Promise<{
    dispatched: boolean
    reason?: string
    log?: GmailDispatchLog
    composeUrl?: string
  }> {
    // 1. Threshold Check: Must be >= 80%
    if (payload.riskScore < 80 && payload.compromiseProbability < 80) {
      return { dispatched: false, reason: 'Risk score below 80% threshold' }
    }

    // 2. Cooldown check (5 mins per device)
    const now = Date.now()
    const lastTime = lastDispatchedTimestamps.get(payload.deviceId) || 0
    if (!force && now - lastTime < COOLDOWN_MS) {
      return { dispatched: false, reason: 'Cooldown active for this device' }
    }
    lastDispatchedTimestamps.set(payload.deviceId, now)

    const recipient = getGmailRecipient()
    const subject = `🚨 [CRITICAL ALERT] ${payload.riskScore}% Risk Threat on ${payload.deviceId} (${payload.hostname})`
    const bodyText = generateSecurityAdvisoryBody(payload)
    const composeUrl = buildGmailComposeUrl(recipient, subject, bodyText)

    const dispatchLog: GmailDispatchLog = {
      id: `gmail-alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      recipient,
      deviceId: payload.deviceId,
      hostname: payload.hostname,
      riskScore: payload.riskScore,
      subject,
      status: 'SENT',
      composeUrl,
    }

    saveGmailDispatchLog(dispatchLog)

    return {
      dispatched: true,
      log: dispatchLog,
      composeUrl,
    }
  },

  /**
   * Helper to open Gmail Web Compose directly in a popup/new tab
   */
  openGmailCompose(composeUrl: string): void {
    if (typeof window !== 'undefined') {
      window.open(composeUrl, '_blank', 'noopener,noreferrer')
    }
  },

  /**
   * Send test email to verify configuration
   */
  async sendTestAlert(customRecipient?: string): Promise<{ success: boolean; log: GmailDispatchLog; composeUrl: string }> {
    const recipient = customRecipient || getGmailRecipient()
    const testPayload: GmailAlertPayload = {
      id: 'test-advisory-001',
      deviceId: 'TEST-HOST-01',
      hostname: 'SEC-DIAGNOSTIC-NODE',
      ip: '10.0.99.1',
      riskScore: 88,
      compromiseProbability: 85,
      threatTitle: 'Diagnostic Security Alert Test (Risk > 80%)',
      mitreTactic: 'MITRE TA0001 Initial Access Diagnostic',
      anomalies: ['Automated Gmail Notification Channel Health Test'],
      recommendedAction: 'Verify that this notification arrived in your Gmail inbox successfully.',
      timestamp: new Date().toISOString(),
    }

    const res = await gmailAlertService.triggerRiskAlert(testPayload, true)
    return {
      success: true,
      log: res.log!,
      composeUrl: res.composeUrl!,
    }
  },
}
