import { ThreatAlert } from '../types/threat'

export const mockThreats: ThreatAlert[] = [
  {
    id: 'AL-2041',
    alertCode: 'AL-2041',
    title: 'Possible Command & Control (C2) Activity via High-Entropy DNS & Encrypted Beaconing',
    deviceId: 'SERVER-99',
    deviceHostname: 'CORE-DB-CLUSTER-01',
    deviceIp: '10.0.2.99',
    threatCategory: 'Command & Control',
    severity: 'CRITICAL',
    confidenceScore: 94,
    compromiseProbability: 88,
    detectedAt: '2 min ago',
    status: 'INVESTIGATING',
    summary: 'SERVER-99 is generating periodic encrypted outbound heartbeat pulses (30.02s interval) with near-zero jitter to IP 185.220.101.5 alongside high Shannon entropy DGA DNS queries.',
    indicators: [
      { type: 'Domain', value: 'x9q7f-tunnel-c2.biz (Entropy 4.88)', reputation: 'Untrusted/Dynamic C2' },
      { type: 'IP', value: '185.220.101.5:443', reputation: 'Bulletproof ASN 49302' },
      { type: 'Jitter', value: '0.4% interval variance', reputation: 'Automated Bot Beacon' },
      { type: 'Entropy', value: '4.88 Shannon Score', reputation: 'Algorithmically Generated Domain' },
    ],
    aiExplanation: 'The observed device behavior exhibits an 88% probabilistic deviation from normal database server baselines. The combination of static interval beaconing and high-entropy DNS tunnel payloads matches Cobalt Strike / Sliver C2 profiles.',
    remediationSteps: [
      'Isolate SERVER-99 immediately via network 802.1X quarantine',
      'Block outbound destination IP 185.220.101.5 on perimeter firewall FIREWALL-01',
      'Sinkhole DNS resolution for *.tunnel-c2.biz on internal resolvers',
      'Trigger memory dump & process capture on CORE-DB-CLUSTER-01 for forensics',
    ],
    assignedAnalyst: 'Agent Alex Rivera (Lead Responder)',
  },
  {
    id: 'AL-2042',
    alertCode: 'AL-2042',
    title: 'Abnormal Outbound Data Transfer Burst (14.2 GB Exfiltration)',
    deviceId: 'SERVER-99',
    deviceHostname: 'CORE-DB-CLUSTER-01',
    deviceIp: '10.0.2.99',
    threatCategory: 'Data Exfiltration',
    severity: 'CRITICAL',
    confidenceScore: 91,
    compromiseProbability: 85,
    detectedAt: '6 min ago',
    status: 'INVESTIGATING',
    summary: 'Sudden high-throughput outbound TLS stream transmitting 14.2 GB to unclassified foreign IP, exceeding 30-day baseline by 2,400%.',
    indicators: [
      { type: 'IP', value: '185.220.101.6:8443', reputation: 'Untrusted VPS Host' },
      { type: 'Process', value: 'ldap-exporter -> dump_db.sh injection', reputation: 'Suspicious Memory Allocation' },
    ],
    aiExplanation: 'Server baseline outbound volume averages < 500 MB/day. 14.2 GB exfiltration over port 8443 represents an extreme statistical deviation (z-score: 8.4).',
    remediationSteps: [
      'Terminate active TLS session #conn-01',
      'Review exfiltrated data egress classification',
    ],
    assignedAnalyst: 'Agent Alex Rivera',
  },
  {
    id: 'AL-2043',
    alertCode: 'AL-2043',
    title: 'High DNS DGA Query Entropy & Domain Generation Tunneling',
    deviceId: 'LAPTOP-PRO-7',
    deviceHostname: 'EXEC-LAPTOP-ALPHA',
    deviceIp: '10.0.3.44',
    threatCategory: 'DGA Tunneling',
    severity: 'HIGH',
    confidenceScore: 89,
    compromiseProbability: 64,
    detectedAt: '8 min ago',
    status: 'NEW',
    summary: 'Executive laptop LAPTOP-PRO-7 initiated abnormal high-entropy DNS resolution requests to unregistered TLD .xyz.',
    indicators: [
      { type: 'Domain', value: 'k98z-alpha-exfil.xyz', reputation: 'Dynamic DGA TLD' },
      { type: 'Entropy', value: '5.12 Shannon Score', reputation: 'Malicious DGA Signature' },
    ],
    aiExplanation: 'Executive laptop HAS never historically queried .xyz TLD domains. Anomaly confidence score 89%.',
    remediationSteps: [
      'Isolate LAPTOP-PRO-7 via SOC 802.1X quarantine',
      'Revoke Kerberos session tickets for CISO user account',
    ],
    assignedAnalyst: 'Unassigned',
  },
  {
    id: 'AL-2038',
    alertCode: 'AL-2038',
    title: 'Off-Hours Administrative Authentication Spike',
    deviceId: 'DEVICE-101',
    deviceHostname: 'FIN-WORKSTATION-101',
    deviceIp: '10.0.1.101',
    threatCategory: 'Credential Access',
    severity: 'MEDIUM',
    confidenceScore: 78,
    compromiseProbability: 45,
    detectedAt: '15 min ago',
    status: 'INVESTIGATING',
    summary: 'Multiple Kerberos ticket requests for privileged accounts originating at off-shift hours following 14 failed NTLM attempts.',
    indicators: [
      { type: 'Process', value: 'lsass.exe memory read attempt', reputation: 'Mimikatz-like artifact' },
    ],
    aiExplanation: 'Authentication cadence deviates from user Sarah Connor normal shift profile.',
    remediationSteps: [
      'Force password reset on account sconnor_adm',
      'Audit Active Directory event log ID 4624/4625',
    ],
    assignedAnalyst: 'Agent Alex Rivera',
  },
  {
    id: 'AL-2031',
    alertCode: 'AL-2031',
    title: 'Unusual Internal Subnet Discovery Scan',
    deviceId: 'IOT-GATEWAY-04',
    deviceHostname: 'SMART-BUILDING-HUB',
    deviceIp: '10.0.4.15',
    threatCategory: 'Reconnaissance',
    severity: 'LOW',
    confidenceScore: 68,
    compromiseProbability: 18,
    detectedAt: '24 min ago',
    status: 'RESOLVED',
    summary: 'Subnet probe on ports 22, 80, 443, 8080. Verified as scheduled internal asset discovery scan.',
    indicators: [
      { type: 'Port', value: 'SYN scan ports 22-8080', reputation: 'Approved internal scan' },
    ],
    aiExplanation: 'Traffic volume corresponds with weekly Nmap asset discovery script from Facilities IoT team.',
    remediationSteps: [
      'Marked as benign authorized scan',
    ],
    assignedAnalyst: 'Agent Alex Rivera',
  },
  {
    id: 'AL-2045',
    alertCode: 'AL-2045',
    title: 'High-Volume Shadow Volume Erasure & Ransomware Preparation',
    deviceId: 'SERVER-99',
    deviceHostname: 'CORE-DB-CLUSTER-01',
    deviceIp: '10.0.2.99',
    threatCategory: 'Command & Control',
    severity: 'CRITICAL',
    confidenceScore: 96,
    compromiseProbability: 95,
    detectedAt: 'Just now',
    status: 'NEW',
    summary: 'vssadmin.exe delete shadows /all /quiet command execution detected alongside sudden batch file renaming with high Shannon entropy extension.',
    indicators: [
      { type: 'Process', value: 'vssadmin.exe delete shadows /all /quiet', reputation: 'Ransomware Destructive Inhibitor' },
      { type: 'Entropy', value: '7.94 Encryption Score', reputation: 'Cryptographic Ransomware Pattern' },
    ],
    aiExplanation: 'Behavior matches LockBit / BlackCat pre-encryption staging routines. Bayesian confidence score 96%.',
    remediationSteps: [
      'Execute emergency 802.1X host isolation on SERVER-99',
      'Revoke core DB service credentials and terminate remote IPC sessions',
      'Mount immutable offline backup snapshots',
    ],
    assignedAnalyst: 'Unassigned',
  },
  {
    id: 'AL-2046',
    alertCode: 'AL-2046',
    title: 'Kerberoasting Ticket Harvesting Attempt targeting Service Accounts',
    deviceId: 'DEVICE-101',
    deviceHostname: 'FIN-WORKSTATION-101',
    deviceIp: '10.0.1.101',
    threatCategory: 'Credential Access',
    severity: 'HIGH',
    confidenceScore: 84,
    compromiseProbability: 68,
    detectedAt: '31 min ago',
    status: 'INVESTIGATING',
    summary: 'Multiple RC4-HMAC TGS requests for service principal names (SPNs) from non-Domain Controller workstation.',
    indicators: [
      { type: 'Process', value: 'Rubeus.exe /kerberoast', reputation: 'Active Directory Exploitation' },
      { type: 'IP', value: '10.0.1.101 -> 10.0.0.1:88', reputation: 'Suspicious SPN Enumeration' },
    ],
    aiExplanation: 'Request pattern indicates TGS ticket scraping for offline hash cracking.',
    remediationSteps: [
      'Rotate service account passwords for krbtgt and DB service accounts',
      'Enforce AES-256 Kerberos encryption requirement',
    ],
    assignedAnalyst: 'Agent Alex Rivera',
  },
  {
    id: 'AL-2047',
    alertCode: 'AL-2047',
    title: 'Base64 Encoded PowerShell Remote Execution Payload',
    deviceId: 'LAPTOP-PRO-7',
    deviceHostname: 'EXEC-LAPTOP-ALPHA',
    deviceIp: '10.0.3.44',
    threatCategory: 'Lateral Movement',
    severity: 'MEDIUM',
    confidenceScore: 76,
    compromiseProbability: 52,
    detectedAt: '45 min ago',
    status: 'NEW',
    summary: 'powershell.exe executed with -e / -enc Base64 payload containing obfuscated IEX download cradles.',
    indicators: [
      { type: 'Process', value: 'powershell.exe -enc JABzAD0...', reputation: 'Obfuscated Command Execution' },
    ],
    aiExplanation: 'Encoded script attempts to fetch secondary stage DLL from remote CDN IP.',
    remediationSteps: [
      'Terminate process tree for pid 8402',
      'Enable Constrained Language Mode in PowerShell Group Policy',
    ],
    assignedAnalyst: 'Unassigned',
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
