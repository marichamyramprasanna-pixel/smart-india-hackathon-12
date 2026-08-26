import { describe, it, expect, beforeEach } from 'vitest'
import { sanitizeHtml, sanitizeUrl, isValidIPv4, isValidMacAddress, ClientRateLimiter } from '../utils/sanitize'
import { auditLogService, getCryptographicLedger } from '../services/auditLogService'

describe('Platform Security & Input Hardening', () => {
  it('escapes dangerous HTML characters to prevent XSS', () => {
    const raw = '<script>alert("xss")</script><img src=x onerror=alert(1)>'
    const clean = sanitizeHtml(raw)
    expect(clean).not.toContain('<script>')
    expect(clean).toContain('&lt;script&gt;')
    expect(clean).toContain('&quot;')
  })

  it('sanitizes and blocks javascript: and dangerous URIs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('about:blank')
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('about:blank')
    expect(sanitizeUrl('https://example.com/api')).toBe('https://example.com/api')
    expect(sanitizeUrl('/devices/DEV-001')).toBe('/devices/DEV-001')
  })

  it('validates IPv4 address strict integrity', () => {
    expect(isValidIPv4('192.168.1.1')).toBe(true)
    expect(isValidIPv4('10.0.4.42')).toBe(true)
    expect(isValidIPv4('256.0.0.1')).toBe(false)
    expect(isValidIPv4('192.168.1')).toBe(false)
    expect(isValidIPv4('not-an-ip')).toBe(false)
  })

  it('validates IEEE 802.3 MAC addresses', () => {
    expect(isValidMacAddress('00:1A:2B:3C:4D:5E')).toBe(true)
    expect(isValidMacAddress('00-1a-2b-3c-4d-5e')).toBe(true)
    expect(isValidMacAddress('00:1A:2B:3C:4D')).toBe(false)
    expect(isValidMacAddress('invalid-mac')).toBe(false)
  })

  it('enforces client-side rate limiting on API flood', () => {
    const limiter = new ClientRateLimiter(3, 5000)
    expect(limiter.canExecute()).toBe(true)
    expect(limiter.canExecute()).toBe(true)
    expect(limiter.canExecute()).toBe(true)
    expect(limiter.canExecute()).toBe(false) // Flooded
  })
})

describe('SHA-256 Cryptographic Audit Ledger', () => {
  beforeEach(() => {
    auditLogService.clearLedger()
  })

  it('records actions and maintains valid hash chain', async () => {
    await auditLogService.recordAction('QUARANTINE_DEVICE', 'DEV-001', 'Quarantined due to ransomware')
    await auditLogService.recordAction('BLOCK_IP', '185.220.101.5', 'Blocked C2 host')

    const ledger = getCryptographicLedger()
    expect(ledger.length).toBe(2)
    expect(ledger[0].hash).toBeDefined()
    expect(ledger[1].previousHash).toBe(ledger[0].hash)

    const verification = await auditLogService.verifyChainIntegrity()
    expect(verification.valid).toBe(true)
    expect(verification.totalBlocks).toBe(2)
  })
})

describe('System Action Event Bus & AI Auto-Update', () => {
  it('emits system events and dispatches action without crashing', async () => {
    const { emitSystemAction } = await import('../services/systemEventBus')
    expect(() => {
      emitSystemAction({
        type: 'DEVICE_ISOLATED',
        targetId: 'DEV-TEST-99',
        targetName: 'Test Machine',
        details: '802.1X Isolation',
      })
    }).not.toThrow()
  })
})
