import { AIChatRequestPayload, AIChatResponsePayload } from '../types/ai'

export async function sendChatMessage(
  payload: AIChatRequestPayload
): Promise<AIChatResponsePayload> {
  // Simulate network roundtrip
  await new Promise((resolve) => setTimeout(resolve, 600))

  const userQuery = payload.message.toLowerCase()
  const contextId = payload.context?.id || ''

  // 1. Device 042 Context or specific query
  if (contextId === 'DEVICE-042' || userQuery.includes('042') || userQuery.includes('finance')) {
    return {
      message: `**Tactical AI Assessment for DEVICE-042 (FIN-WS-042):**\n\n- **Compromise Probability:** 94% (High Risk)\n- **Primary Threat Vector:** Command & Control over TLS + High-Entropy DNS DGA Tunneling\n- **Observed Deviations:**\n  - **DNS Behavior (+31% contribution):** 342 queries/min to algorithmically generated domains with average Shannon entropy of 4.88.\n  - **Beaconing Pattern (+14%):** Strict 30.02s periodic outbound check-in to external IP \`185.220.101.5\` (0.4% jitter).\n  - **Data Exfiltration (+24%):** 4.8 GB outbound encrypted stream over port 443.\n  - **Lateral Movement (+7%):** SMB connection attempt to production database server \`DB-CORE-07\`.\n\n**Probabilistic Reasoning:** The observed multi-vector anomaly profile deviates by 6.8 standard deviations from the 30-day baseline for the Finance Department workstation cluster. Confidence is calibrated at 96.4%.`,
      confidence: 0.94,
      structuredInsight: {
        title: 'High-Probability Active Host Compromise (DEVICE-042)',
        riskScore: 94,
        evidence: [
          'Abnormal DNS Entropy (4.88 vs 1.90 baseline)',
          'C2 Beaconing (30.02s interval / 0.4% jitter)',
          'Outbound Traffic Surge (4.8 GB exfil)',
          'Lateral SMB Hop to DB-CORE-07',
        ],
        recommendedMitigation: 'Execute immediate 802.1X host isolation and sinkhole *.tunnel-c2.biz DNS domains.',
      },
      actions: [
        { id: 'act-isolate-042', label: 'Isolate DEVICE-042', actionType: 'isolate_device', payload: { deviceId: 'DEVICE-042' } },
        { id: 'act-trace-graph', label: 'Trace Attack Path', actionType: 'navigate', payload: { path: '/attack-graph' } },
        { id: 'act-view-timeline', label: 'View Attack Timeline', actionType: 'navigate', payload: { path: '/timeline' } },
        { id: 'act-gen-report', label: 'Generate Incident Summary', actionType: 'generate_report', payload: { deviceId: 'DEVICE-042' } },
      ],
    }
  }

  // 2. Alert AL-2041 Context
  if (contextId === 'AL-2041' || userQuery.includes('al-2041') || userQuery.includes('beacon') || userQuery.includes('c2')) {
    return {
      message: `**Alert Triage: AL-2041 (Command & Control Activity)**\n\n- **Target Host:** DEVICE-042 (10.0.4.42)\n- **External Adversary IP:** 185.220.101.5 (NL / Bulletproof ASN 49302)\n- **Detection Signature:** Multivariate time-series periodicity analysis detected synchronized heartbeat packets at exactly 30.02 second intervals.\n- **Risk Evaluation:** High probability of an active remote access trojan (RAT) or C2 agent executing under injected process \`svchost.exe\`.\n\n*Recommended action:* Block IP on perimeter firewall FW-01 and trigger memory acquisition.`,
      confidence: 0.96,
      structuredInsight: {
        title: 'C2 Beaconing & Tunneling Detected (AL-2041)',
        riskScore: 94,
        evidence: [
          'Periodic heartbeat at 30.02s intervals',
          'Encrypted payloads matching Sliver / Cobalt Strike C2 signatures',
          'Associated with DGA domain x9q7f-tunnel-c2.biz',
        ],
        recommendedMitigation: 'Add IP 185.220.101.5 to perimeter firewall drop rules.',
      },
      actions: [
        { id: 'act-block-ip', label: 'Block IP 185.220.101.5', actionType: 'block_ip', payload: { ip: '185.220.101.5' } },
        { id: 'act-view-device', label: 'Investigate DEVICE-042', actionType: 'navigate', payload: { path: '/devices/DEVICE-042' } },
      ],
    }
  }

  // 3. General Threat / Network Health query
  if (userQuery.includes('network') || userQuery.includes('health') || userQuery.includes('status')) {
    return {
      message: `**Network Baseline Health Summary:**\n\n- **Overall Compromise Probability:** 18% (Elevated due to cluster in Finance VLAN)\n- **Monitored Endpoints:** 1,248 active devices\n- **Compromised Endpoints:** 1 confirmed (DEVICE-042)\n- **Suspicious Endpoints:** 2 under active monitoring (SERVER-07, DEVICE-118)\n- **AI Behavioral Confidence:** 96.4%\n- **Active Threat Detections:** 3 ongoing investigations (AL-2041, AL-2042, AL-2043)\n\n*Threat Containment Advice:* Lateral progression has been staged toward SERVER-07 but no critical database exfiltration has occurred yet. Immediate containment of DEVICE-042 will protect the core database tier.`,
      confidence: 0.96,
      actions: [
        { id: 'act-threats', label: 'View Active Threats', actionType: 'navigate', payload: { path: '/threats' } },
        { id: 'act-3d', label: 'Inspect 3D Network', actionType: 'navigate', payload: { path: '/network-3d' } },
      ],
    }
  }

  // Default fallback response with technical cybersecurity context
  return {
    message: `**Sentinel AI Analysis:**\n\nI have analyzed the query against our behavioral intelligence store. Across 1,248 monitored entities, the primary active incident centers on **DEVICE-042** (FIN-WS-042) exhibiting a multi-stage compromise involving DNS tunneling, C2 beaconing, and lateral movement toward **SERVER-07**.\n\nHow would you like to proceed with the investigation?`,
    confidence: 0.95,
    actions: [
      { id: 'act-investigate-042', label: 'Investigate DEVICE-042', actionType: 'navigate', payload: { path: '/devices/DEVICE-042' } },
      { id: 'act-view-threats', label: 'Review All Alerts', actionType: 'navigate', payload: { path: '/threats' } },
      { id: 'act-attack-graph', label: 'Open Attack Graph', actionType: 'navigate', payload: { path: '/attack-graph' } },
      { id: 'act-reports', label: 'Export Incident Report', actionType: 'navigate', payload: { path: '/reports' } },
    ],
  }
}
