import { describe, it, expect } from 'vitest'
import { DEMO_STAGES_DATA } from '../context/DemoScenarioContext'

describe('Demo Scenario State Machine', () => {
  it('has 7 defined progression stages from baseline to lateral compromise', () => {
    expect(DEMO_STAGES_DATA.length).toBe(7)
  })

  it('stage 0 starts with protected baseline risk', () => {
    const stage0 = DEMO_STAGES_DATA[0]
    expect(stage0.compromiseProbability).toBe(18)
    expect(stage0.device42Status).toBe('HEALTHY')
    expect(stage0.activeThreatsCount).toBe(0)
  })

  it('stage 6 escalates to 94% compromise probability with 7 correlated timeline events', () => {
    const stage6 = DEMO_STAGES_DATA[6]
    expect(stage6.compromiseProbability).toBe(94)
    expect(stage6.device42Status).toBe('COMPROMISED')
    expect(stage6.timelineEvents.length).toBe(7)
    expect(stage6.activeAlertIds).toContain('AL-2041')
  })
})
