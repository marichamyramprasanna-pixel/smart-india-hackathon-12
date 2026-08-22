import { AIChatRequestPayload, AIChatResponsePayload } from '../types/ai'
import { env } from '../config/env'

const SOC_SYSTEM_PROMPT = `You are Sentinel AI, an expert Tier-3 Cybersecurity Analyst Copilot embedded in the SentinelX Network Compromise Detection & Investigation Platform.

Your primary mission is to assist SOC teams, incident responders, and security analysts in:
1. Investigating suspicious network behavior and anomalous endpoint telemetry.
2. Explaining AI behavioral anomaly detections with mathematical clarity (Shannon entropy, baseline divergence, Fourier beaconing periodicity).
3. Tracing multi-hop attack paths and blast radius across network tiers.
4. Mapping adversary tactics and techniques to the MITRE ATT&CK Matrix.
5. Recommending and guiding tactical containment actions (802.1X host quarantine, firewall drop rules, credential revocation).

ACTIVE SOC INVESTIGATION CONTEXT:
- Patient Zero Host: DEVICE-042 (FIN-WS-042.internal.corp, IP: 10.0.4.42, Corporate Finance)
- Risk Score: 94% | Compromise Probability: 94% | Bayesian AI Confidence: 96.4%
- Core Anomaly Vectors:
  1. DNS DGA Tunneling: 342 queries/min to algorithmically generated domains with Shannon entropy of 4.88 (baseline: 1.90).
  2. C2 Beacon Cadence: Strict 30.02-second periodic outbound TLS pulse to external IP 185.220.101.5:443 (0.4% jitter, Cobalt Strike/Sliver profile).
  3. Data Exfiltration Surge: 4.8 GB compressed payload transferred outbound during off-hours.
  4. Authentication Anomaly: Off-hours Kerberos ticket request at 02:14 UTC outside normal 08:30-17:00 shift hours.
  5. Lateral Movement Staging: Unauthorized Pass-the-Hash SMB/RPC probe to production database host SERVER-07 (DB-CORE-07, 10.0.2.7).
- Adjacent Probed Endpoints: DEVICE-118 (10.0.4.118, Engineering DevOps Laptop).

STYLE & FORMATTING GUIDELINES:
- Be concise, authoritative, structured, and technical.
- Use GitHub markdown with bold headers, bullet points, and code blocks for IoCs and query snippets.
- Tag MITRE ATT&CK techniques in brackets (e.g. [T1071.001], [T1021.002], [T1048]).
- Always provide clear, actionable tactical next steps for the analyst.`

export async function sendChatMessage(
  payload: AIChatRequestPayload
): Promise<AIChatResponsePayload> {
  const userQuery = payload.message
  const contextId = payload.context?.id || ''
  const contextName = payload.context?.name || ''
  const contextType = payload.context?.type || 'global'

  // If OpenRouter is configured, call the live LLM
  if (env.isOpenRouterConfigured) {
    try {
      const messages = [
        { role: 'system', content: SOC_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `[Current UI Context: Type=${contextType}, Target=${contextId || 'Global'}, Name=${contextName}]\n\nUser Question:\n${userQuery}`,
        },
      ]

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://sentinelx.security',
          'X-Title': 'SentinelX SOC Platform',
        },
        body: JSON.stringify({
          model: env.openrouterModel,
          messages,
          temperature: 0.3,
          max_tokens: 1200,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const aiMessage = data.choices?.[0]?.message?.content

        if (aiMessage) {
          return {
            message: aiMessage,
            confidence: 0.96,
            structuredInsight: contextId === 'DEVICE-042' || userQuery.includes('042') ? {
              title: 'Live LLM Forensic Assessment (DEVICE-042)',
              riskScore: 94,
              evidence: [
                'High-entropy DNS DGA queries (4.88 Shannon entropy)',
                'Periodic C2 beaconing (30.02s interval / 0.4% jitter)',
                'Volumetric outbound data exfiltration (4.8 GB)',
                'Pass-the-hash SMB probe to DB-CORE-07',
              ],
              recommendedMitigation: 'Execute immediate 802.1X host isolation and sinkhole *.tunnel-c2.biz domains.',
            } : undefined,
            actions: [
              { id: 'act-isolate-042', label: 'Isolate DEVICE-042', actionType: 'isolate_device', payload: { deviceId: 'DEVICE-042' } },
              { id: 'act-trace-graph', label: 'Trace Attack Path', actionType: 'navigate', payload: { path: '/attack-graph' } },
              { id: 'act-view-timeline', label: 'View Attack Timeline', actionType: 'navigate', payload: { path: '/timeline' } },
              { id: 'act-gen-report', label: 'Generate Incident Report', actionType: 'generate_report', payload: { deviceId: 'DEVICE-042' } },
            ],
          }
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[Sentinel AI] OpenRouter live stream fallback to local expert knowledge base.', err)
    }
  }

  // Fallback to embedded local cybersecurity knowledge base
  await new Promise((resolve) => setTimeout(resolve, 300))

  const queryLower = userQuery.toLowerCase()

  if (contextId === 'DEVICE-042' || queryLower.includes('042') || queryLower.includes('patient zero') || queryLower.includes('finance')) {
    return {
      message: `**Tactical AI Assessment for DEVICE-042 (FIN-WS-042):**\n\n- **Compromise Probability:** 94% (Critical Threat)\n- **Primary Attack Vector:** Command & Control [T1071.001] + High-Entropy DNS DGA Tunneling [T1071.004]\n- **Observed Telemetry Deviations:**\n  - **DNS Behavior (+31% contribution):** 342 queries/min to algorithmically generated domains with average Shannon entropy of 4.88.\n  - **Beaconing Pattern (+14%):** Strict 30.02s periodic outbound check-in to external IP \`185.220.101.5\` (0.4% jitter).\n  - **Data Exfiltration (+24%):** 4.8 GB outbound encrypted stream over port 443 [T1048].\n  - **Lateral Movement (+7%):** SMB connection attempt to production database server \`DB-CORE-07\` [T1021.002].\n\n**Probabilistic Reasoning:** The observed multi-vector anomaly profile deviates by 6.8 standard deviations from the 30-day baseline for the Finance Department workstation cluster. Bayesian confidence is calibrated at 96.4%.`,
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

  if (queryLower.includes('beacon') || queryLower.includes('cadence') || queryLower.includes('jitter') || queryLower.includes('c2')) {
    return {
      message: `**C2 Periodic Beaconing Analysis:**\n\n- **Target Host:** DEVICE-042 (10.0.4.42)\n- **Adversary Infrastructure:** 185.220.101.5:443 (NL / Bulletproof ASN 49302)\n- **Signal Processing Attribution:** Fast Fourier Transform (FFT) detected synchronized periodic pulses at exactly **30.02-second** intervals with **0.4% jitter variance**.\n- **MITRE Technique:** [T1071.001 Web Protocols] & [T1573 Encrypted Channel]\n\n**Recommended Response:**\n1. Enforce 802.1X quarantine on DEVICE-042.\n2. Push perimeter firewall rule to drop all traffic to CIDR \`185.220.101.0/24\`.\n3. Dump volatile memory for process injection analysis (\`svchost.exe\` / \`lsass.exe\`).`,
      confidence: 0.96,
      actions: [
        { id: 'act-isolate-042', label: 'Isolate DEVICE-042', actionType: 'isolate_device', payload: { deviceId: 'DEVICE-042' } },
        { id: 'act-trace-graph', label: 'Inspect Blast Radius', actionType: 'navigate', payload: { path: '/attack-graph' } },
      ],
    }
  }

  return {
    message: `**Sentinel AI Intelligence Summary:**\n\nI have analyzed your query against our live behavioral telemetry store. Across our monitored corporate network, the primary active incident centers on **DEVICE-042** (FIN-WS-042) exhibiting a multi-stage compromise involving DNS tunneling, C2 beaconing, and lateral movement toward **SERVER-07**.\n\nHow would you like to proceed with the investigation?`,
    confidence: 0.95,
    actions: [
      { id: 'act-investigate-042', label: 'Investigate DEVICE-042', actionType: 'navigate', payload: { path: '/devices/DEVICE-042' } },
      { id: 'act-view-threats', label: 'Review All Alerts', actionType: 'navigate', payload: { path: '/threats' } },
      { id: 'act-attack-graph', label: 'Open Attack Graph', actionType: 'navigate', payload: { path: '/attack-graph' } },
      { id: 'act-reports', label: 'Export Incident Report', actionType: 'navigate', payload: { path: '/reports' } },
    ],
  }
}
