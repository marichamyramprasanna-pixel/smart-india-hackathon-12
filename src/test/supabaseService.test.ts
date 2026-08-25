import { describe, it, expect } from 'vitest'
import { deviceCreateSchema, deviceService } from '../services/deviceService'
import { handleSupabaseError } from '../lib/supabaseError'
import { authService } from '../services/authService'

describe('Supabase Service Layer & Validation', () => {
  it('validates correct device creation input', () => {
    const valid = deviceCreateSchema.safeParse({
      id: 'DEVICE-999',
      hostname: 'SEC-TEST-999.internal.corp',
      ip_address: '10.0.99.99',
      device_type: 'Workstation',
      department: 'Security Operations',
      owner: 'Test Analyst',
      status: 'HEALTHY',
      risk_score: 15,
      compromise_probability: 5,
    })

    expect(valid.success).toBe(true)
  })

  it('rejects invalid IPv4 address format', () => {
    const invalid = deviceCreateSchema.safeParse({
      id: 'DEVICE-999',
      hostname: 'SEC-TEST-999.internal.corp',
      ip_address: '999.999.999.999.999', // Invalid IP
      device_type: 'Workstation',
      department: 'Security Operations',
      owner: 'Test Analyst',
    })

    expect(invalid.success).toBe(false)
  })

  it('rejects out-of-bounds risk scores', () => {
    const invalidScore = deviceCreateSchema.safeParse({
      id: 'DEVICE-999',
      hostname: 'SEC-TEST-999.internal.corp',
      ip_address: '10.0.99.99',
      risk_score: 150, // Max is 100
      department: 'Security Operations',
      owner: 'Test Analyst',
    })

    expect(invalidScore.success).toBe(false)
  })

  it('transforms PostgreSQL RLS violation (42501) into user-friendly message', () => {
    const error = handleSupabaseError({
      code: '42501',
      message: 'new row violates row-level security policy for table "devices"',
    })

    expect(error.code).toBe('FORBIDDEN')
    expect(error.status).toBe(403)
    expect(error.message).toContain('authorization')
  })

  it('transforms duplicate key conflict (23505) into conflict message', () => {
    const error = handleSupabaseError({
      code: '23505',
      message: 'duplicate key value violates unique constraint "threat_alerts_alert_code_key"',
    })

    expect(error.code).toBe('CONFLICT')
    expect(error.status).toBe(409)
    expect(error.message).toContain('already exists')
  })

  it('creates and retrieves custom devices cleanly', async () => {
    const createRes = await deviceService.createDevice({
      id: 'DEVICE-TEST-01',
      hostname: 'Test-Host-01',
      ip_address: '10.0.1.1',
      device_type: 'Workstation',
      department: 'QA',
      owner: 'Test User',
    })
    expect(createRes.error).toBeNull()
    const res = await deviceService.getDevices()
    expect(res.data.some((d) => d.id === 'DEVICE-TEST-01')).toBe(true)
  })

  it('handles getSession() gracefully with zero unhandled errors', async () => {
    const sessionRes = await authService.getSession()
    expect(sessionRes.error).toBeNull()
  })
})
