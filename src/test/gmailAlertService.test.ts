import { describe, it, expect, beforeEach } from 'vitest'
import {
  gmailAlertService,
  buildGmailComposeUrl,
  generateSecurityAdvisoryBody,
  getGmailRecipient,
  setGmailRecipient,
  GmailAlertPayload,
} from '../services/gmailAlertService'

describe('Gmail Alert Service & >80% Risk Escalation', () => {
  beforeEach(() => {
    try {
      localStorage.clear()
    } catch {}
  })

  it('generates well-formatted Gmail web compose URL with encoded parameters', () => {
    const url = buildGmailComposeUrl('analyst@gmail.com', 'Test Alert', 'Test Body')
    expect(url).toContain('https://mail.google.com/mail/?view=cm&fs=1')
    expect(url).toContain('to=analyst%40gmail.com')
    expect(url).toContain('su=Test%20Alert')
    expect(url).toContain('body=Test%20Body')
  })

  it('formats comprehensive security advisory email body with MITRE details', () => {
    const payload: GmailAlertPayload = {
      id: 'alert-01',
      deviceId: 'DEVICE-TEST-99',
      hostname: 'SEC-CORE-99',
      ip: '10.0.99.42',
      riskScore: 92,
      compromiseProbability: 90,
      threatTitle: 'C2 Beaconing Pattern',
      mitreTactic: 'MITRE TA0011 Command and Control',
      anomalies: ['Shannon entropy 4.8', 'Encrypted TLS heartbeat'],
      recommendedAction: 'Quarantine host via 802.1X',
      timestamp: '2026-08-25T10:00:00.000Z',
    }

    const body = generateSecurityAdvisoryBody(payload)
    expect(body).toContain('SENTINEL-X AUTONOMOUS SOC')
    expect(body).toContain('DEVICE-TEST-99')
    expect(body).toContain('92/100 [CRITICAL]')
    expect(body).toContain('MITRE TA0011 Command and Control')
    expect(body).toContain('Shannon entropy 4.8')
    expect(body).toContain('Quarantine host via 802.1X')
  })

  it('dispatches Gmail alert when risk is above 80%', async () => {
    const payload: GmailAlertPayload = {
      id: 'high-risk-01',
      deviceId: 'DEVICE-HIGH-01',
      hostname: 'HIGH-RISK-HOST',
      ip: '10.0.1.50',
      riskScore: 88,
      compromiseProbability: 85,
      threatTitle: 'Ransomware Pre-Execution Sweep',
      mitreTactic: 'MITRE TA0040 Impact',
      anomalies: ['Mass file rename probe'],
      recommendedAction: 'Isolate host',
      timestamp: new Date().toISOString(),
    }

    const res = await gmailAlertService.triggerRiskAlert(payload, true)
    expect(res.dispatched).toBe(true)
    expect(res.composeUrl).toBeDefined()
    expect(res.log?.riskScore).toBe(88)
    expect(res.log?.deviceId).toBe('DEVICE-HIGH-01')
  })

  it('ignores threats below 80% risk threshold', async () => {
    const lowRiskPayload: GmailAlertPayload = {
      id: 'low-risk-01',
      deviceId: 'DEVICE-LOW-01',
      hostname: 'LOW-RISK-HOST',
      ip: '10.0.1.51',
      riskScore: 45,
      compromiseProbability: 40,
      threatTitle: 'Minor Port Scan',
      mitreTactic: 'MITRE Discovery',
      anomalies: ['Single port probe'],
      recommendedAction: 'Monitor',
      timestamp: new Date().toISOString(),
    }

    const res = await gmailAlertService.triggerRiskAlert(lowRiskPayload, true)
    expect(res.dispatched).toBe(false)
    expect(res.reason).toContain('below 80%')
  })

  it('allows updating and persisting custom recipient Gmail address', () => {
    setGmailRecipient('custom-soc-lead@gmail.com')
    expect(getGmailRecipient()).toBe('custom-soc-lead@gmail.com')
  })
})
