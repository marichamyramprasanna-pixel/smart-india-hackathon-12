import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { AttackTimelineEvent } from '../types/timeline'
import { ThreatAlert } from '../types/threat'
import { demoThreats } from '../data/demo/threats'
import { trackEvent } from '../api/analytics'

export interface DemoStage {
  stageNumber: number
  title: string
  subtitle: string
  timeStr: string
  compromiseProbability: number
  networkHealth: number
  activeThreatsCount: number
  suspiciousDevicesCount: number
  device42Status: 'HEALTHY' | 'SUSPICIOUS' | 'COMPROMISED'
  device42Risk: number
  server07Status: 'HEALTHY' | 'SUSPICIOUS' | 'COMPROMISED'
  server07Risk: number
  aiAssessment: string
  anomalyContributions: { name: string; percentage: number; delta: number; impact: 'critical' | 'high' | 'medium' | 'low' }[]
  activeAlertIds: string[]
  timelineEvents: AttackTimelineEvent[]
}

const DEMO_TIMELINE_STAGES: AttackTimelineEvent[] = [
  {
    id: 'tl-step-1',
    stageNumber: 1,
    timeStr: '09:12',
    timestamp: '2026-08-21T09:12:00.000Z',
    title: 'Authentication Anomaly (Off-Hours Admin Logins)',
    category: 'AUTH_ANOMALY',
    severity: 'MEDIUM',
    deviceId: 'DEVICE-042',
    confidenceScore: 78,
    description: '14 failed Kerberos authentication attempts followed by off-hours administrative logon for mvance_adm on FIN-WS-042.',
    technicalDetails: {
      mitreTechniqueId: 'T1078.002',
      mitreTactic: 'Initial Access / Privilege Escalation',
      signatureMatch: 'Anomalous User Time Window & Brute-Force Precursor',
      observedAnomaly: 'Logon event at 09:12:04 local time outside normal 08:30-17:00 shift profile',
      baselineComparison: 'Historical auth variance z-score: +3.2',
    },
    recommendedAction: 'Audit Active Directory event ID 4624/4625 on Domain Controller DC-01.',
  },
  {
    id: 'tl-step-2',
    stageNumber: 2,
    timeStr: '09:14',
    timestamp: '2026-08-21T09:14:00.000Z',
    title: 'DNS DGA Anomaly (Shannon Entropy 4.88)',
    category: 'DNS_DGA',
    severity: 'HIGH',
    deviceId: 'DEVICE-042',
    confidenceScore: 88,
    description: 'Spike of 342 queries/min to algorithmically generated pseudorandom domains (*.tunnel-c2.biz) resolving to bulletproof ASN.',
    technicalDetails: {
      mitreTechniqueId: 'T1568.002',
      mitreTactic: 'Command and Control',
      signatureMatch: 'High Shannon Entropy Algorithmically Generated Domain (DGA)',
      observedAnomaly: 'Shannon entropy 4.88 on TXT/A query subdomains',
      baselineComparison: 'Workstation average domain entropy baseline: 1.90',
    },
    recommendedAction: 'Sinkhole resolving names on internal DNS servers and capture query payloads.',
  },
  {
    id: 'tl-step-3',
    stageNumber: 3,
    timeStr: '09:17',
    timestamp: '2026-08-21T09:17:00.000Z',
    title: 'Suspicious External Connection Established',
    category: 'EXTERNAL_CONNECT',
    severity: 'HIGH',
    deviceId: 'DEVICE-042',
    targetEntity: '185.220.101.5:443',
    confidenceScore: 90,
    description: 'Outbound direct TLS connection to unclassified foreign IP 185.220.101.5 with self-signed certificate and high TLS fingerprint entropy.',
    technicalDetails: {
      mitreTechniqueId: 'T1573.002',
      mitreTactic: 'Command and Control',
      signatureMatch: 'Encrypted Channel with Untrusted TLS Certificate',
      observedAnomaly: 'JA3/JA4 fingerprint matches known Cobalt Strike / Sliver agent profiles',
      baselineComparison: 'Zero historical connections from subnet 10.0.4.0/24 to ASN 49302',
    },
    recommendedAction: 'Inject drop rule on perimeter firewall FW-01 for destination 185.220.101.5.',
  },
  {
    id: 'tl-step-4',
    stageNumber: 4,
    timeStr: '09:19',
    timestamp: '2026-08-21T09:19:00.000Z',
    title: 'Beaconing Pattern Detected (30.02s Interval)',
    category: 'BEACONING',
    severity: 'CRITICAL',
    deviceId: 'DEVICE-042',
    confidenceScore: 94,
    description: 'Deterministic outbound telemetry heartbeat packets sent exactly every 30.02 seconds with 0.4% jitter variance.',
    technicalDetails: {
      mitreTechniqueId: 'T1071.001',
      mitreTactic: 'Command and Control',
      signatureMatch: 'Synchronized Low-Jitter C2 Beacon Cadence',
      observedAnomaly: 'Standard deviation of packet intervals < 0.12 seconds across 40 continuous samples',
      baselineComparison: 'Human web browsing has jitter variance > 65%',
    },
    recommendedAction: 'Quarantine host DEVICE-042 to prevent interactive remote shell tasking.',
  },
  {
    id: 'tl-step-5',
    stageNumber: 5,
    timeStr: '09:21',
    timestamp: '2026-08-21T09:21:00.000Z',
    title: 'Outbound Data Transfer Anomaly (4.8 GB Exfiltration)',
    category: 'DATA_EXFIL',
    severity: 'CRITICAL',
    deviceId: 'DEVICE-042',
    confidenceScore: 95,
    description: 'Large encrypted outbound payload burst (4.8 GB) transferred over port 8443 in 120 seconds.',
    technicalDetails: {
      mitreTechniqueId: 'T1048.003',
      mitreTactic: 'Exfiltration',
      signatureMatch: 'Volumetric Egress Anomaly Over Encrypted Protocol',
      observedAnomaly: '32 MB/s continuous egress burst from endpoint with 50 MB total daily baseline',
      baselineComparison: 'Outbound volume exceeds 30-day baseline by 2,400%',
    },
    recommendedAction: 'Terminate active TCP sessions on firewall and capture egress flow netflow records.',
  },
  {
    id: 'tl-step-6',
    stageNumber: 6,
    timeStr: '09:23',
    timestamp: '2026-08-21T09:23:00.000Z',
    title: 'Lateral Movement Staging to Core Database (SERVER-07)',
    category: 'LATERAL_MOVEMENT',
    severity: 'CRITICAL',
    deviceId: 'DEVICE-042',
    targetEntity: 'SERVER-07 (DB-CORE-07:445)',
    confidenceScore: 96,
    description: 'Pass-the-hash SMB/RPC connection initiated from compromised host DEVICE-042 directly targeting production database server DB-CORE-07.',
    technicalDetails: {
      mitreTechniqueId: 'T1021.002',
      mitreTactic: 'Lateral Movement',
      signatureMatch: 'Cross-VLAN Unauthorized Administrative SMB Session',
      observedAnomaly: 'Finance endpoint requesting admin pipe on core database server DB-CORE-07',
      baselineComparison: 'Zero historical SMB traffic between Finance VLAN and Core DB VLAN',
    },
    recommendedAction: 'Enforce immediate micro-segmentation isolation between Finance VLAN and Core Database VLAN.',
  },
  {
    id: 'tl-step-7',
    stageNumber: 7,
    timeStr: '09:25',
    timestamp: '2026-08-21T09:25:00.000Z',
    title: 'High Probability of Host Compromise Flagged (94%)',
    category: 'COMPROMISE_FLAG',
    severity: 'CRITICAL',
    deviceId: 'DEVICE-042',
    confidenceScore: 96.4,
    description: 'SentinelX correlation engine confirmed multi-vector compromise. Automated incident INC-2026-0842 generated for SOC dispatch.',
    technicalDetails: {
      mitreTechniqueId: 'T1071 / T1021 / T1048',
      mitreTactic: 'Multi-Stage Intrusion',
      signatureMatch: 'Behavioral Correlation Convergence across 6 Vectors',
      observedAnomaly: 'Composite compromise probability reached 94% with 96.4% calibrated model confidence',
      baselineComparison: 'Multi-modal divergence z-score: +8.4 across all monitored sensor streams',
    },
    recommendedAction: 'Execute full enterprise containment playbook: isolate DEVICE-042, block C2 IP, rotate credentials.',
  }
]

export const DEMO_STAGES_DATA: DemoStage[] = [
  // Stage 0: Clean Baseline
  {
    stageNumber: 0,
    title: 'Baseline State (Protected)',
    subtitle: 'All network telemetry operating within normal statistical baseline distributions.',
    timeStr: '09:00',
    compromiseProbability: 18,
    networkHealth: 98.7,
    activeThreatsCount: 0,
    suspiciousDevicesCount: 0,
    device42Status: 'HEALTHY',
    device42Risk: 14,
    server07Status: 'HEALTHY',
    server07Risk: 10,
    aiAssessment: 'The network and all monitored endpoints operate in full alignment with historical behavioral baselines.',
    anomalyContributions: [
      { name: 'DNS Regular Resolution', percentage: 4, delta: 4, impact: 'low' },
      { name: 'Normal Workstation Egress', percentage: 3, delta: 3, impact: 'low' },
      { name: 'Standard Authentication Cadence', percentage: 3, delta: 3, impact: 'low' },
    ],
    activeAlertIds: [],
    timelineEvents: [],
  },

  // Stage 1: Auth Anomaly
  {
    stageNumber: 1,
    title: 'Stage 1: Authentication Anomaly',
    subtitle: 'Off-hours administrative Kerberos ticket request detected on FIN-WS-042.',
    timeStr: '09:12',
    compromiseProbability: 34,
    networkHealth: 95.2,
    activeThreatsCount: 1,
    suspiciousDevicesCount: 1,
    device42Status: 'SUSPICIOUS',
    device42Risk: 42,
    server07Status: 'HEALTHY',
    server07Risk: 10,
    aiAssessment: 'Elevated anomaly detected in authentication timing for user mvance_adm on DEVICE-042.',
    anomalyContributions: [
      { name: 'Authentication Timing Anomaly', percentage: 18, delta: 18, impact: 'high' },
      { name: 'Outbound Traffic Variance', percentage: 6, delta: 6, impact: 'low' },
      { name: 'DNS Activity', percentage: 4, delta: 4, impact: 'low' },
    ],
    activeAlertIds: ['AL-2038'],
    timelineEvents: DEMO_TIMELINE_STAGES.slice(0, 1),
  },

  // Stage 2: DNS Anomaly
  {
    stageNumber: 2,
    title: 'Stage 2: DNS DGA Anomaly',
    subtitle: 'High Shannon entropy domain generation algorithm (DGA) query flood detected.',
    timeStr: '09:14',
    compromiseProbability: 58,
    networkHealth: 91.4,
    activeThreatsCount: 1,
    suspiciousDevicesCount: 1,
    device42Status: 'SUSPICIOUS',
    device42Risk: 64,
    server07Status: 'HEALTHY',
    server07Risk: 10,
    aiAssessment: 'Significant deviation in DNS query entropy (4.88) indicating dynamic adversary C2 tunneling.',
    anomalyContributions: [
      { name: 'Abnormal DNS Behaviour', percentage: 31, delta: 31, impact: 'critical' },
      { name: 'Authentication Anomaly', percentage: 18, delta: 18, impact: 'high' },
      { name: 'Outbound Flow Variance', percentage: 8, delta: 8, impact: 'medium' },
    ],
    activeAlertIds: ['AL-2038', 'AL-2041'],
    timelineEvents: DEMO_TIMELINE_STAGES.slice(0, 2),
  },

  // Stage 3: Suspicious External Connect
  {
    stageNumber: 3,
    title: 'Stage 3: Suspicious External Connection',
    subtitle: 'Encrypted channel established to unclassified foreign IP 185.220.101.5.',
    timeStr: '09:17',
    compromiseProbability: 72,
    networkHealth: 88.0,
    activeThreatsCount: 2,
    suspiciousDevicesCount: 1,
    device42Status: 'SUSPICIOUS',
    device42Risk: 76,
    server07Status: 'HEALTHY',
    server07Risk: 12,
    aiAssessment: 'Direct encrypted session established to bulletproof infrastructure without domain reputation.',
    anomalyContributions: [
      { name: 'Abnormal DNS Behaviour', percentage: 31, delta: 31, impact: 'critical' },
      { name: 'Suspicious External Connection', percentage: 20, delta: 20, impact: 'high' },
      { name: 'Authentication Anomaly', percentage: 18, delta: 18, impact: 'high' },
    ],
    activeAlertIds: ['AL-2038', 'AL-2041'],
    timelineEvents: DEMO_TIMELINE_STAGES.slice(0, 3),
  },

  // Stage 4: Beaconing Detected
  {
    stageNumber: 4,
    title: 'Stage 4: C2 Beaconing Detected',
    subtitle: 'Periodic zero-jitter outbound heartbeat pattern confirmed at 30.02s intervals.',
    timeStr: '09:19',
    compromiseProbability: 86,
    networkHealth: 82.5,
    activeThreatsCount: 2,
    suspiciousDevicesCount: 1,
    device42Status: 'COMPROMISED',
    device42Risk: 88,
    server07Status: 'HEALTHY',
    server07Risk: 14,
    aiAssessment: 'Deterministic 30.02s beaconing pattern matches Cobalt Strike / Sliver C2 agent.',
    anomalyContributions: [
      { name: 'Abnormal DNS Behaviour', percentage: 31, delta: 31, impact: 'critical' },
      { name: 'Beaconing Cadence', percentage: 22, delta: 22, impact: 'high' },
      { name: 'Authentication Anomaly', percentage: 18, delta: 18, impact: 'high' },
      { name: 'Outbound Traffic', percentage: 12, delta: 12, impact: 'medium' },
    ],
    activeAlertIds: ['AL-2038', 'AL-2041'],
    timelineEvents: DEMO_TIMELINE_STAGES.slice(0, 4),
  },

  // Stage 5: Data Transfer Anomaly
  {
    stageNumber: 5,
    title: 'Stage 5: Data Transfer Anomaly (Exfiltration)',
    subtitle: 'Sudden 4.8 GB outbound data burst exceeding daily baseline by 2,400%.',
    timeStr: '09:21',
    compromiseProbability: 92,
    networkHealth: 75.0,
    activeThreatsCount: 3,
    suspiciousDevicesCount: 2,
    device42Status: 'COMPROMISED',
    device42Risk: 93,
    server07Status: 'HEALTHY',
    server07Risk: 22,
    aiAssessment: 'Extreme outbound volumetric anomaly detected on port 8443 representing active proprietary data theft.',
    anomalyContributions: [
      { name: 'Abnormal DNS Behaviour', percentage: 31, delta: 31, impact: 'critical' },
      { name: 'Outbound Traffic Anomaly', percentage: 24, delta: 24, impact: 'critical' },
      { name: 'Authentication Anomaly', percentage: 18, delta: 18, impact: 'high' },
      { name: 'Beaconing Cadence', percentage: 14, delta: 14, impact: 'high' },
    ],
    activeAlertIds: ['AL-2038', 'AL-2041', 'AL-2042'],
    timelineEvents: DEMO_TIMELINE_STAGES.slice(0, 5),
  },

  // Stage 6: Lateral Movement
  {
    stageNumber: 6,
    title: 'Stage 6: Lateral Movement to DB-CORE-07',
    subtitle: 'Pass-the-hash SMB connection established from DEVICE-042 to SERVER-07.',
    timeStr: '09:23',
    compromiseProbability: 94,
    networkHealth: 68.4,
    activeThreatsCount: 3,
    suspiciousDevicesCount: 7,
    device42Status: 'COMPROMISED',
    device42Risk: 94,
    server07Status: 'SUSPICIOUS',
    server07Risk: 78,
    aiAssessment: 'The device behaviour significantly deviates from its learned baseline. The strongest deviations are associated with DNS activity, outbound connections, authentication timing, and unauthorized lateral movement to DB-CORE-07.',
    anomalyContributions: [
      { name: 'Abnormal DNS Behaviour', percentage: 31, delta: 31, impact: 'critical' },
      { name: 'Outbound Traffic Anomaly', percentage: 24, delta: 24, impact: 'critical' },
      { name: 'Authentication Anomaly', percentage: 18, delta: 18, impact: 'high' },
      { name: 'Beaconing Pattern', percentage: 14, delta: 14, impact: 'high' },
      { name: 'Lateral Movement', percentage: 7, delta: 7, impact: 'medium' },
    ],
    activeAlertIds: ['AL-2038', 'AL-2041', 'AL-2042', 'AL-2043'],
    timelineEvents: DEMO_TIMELINE_STAGES,
  },
]

interface DemoScenarioContextType {
  currentStageIndex: number
  currentStage: DemoStage
  isPlaying: boolean
  isDemoMode: boolean
  totalStages: number
  allStages: DemoStage[]
  threatsList: ThreatAlert[]
  setStageIndex: (index: number) => void
  nextStage: () => void
  prevStage: () => void
  startScenario: () => void
  pauseScenario: () => void
  resetScenario: () => void
  toggleAutoPlay: () => void
  triggerNotificationToast?: (msg: string) => void
}

const DemoScenarioContext = createContext<DemoScenarioContextType | undefined>(undefined)

export const DemoScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Stage 6 for immediate rich view or allow stepping from Stage 0 to 6
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(6)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  const currentStage = useMemo(() => DEMO_STAGES_DATA[currentStageIndex] || DEMO_STAGES_DATA[0], [currentStageIndex])

  const threatsList = useMemo(() => {
    return demoThreats.filter((t) => currentStage.activeAlertIds.includes(t.id))
  }, [currentStage.activeAlertIds])

  const setStageIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, DEMO_STAGES_DATA.length - 1))
    setCurrentStageIndex(clamped)
    trackEvent('demo_scenario_stage_changed', { stage: clamped })
  }, [])

  const nextStage = useCallback(() => {
    setCurrentStageIndex((prev) => {
      const next = prev < DEMO_STAGES_DATA.length - 1 ? prev + 1 : prev
      trackEvent('demo_scenario_stage_changed', { stage: next })
      return next
    })
  }, [])

  const prevStage = useCallback(() => {
    setCurrentStageIndex((prev) => {
      const next = prev > 0 ? prev - 1 : 0
      trackEvent('demo_scenario_stage_changed', { stage: next })
      return next
    })
  }, [])

  const startScenario = useCallback(() => {
    setCurrentStageIndex(0)
    setIsPlaying(true)
    trackEvent('demo_scenario_started', { mode: 'auto_play' })
  }, [])

  const pauseScenario = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const resetScenario = useCallback(() => {
    setIsPlaying(false)
    setCurrentStageIndex(0)
  }, [])

  const toggleAutoPlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  // Auto-play timer effect
  useEffect(() => {
    let timer: any = null
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStageIndex((prev) => {
          if (prev >= DEMO_STAGES_DATA.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 5000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isPlaying])

  return (
    <DemoScenarioContext.Provider
      value={{
        currentStageIndex,
        currentStage,
        isPlaying,
        isDemoMode: true,
        totalStages: DEMO_STAGES_DATA.length,
        allStages: DEMO_STAGES_DATA,
        threatsList,
        setStageIndex,
        nextStage,
        prevStage,
        startScenario,
        pauseScenario,
        resetScenario,
        toggleAutoPlay,
      }}
    >
      {children}
    </DemoScenarioContext.Provider>
  )
}

export function useDemoScenario(): DemoScenarioContextType {
  const context = useContext(DemoScenarioContext)
  if (!context) {
    throw new Error('useDemoScenario must be used within a DemoScenarioProvider')
  }
  return context
}
