import { describe, it, expect } from 'vitest'
import { demoThreats } from '../data/demo/threats'

describe('Threat Management Filters', () => {
  it('contains AL-2041 critical command & control alert', () => {
    const al2041 = demoThreats.find((t) => t.alertCode === 'AL-2041')
    expect(al2041).toBeDefined()
    expect(al2041?.severity).toBe('CRITICAL')
    expect(al2041?.deviceId).toBe('SERVER-99')
    expect(al2041?.confidenceScore).toBe(94)
  })

  it('filters threats by severity accurately', () => {
    const criticals = demoThreats.filter((t) => t.severity === 'CRITICAL')
    expect(criticals.length).toBeGreaterThanOrEqual(2)
    criticals.forEach((t) => expect(t.severity).toBe('CRITICAL'))
  })

  it('filters threats by device ID', () => {
    const server99Threats = demoThreats.filter((t) => t.deviceId === 'SERVER-99')
    expect(server99Threats.length).toBeGreaterThanOrEqual(2)
  })
})
