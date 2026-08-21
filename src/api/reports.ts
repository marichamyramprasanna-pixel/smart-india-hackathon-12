import { IncidentReport } from '../types/report'

export const defaultIncidentReport: IncidentReport = {
  id: 'INC-2026-0842',
  reportNumber: 'SX-INC-2026-0842',
  generatedAt: new Date().toISOString(),
  title: 'Incident Investigation Report: Multi-Stage C2 Compromise & Data Exfiltration on Host DEVICE-042',
  incidentSeverity: 'CRITICAL',
  executiveSummary: 'SentinelX detected a coordinated multi-stage cyber compromise originating on finance workstation FIN-WS-042 (10.0.4.42). Anomaly correlation identified off-hours credential misuse, high-entropy DGA domain generation, periodic encrypted beaconing to external IP 185.220.101.5, 4.8 GB of outbound payload exfiltration, and unauthorized lateral movement staging targeting production database DB-CORE-07. Probabilistic compromise score reached 94% with 96.4% model confidence.',
  affectedDevices: [
    {
      deviceId: 'DEVICE-042',
      hostname: 'FIN-WS-042.internal.corp',
      ip: '10.0.4.42',
      role: 'Corporate Finance Workstation',
      compromiseProbability: 94,
      status: 'Quarantine Pending',
    },
    {
      deviceId: 'SERVER-07',
      hostname: 'DB-CORE-07.internal.corp',
      ip: '10.0.2.7',
      role: 'Production Core Database',
      compromiseProbability: 76,
      status: 'Under Active Forensics',
    },
    {
      deviceId: 'DEVICE-118',
      hostname: 'ENG-LAP-118.internal.corp',
      ip: '10.0.4.118',
      role: 'Engineering DevOps Laptop',
      compromiseProbability: 58,
      status: 'Probed / Monitored',
    },
  ],
  attackTimeline: [
    { time: '09:12', phase: 'Credential Access', event: 'Authentication anomaly & off-hours Kerberos ticket request', impact: 'Elevated local user privileges' },
    { time: '09:14', phase: 'Command & Control', event: 'DNS DGA anomaly with Shannon entropy 4.88', impact: 'Resolved dynamic adversary C2 domain' },
    { time: '09:17', phase: 'Connection Staging', event: 'External TLS connection established to 185.220.101.5:443', impact: 'Adversary established interactive channel' },
    { time: '09:19', phase: 'Persistence', event: 'Periodic beaconing heartbeat detected (30.02s interval)', impact: 'Persistent telemetry channel active' },
    { time: '09:21', phase: 'Exfiltration', event: 'Abnormal outbound volumetric burst (4.8 GB transferred)', impact: 'Potential loss of proprietary finance records' },
    { time: '09:23', phase: 'Lateral Movement', event: 'Pass-the-hash SMB connection initiated to DB-CORE-07', impact: 'Attempted access to core database schema' },
    { time: '09:25', phase: 'Detection & Triage', event: 'SentinelX flagged High Probability of Compromise (94%)', impact: 'Automated SOC escalation & incident workflow triggered' },
  ],
  aiFindings: [
    { category: 'Abnormal DNS Behaviour', contribution: '+31%', deviationDetails: '342 queries/min to algorithmically generated domains with Shannon entropy 4.88 vs 1.90 baseline.' },
    { category: 'Outbound Traffic Anomaly', contribution: '+24%', deviationDetails: '4.8 GB outbound encrypted stream to foreign IP, exceeding 30-day baseline by 2,400%.' },
    { category: 'Authentication Timing Anomaly', contribution: '+18%', deviationDetails: 'Administrative session created outside normal 08:30-17:00 shift profile.' },
    { category: 'C2 Beaconing Cadence', contribution: '+14%', deviationDetails: 'Zero-jitter periodic check-in at 30.02s intervals matches Cobalt Strike / Sliver profiles.' },
    { category: 'Lateral Movement Path', contribution: '+7%', deviationDetails: 'Unauthorized SMB/RPC probe to high-value database asset DB-CORE-07.' },
  ],
  technicalIoCs: [
    { type: 'IP', value: '185.220.101.5', notes: 'Command & Control Server (Bulletproof Netherlands ASN)' },
    { type: 'Domain', value: 'x9q7f-tunnel-c2.biz', notes: 'DGA DNS Resolution / Tunneling Domain' },
    { type: 'Domain', value: 'k4m9v-sync-pulse.cc', notes: 'Secondary C2 Fallback Address' },
    { type: 'Port', value: 'TCP 443 / 8443', notes: 'Encrypted C2 Channel & Exfiltration Port' },
    { type: 'Hash', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', notes: 'Dropped loader payload hash' },
  ],
  containmentStatus: 'CONTAINMENT IN PROGRESS — 802.1X Host Quarantine Recommended',
  recommendedActions: [
    'Quarantine DEVICE-042 immediately via network switch port isolation',
    'Drop all egress traffic to external IP 185.220.101.5 on perimeter firewall FW-01',
    'Sinkhole DNS domains *.tunnel-c2.biz and *.sync-pulse.cc on internal DNS resolvers',
    'Reset Kerberos credentials and rotate database service account svc_backup_db',
    'Perform disk memory dump and volatility analysis on FIN-WS-042',
    'Review database query logs on DB-CORE-07 for unauthorized SELECT statements',
  ],
  analystSignOff: {
    name: 'Agent Alex Rivera',
    role: 'Lead Cybersecurity Incident Responder (SOC US-EAST)',
    date: '2026-08-21',
  },
}

export async function fetchIncidentReport(): Promise<IncidentReport> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(defaultIncidentReport), 150)
  })
}
