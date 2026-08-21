import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
})

const settingsSchema = z.object({
  analystName: z.string().min(2, 'Analyst name must be at least 2 characters'),
  anomalyThreshold: z.number().min(50).max(99),
  dgaEntropyThreshold: z.number().min(2.0).max(5.0),
  autoQuarantineCritical: z.boolean(),
})

describe('Form Validation Zod Schemas', () => {
  it('validates correct email addresses', () => {
    const valid = emailSchema.safeParse({ email: 'analyst@sentinelx.security' })
    expect(valid.success).toBe(true)
  })

  it('rejects invalid email formats', () => {
    const invalid = emailSchema.safeParse({ email: 'not-an-email' })
    expect(invalid.success).toBe(false)
  })

  it('validates settings constraints', () => {
    const validSettings = settingsSchema.safeParse({
      analystName: 'Agent Alex Rivera',
      anomalyThreshold: 85,
      dgaEntropyThreshold: 3.5,
      autoQuarantineCritical: true,
    })
    expect(validSettings.success).toBe(true)

    const invalidSettings = settingsSchema.safeParse({
      analystName: 'A',
      anomalyThreshold: 120, // out of range
      dgaEntropyThreshold: 1.0,
      autoQuarantineCritical: true,
    })
    expect(invalidSettings.success).toBe(false)
  })
})
