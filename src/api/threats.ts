import { ThreatAlert } from '../types/threat'

export const mockThreats: ThreatAlert[] = [
  {
    id: 'AL-2041',
    alertCode: 'AL-2041',
    title: 'Possible Command & Control (C2) Activity via High-Entropy DNS & Encrypted Beaconing',
    deviceId: 'DEVICE-042',
    deviceHostname: 'FIN-WS-042.internal.corp',
    deviceIp: '10.0.4.42',
    threatCategory: 'Command & Control',
    severity: 'CRITICAL',
    confidenceScore: 94,
    compromiseProbability: 94,
    detectedAt: '2 min ago',
    status: 'INVESTIGATING',
    summary: 'DEVICE-042 is generating periodic encrypted outbound heartbeat pulses (30.02s interval) with near-zero jitter to IP 185.220.101.5 alongside high Shannon entropy DGA DNS queries.',
    indicators: [
      { type: 'Domain', value: 'x9q7f-tunnel-c2.biz (Entropy 4.88)', reputation: 'Untrusted/Dynamic C2' },
      { type: 'IP', value: '185.220.101.5:443', reputation: 'Bulletproof ASN 49302' },
      { type: 'Jitter', value: '0.4% interval variance', reputation: 'Automated Bot Beacon' },
      { type: 'Entropy', value: '4.88 Shannon Score', reputation: 'Algorithmically Generated Domain' },
    ],
    aiExplanation: 'The observed device behavior exhibits a 94% probabilistic deviation from normal finance workstation baselines. The combination of static interval beaconing and high-entropy DNS tunnel payloads matches Cobalt Strike / Sliver C2 profiles.',
    remediationSteps: [
      'Isolate DEVICE-042 immediately via network 802.1X quarantine',
      'Block outbound destination IP 185.220.101.5 on perimeter firewall FW-01',
      'Sinkhole DNS resolution for *.tunnel-c2.biz on internal resolvers',
      'Trigger memory dump & process capture on FIN-WS-042 for forensics',
    ],
    assignedAnalyst: 'Agent Alex Rivera (Lead Responder)',
  },
  {
    id: 'AL-2042',
    alertCode: 'AL-2042',
    title: 'Abnormal Outbound Data Transfer Burst (4.8 GB Exfiltration)',
    deviceId: 'DEVICE-042',
    deviceHostname: 'FIN-WS-042.internal.corp',
    deviceIp: '10.0.4.42',
    threatCategory: 'Data Exfiltration',
    severity: 'CRITICAL',
    confidenceScore: 91,
    compromiseProbability: 92,
    detectedAt: '6 min ago',
    status: 'INVESTIGATING',
    summary: 'Sudden high-throughput outbound TLS stream transmitting 4.8 GB to unclassified foreign IP, exceeding 30-day baseline by 2,400%.',
    indicators: [
      { type: 'IP', value: '185.220.101.6:8443', reputation: 'Untrusted VPS Host' },
      { type: 'Process', value: 'powershell.exe -> svchost injection', reputation: 'Suspicious Memory Allocation' },
    ],
    aiExplanation: 'Workstation baseline outbound volume averages < 50 MB/day. 4.8 GB exfiltration over port 8443 represents an extreme statistical deviation (z-score: 8.4).',
    remediationSteps: [
      'Terminate active TLS session #conn-01',
      'Review exfiltrated data egress classification',
    ],
    assignedAnalyst: 'Agent Alex Rivera',
  },
  {
    id: 'AL-2043',
    alertCode: 'AL-2043',
    title: 'Lateral Movement Staging via SMB/RPC Pass-the-Hash',
    deviceId: 'SERVER-07',
    deviceHostname: 'DB-CORE-07.internal.corp',
    deviceIp: '10.0.2.7',
    threatCategory: 'Lateral Movement',
    severity: 'HIGH',
    confidenceScore: 89,
    compromiseProbability: 78,
    detectedAt: '8 min ago',
    status: 'NEW',
    summary: 'Compromised workstation DEVICE-042 initiated abnormal admin SMB session to core production database server using elevated service account.',
    indicators: [
      { type: 'IP', value: '10.0.4.42 -> 10.0.2.7:445', reputation: 'Unauthorized Lateral Hop' },
      { type: 'Port', value: '445 (SMB) & 135 (RPC)', reputation: 'Privilege Staging' },
    ],
    aiExplanation: 'Finance workstation FIN-WS-042 has never historically initiated direct SMB connections to database server DB-CORE-07. Anomaly confidence 89%.',
    remediationSteps: [
      'Revoke Kerberos session tickets for user svc_backup_db',
      'Segment DMZ VLAN 10.0.2.0/24 from Finance VLAN 10.0.4.0/24',
    ],
    assignedAnalyst: 'Unassigned',
  },
  {
    id: 'AL-2038',
    alertCode: 'AL-2038',
    title: 'Off-Hours Administrative Authentication Spike',
    deviceId: 'DEVICE-042',
    deviceHostname: 'FIN-WS-042.internal.corp',
    deviceIp: '10.0.4.42',
    threatCategory: 'Credential Access',
    severity: 'MEDIUM',
    confidenceScore: 78,
    compromiseProbability: 64,
    detectedAt: '15 min ago',
    status: 'INVESTIGATING',
    summary: 'Multiple Kerberos ticket requests for privileged accounts originating at 09:12 local time following 14 failed NTLM attempts.',
    indicators: [
      { type: 'Process', value: 'lsass.exe memory read attempt', reputation: 'Mimikatz-like artifact' },
    ],
    aiExplanation: 'Authentication cadence deviates from user Marcus Vance normal shift profile (08:30-17:00).',
    remediationSteps: [
      'Force password reset on account mvance_adm',
      'Audit Active Directory event log ID 4624/4625',
    ],
    assignedAnalyst: 'Agent Alex Rivera',
  },
  {
    id: 'AL-2031',
    alertCode: 'AL-2031',
    title: 'Unusual Internal Port Sweep (Reconnaissance)',
    deviceId: 'DEVICE-118',
    deviceHostname: 'ENG-LAP-118.internal.corp',
    deviceIp: '10.0.4.118',
    threatCategory: 'Reconnaissance',
    severity: 'LOW',
    confidenceScore: 68,
    compromiseProbability: 42,
    detectedAt: '24 min ago',
    status: 'RESOLVED',
    summary: 'Subnet probe on ports 22, 80, 443, 8080. Verified by engineering team as scheduled internal asset discovery scan.',
    indicators: [
      { type: 'Port', value: 'SYN scan ports 22-8080', reputation: 'Approved internal scan' },
    ],
    aiExplanation: 'Traffic volume corresponds with weekly Nmap asset discovery script from DevOps team.',
    remediationSteps: [
      'Marked as benign authorized scan',
    ],
    assignedAnalyst: 'Agent Alex Rivera',
  },
]

export async function fetchThreats(): Promise<ThreatAlert[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockThreats), 100)
  })
}

export async function updateThreatStatus(
  id: string,
  status: ThreatAlert['status']
): Promise<ThreatAlert> {
  const alert = mockThreats.find((t) => t.id === id)
  if (alert) {
    alert.status = status
    return alert
  }
  throw new Error(`Threat with ID ${id} not found`)
}
