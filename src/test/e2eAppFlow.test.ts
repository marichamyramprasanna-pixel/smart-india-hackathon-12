import { describe, it, expect, beforeEach } from 'vitest'
import { deviceService, getDeletedDevices } from '../services/deviceService'
import { generateDynamic3DTopology } from '../utils/topologyGenerator'
import {
  gmailAlertService,
  getGmailRecipient,
  setGmailRecipient,
  getGmailDispatchLogs,
  DEFAULT_TARGET_GMAIL,
} from '../services/gmailAlertService'
import { calculateDeviceRisk, calculateNetworkRisk, RiskFactor } from '../utils/riskCalculator'
import { DeviceTelemetry } from '../types/device'

describe('SentinelX Complete End-to-End (E2E) Application Workflow Test Suite', () => {
  beforeEach(async () => {
    try {
      localStorage.clear()
    } catch {}
    // Reset to clean slate
    await deviceService.deleteAllDevices()
  })

  // ══════════════════════════════════════════════════════════════════════
  // JOURNEY 1: CLEAN INVENTORY & CUSTOM DEVICE ONBOARDING
  // ══════════════════════════════════════════════════════════════════════
  it('E2E Journey 1: starts with clean inventory, registers new custom endpoints, and validates search filtering', async () => {
    // 1. Initial state is clean & empty
    const initial = await deviceService.getDevices()
    expect(initial.data).toHaveLength(0)

    // 2. Register Endpoint 1 (Production Server)
    const serverDev = await deviceService.createDevice({
      id: 'DEV-SRV-01',
      hostname: 'Core-Database-Primary.internal',
      ip_address: '10.0.1.15',
      device_type: 'Server',
      department: 'Database Infrastructure',
      owner: 'Lead DBA Team',
      status: 'HEALTHY',
      risk_score: 10,
      compromise_probability: 5,
    })
    expect(serverDev.error).toBeNull()
    expect(serverDev.data?.id).toBe('DEV-SRV-01')

    // 3. Register Endpoint 2 (Finance Workstation)
    const wsDev = await deviceService.createDevice({
      id: 'DEV-WS-02',
      hostname: 'Fin-Workstation-02.internal',
      ip_address: '10.0.2.22',
      device_type: 'Workstation',
      department: 'Finance Operations',
      owner: 'Alice Johnson',
      status: 'HEALTHY',
      risk_score: 15,
      compromise_probability: 8,
    })
    expect(wsDev.error).toBeNull()

    // 4. Verify both devices are now active
    const list = await deviceService.getDevices()
    expect(list.data.some((d) => d.id === 'DEV-SRV-01')).toBe(true)
    expect(list.data.some((d) => d.id === 'DEV-WS-02')).toBe(true)

    // 5. Test search filter
    const searchRes = await deviceService.getDevices({ search: 'Database' })
    expect(searchRes.data.some((d) => d.id === 'DEV-SRV-01')).toBe(true)
  })

  // ══════════════════════════════════════════════════════════════════════
  // JOURNEY 2: 3D TOPOLOGY GENERATION & STANDBY REACTIVITY
  // ══════════════════════════════════════════════════════════════════════
  it('E2E Journey 2: 3D model starts in Standby (0 nodes), constructs dynamically when devices are added, and renders quarantine cages on isolation', async () => {
    // 1. When devices = [], 3D topology is blank (Standby Mode)
    const standbyTopology = generateDynamic3DTopology([])
    expect(standbyTopology.nodes).toHaveLength(0)
    expect(standbyTopology.links).toHaveLength(0)

    // 2. Add an active device
    await deviceService.createDevice({
      id: 'DEV-IOT-09',
      hostname: 'Lobby-Surveillance-09',
      ip_address: '10.0.8.109',
      device_type: 'IoT',
      department: 'Building Security',
      owner: 'Facilities Team',
      status: 'HEALTHY',
      risk_score: 5,
      compromise_probability: 2,
    })

    const { data: allDevices } = await deviceService.getDevices()

    // 3. 3D topology now builds Core Router + Firewall + Device
    const activeTopology = generateDynamic3DTopology(allDevices)
    expect(activeTopology.nodes.length).toBeGreaterThanOrEqual(3)
    expect(activeTopology.nodes.some((n) => n.id === 'node-core-router')).toBe(true)
    expect(activeTopology.nodes.some((n) => n.id === 'DEV-IOT-09')).toBe(true)

    // 4. Quarantine Device (802.1X Isolation)
    const isolatedMap = {
      'DEV-IOT-09': {
        deviceId: 'DEV-IOT-09',
        hostname: 'Lobby-Surveillance-09',
        reason: 'Unauthorized outbound RTSP sweep',
      },
    }
    const quarantinedTopology = generateDynamic3DTopology(allDevices, isolatedMap)
    const iotNode = quarantinedTopology.nodes.find((n) => n.id === 'DEV-IOT-09')
    expect(iotNode?.status).toBe('ISOLATED')
    expect(iotNode?.isIsolated).toBe(true)

    // Link to Core Router should be severed (status: 'blocked')
    const iotLink = quarantinedTopology.links.find((l) => l.source === 'DEV-IOT-09')
    expect(iotLink?.status).toBe('blocked')
    expect(iotLink?.trafficSpeed).toBe(0)
  })

  // ══════════════════════════════════════════════════════════════════════
  // JOURNEY 3: AUTOMATED GMAIL EMERGENCY ESCALATION (>80% RISK)
  // ══════════════════════════════════════════════════════════════════════
  it('E2E Journey 3: verifies automated emergency Gmail dispatch to ramprasannamarichamy31@gmail.com on >80% risk', async () => {
    // 1. Confirm default recipient is set to ramprasannamarichamy31@gmail.com
    expect(getGmailRecipient()).toBe(DEFAULT_TARGET_GMAIL)

    // 2. High-Risk Threat Alert (>80%)
    const highRiskPayload = {
      id: 'e2e-alert-01',
      deviceId: 'DEV-PROD-APP-01',
      hostname: 'App-Production-Cluster',
      ip: '10.0.3.100',
      riskScore: 94,
      compromiseProbability: 92,
      threatTitle: 'Active Data Exfiltration Burst',
      mitreTactic: 'MITRE TA0010 Exfiltration',
      anomalies: ['4.8 GB compressed payload sent to unclassified external IP'],
      recommendedAction: 'Isolate host immediately and rotate SSL keys',
      timestamp: new Date().toISOString(),
    }

    const dispatchResult = await gmailAlertService.triggerRiskAlert(highRiskPayload, true, false)
    expect(dispatchResult.dispatched).toBe(true)
    expect(dispatchResult.log?.recipient).toBe('ramprasannamarichamy31@gmail.com')
    expect(dispatchResult.log?.riskScore).toBe(94)
    expect(dispatchResult.composeUrl).toContain('ramprasannamarichamy31%40gmail.com')

    // 3. Verify audit log history
    const logs = getGmailDispatchLogs()
    expect(logs.length).toBeGreaterThanOrEqual(1)
    expect(logs.some((l) => l.deviceId === 'DEV-PROD-APP-01')).toBe(true)
  })

  // ══════════════════════════════════════════════════════════════════════
  // JOURNEY 4: TOMBSTONE ARCHIVE, DELETION & 1-CLICK RESTORATION
  // ══════════════════════════════════════════════════════════════════════
  it('E2E Journey 4: decommissions active device to tombstone vault, and restores back to active inventory in 1 click', async () => {
    // 1. Register device
    await deviceService.createDevice({
      id: 'DEV-DECOM-99',
      hostname: 'Legacy-Print-Server',
      ip_address: '10.0.5.99',
      device_type: 'Server',
      department: 'Office IT',
      owner: 'Helpdesk',
      status: 'HEALTHY',
    })

    // 2. Decommission device
    await deviceService.deleteDevice('DEV-DECOM-99', 'Hardware EOL retirement')

    // Active inventory should not contain DEV-DECOM-99
    const activeList = await deviceService.getDevices()
    expect(activeList.data.some((d) => d.id === 'DEV-DECOM-99')).toBe(false)

    // Tombstone vault should contain DEV-DECOM-99
    const tombVault = getDeletedDevices()
    const targetTomb = tombVault.find((d) => d.id === 'DEV-DECOM-99')
    expect(targetTomb).toBeDefined()
    expect(targetTomb?.reason).toBe('Hardware EOL retirement')

    // 3. 1-Click Restore device back to active fleet
    const restoreRes = await deviceService.restoreDevice(targetTomb!)
    expect(restoreRes.success).toBe(true)

    // Verify it is back in active inventory
    const restoredActive = await deviceService.getDevices()
    expect(restoredActive.data.some((d) => d.id === 'DEV-DECOM-99')).toBe(true)
  })

  // ══════════════════════════════════════════════════════════════════════
  // JOURNEY 5: BAYESIAN RISK CALCULATION ENGINE
  // ══════════════════════════════════════════════════════════════════════
  it('E2E Journey 5: calculates multivariate risk scores based on telemetry anomalies', () => {
    const criticalFactors: RiskFactor[] = [
      {
        name: 'DNS Shannon Entropy',
        weight: 0.4,
        observedScore: 95,
        baselineScore: 15,
        description: 'DGA query storm',
      },
      {
        name: 'Exfiltration Volume',
        weight: 0.35,
        observedScore: 90,
        baselineScore: 10,
        description: 'Large encrypted burst',
      },
      {
        name: 'Failed Logins',
        weight: 0.25,
        observedScore: 85,
        baselineScore: 5,
        description: 'Brute-force credential stuffing',
      },
    ]

    const criticalAnalysis = calculateNetworkRisk(criticalFactors, 0.4)
    expect(criticalAnalysis.overallRisk).toBeGreaterThanOrEqual(80)
    expect(criticalAnalysis.status).toBe('CRITICAL')

    const normalAnalysis = calculateNetworkRisk([], 0.15)
    expect(normalAnalysis.overallRisk).toBeLessThan(30)
    expect(normalAnalysis.status).toBe('PROTECTED')
  })
})
