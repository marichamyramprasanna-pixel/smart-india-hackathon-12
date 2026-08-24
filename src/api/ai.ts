import { AIChatRequestPayload, AIChatResponsePayload } from '../types/ai'
import { env } from '../config/env'
import { DeviceTelemetry } from '../types/device'
import { ThreatAlert } from '../types/threat'

/**
 * Builds a fully dynamic SOC system prompt from the live device inventory.
 * Every device and alert you add to the database will be included.
 */
function buildLiveSystemPrompt(
  devices: DeviceTelemetry[],
  alerts: ThreatAlert[]
): string {
  const compromised = devices.filter((d) => d.status === 'COMPROMISED')
  const suspicious = devices.filter((d) => d.status === 'SUSPICIOUS')
  const highRiskDevices = [...compromised, ...suspicious].slice(0, 10)

  const activeAlerts = alerts.filter(
    (a) => a.status === 'NEW' || a.status === 'INVESTIGATING'
  )

  const deviceSummaryLines = highRiskDevices.length > 0
    ? highRiskDevices.map((d) =>
        `  - ${d.id} (${d.hostname}, IP: ${d.ip}, Dept: ${d.department}, Status: ${d.status}, Risk: ${d.riskScore}%, CompromiseProb: ${d.compromiseProbability}%)`
      ).join('\n')
    : '  - No high-risk devices currently in inventory.'

  const allDeviceLines = devices.slice(0, 20).map((d) =>
    `  - ${d.id} | ${d.hostname} | ${d.ip} | ${d.type} | ${d.status} | Risk ${d.riskScore}%`
  ).join('\n')

  const alertLines = activeAlerts.slice(0, 10).map((a) =>
    `  - ${a.alertCode}: ${a.title} — Device: ${a.deviceId} (${a.deviceIp}), Severity: ${a.severity}, Confidence: ${a.confidenceScore}%`
  ).join('\n')

  const topThreat = highRiskDevices[0]

  return `You are Sentinel AI, an expert Tier-3 Cybersecurity Analyst Copilot embedded in the SentinelX Network Compromise Detection & Investigation Platform.

Your primary mission is to assist SOC teams, incident responders, and security analysts in:
1. Investigating suspicious network behavior and anomalous endpoint telemetry.
2. Explaining AI behavioral anomaly detections with mathematical clarity (Shannon entropy, baseline divergence, Fourier beaconing periodicity).
3. Tracing multi-hop attack paths and blast radius across network tiers.
4. Mapping adversary tactics and techniques to the MITRE ATT&CK Matrix.
5. Recommending and guiding tactical containment actions (802.1X host quarantine, firewall drop rules, credential revocation).

═══ LIVE INVENTORY SNAPSHOT ═══
Total Monitored Endpoints: ${devices.length}
Compromised Devices: ${compromised.length}
Suspicious Devices: ${suspicious.length}
Active Unresolved Alerts: ${activeAlerts.length}

HIGH-RISK DEVICES REQUIRING ATTENTION:
${deviceSummaryLines}

FULL ENDPOINT INVENTORY (top 20):
${allDeviceLines || '  - No devices in inventory yet.'}

ACTIVE UNRESOLVED ALERTS:
${alertLines || '  - No active alerts.'}

${topThreat ? `PRIMARY INCIDENT FOCUS:
- Patient Zero: ${topThreat.id} (${topThreat.hostname}, IP: ${topThreat.ip})
- Department: ${topThreat.department}
- Risk Score: ${topThreat.riskScore}% | Status: ${topThreat.status}
- Compromise Probability: ${topThreat.compromiseProbability}%` : 'No critical incidents at this time.'}

STYLE & FORMATTING GUIDELINES:
- Be concise, authoritative, structured, and technical.
- Use GitHub markdown with bold headers, bullet points, and code blocks for IoCs and query snippets.
- Tag MITRE ATT&CK techniques in brackets (e.g. [T1071.001], [T1021.002], [T1048]).
- Always reference the ACTUAL device IDs from the live inventory above — do NOT reference devices that are not in the list.
- Always provide clear, actionable tactical next steps for the analyst.`
}

/** Returns the highest-priority device from the live inventory, or undefined. */
function getTopThreat(
  compromised: DeviceTelemetry[],
  suspicious: DeviceTelemetry[],
  all: DeviceTelemetry[]
): DeviceTelemetry | undefined {
  return compromised[0] ?? suspicious[0] ?? all[0]
}

export async function sendChatMessage(
  payload: AIChatRequestPayload & {
    devices?: DeviceTelemetry[]
    alerts?: ThreatAlert[]
  }
): Promise<AIChatResponsePayload> {
  const userQuery = payload.message
  const contextId = payload.context?.id || ''
  const contextName = payload.context?.name || ''
  const contextType = payload.context?.type || 'global'
  const devices: DeviceTelemetry[] = payload.devices ?? []
  const alerts: ThreatAlert[] = payload.alerts ?? []

  const systemPrompt = buildLiveSystemPrompt(devices, alerts)

  const compromised = devices.filter((d) => d.status === 'COMPROMISED') as DeviceTelemetry[]
  const suspicious = devices.filter((d) => d.status === 'SUSPICIOUS') as DeviceTelemetry[]
  // Use a helper to avoid TypeScript narrowing issues with `??` chains on filtered arrays
  const topThreat = getTopThreat(compromised, suspicious, devices)
  const activeAlerts = alerts.filter((a) => a.status === 'NEW' || a.status === 'INVESTIGATING') as ThreatAlert[]

  // If OpenRouter is configured, call the live LLM
  if (env.isOpenRouterConfigured) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
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
          const quickActions = buildQuickActions(topThreat, activeAlerts)
          return {
            message: aiMessage,
            confidence: 0.96,
            structuredInsight: topThreat ? {
              title: `Live LLM Forensic Assessment (${topThreat.id})`,
              riskScore: topThreat.riskScore,
              evidence: buildEvidenceList(topThreat, activeAlerts),
              recommendedMitigation: `Execute immediate 802.1X host isolation on ${topThreat.id} and audit adjacent network flows.`,
            } : undefined,
            actions: quickActions,
          }
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[Sentinel AI] OpenRouter live stream fallback to local expert knowledge base.', err)
    }
  }

  // ── Local fallback: device-aware knowledge responses ──────────────────────
  await new Promise((resolve) => setTimeout(resolve, 300))

  const queryLower = userQuery.toLowerCase()
  const quickActions = buildQuickActions(topThreat, activeAlerts)

  // Match against any device in the live inventory
  const mentionedDevice = devices.find(
    (d) =>
      queryLower.includes(d.id.toLowerCase()) ||
      queryLower.includes(d.hostname.toLowerCase()) ||
      queryLower.includes(d.ip)
  )

  const targetDevice = mentionedDevice || (contextId ? devices.find((d) => d.id === contextId) : null) || topThreat

  if (targetDevice) {
    const deviceAlerts = alerts.filter((a) => a.deviceId === targetDevice.id)
    const alertSummary = deviceAlerts.length > 0
      ? deviceAlerts.slice(0, 3).map((a) => `  - ${a.alertCode}: ${a.title} (${a.severity})`).join('\n')
      : '  - No database alerts recorded for this device.'

    return {
      message: `**Tactical AI Assessment for ${targetDevice.id} (${targetDevice.hostname}):**\n\n- **Status:** ${targetDevice.status}\n- **Risk Score:** ${targetDevice.riskScore}%\n- **Compromise Probability:** ${targetDevice.compromiseProbability}%\n- **Department:** ${targetDevice.department}\n- **IP Address:** \`${targetDevice.ip}\`\n\n**Active Alerts for This Device:**\n${alertSummary}\n\n**Recommended Actions:**\n1. Isolate ${targetDevice.id} via 802.1X if status is COMPROMISED or SUSPICIOUS.\n2. Capture volatile memory image before rebooting.\n3. Review DNS, authentication, and lateral movement logs.\n4. Revoke active Kerberos tickets if credential theft is suspected.\n\nWould you like me to generate a containment playbook or incident report for ${targetDevice.id}?`,
      confidence: targetDevice.status === 'COMPROMISED' ? 0.94 : 0.87,
      structuredInsight: {
        title: `${targetDevice.status === 'COMPROMISED' ? 'High-Probability Active Compromise' : 'Suspicious Activity Detected'} (${targetDevice.id})`,
        riskScore: targetDevice.riskScore,
        evidence: buildEvidenceList(targetDevice, deviceAlerts),
        recommendedMitigation: `Execute 802.1X host isolation on ${targetDevice.id} and audit all lateral connections.`,
      },
      actions: [
        { id: `act-isolate-${targetDevice.id}`, label: `Isolate ${targetDevice.id}`, actionType: 'isolate_device', payload: { deviceId: targetDevice.id } },
        { id: 'act-trace-graph', label: 'Trace Attack Path', actionType: 'navigate', payload: { path: '/attack-graph' } },
        { id: 'act-gen-report', label: 'Generate Incident Report', actionType: 'generate_report', payload: { deviceId: targetDevice.id } },
        { id: 'act-view-threats', label: 'Review All Alerts', actionType: 'navigate', payload: { path: '/threats' } },
      ],
    }
  }

  if (queryLower.includes('beacon') || queryLower.includes('cadence') || queryLower.includes('jitter') || queryLower.includes('c2')) {
    let c2Message: string
    if (topThreat !== undefined) {
      const dt: DeviceTelemetry = topThreat as DeviceTelemetry
      const id = dt.id
      const ip = dt.ip
      const devStatus = dt.status
      const risk = dt.riskScore
      c2Message = `**C2 Periodic Beaconing Analysis:**\n\n- **Target Host:** ${id} (${ip})\n- **Status:** ${devStatus} | Risk: ${risk}%\n- **Signal Processing Attribution:** Fast Fourier Transform (FFT) can detect synchronized periodic pulses in outbound traffic.\n- **MITRE Technique:** [T1071.001 Web Protocols] & [T1573 Encrypted Channel]\n\n**Recommended Response:**\n1. Enforce 802.1X quarantine on ${id}.\n2. Push perimeter firewall rule to drop outbound traffic on all unauthorized external ports.\n3. Dump volatile memory for process injection analysis.\n\nWould you like me to generate specific firewall drop rules?`
    } else {
      c2Message = `**C2 Beaconing Analysis:**\n\nNo compromised devices currently in inventory. Add devices and I'll analyze beaconing patterns against them.`
    }
    return {
      message: c2Message,
      confidence: 0.96,
      actions: quickActions,
    }
  }

  // General summary fallback
  const summaryLines = [
    devices.length > 0
      ? `I'm currently monitoring **${devices.length} endpoint${devices.length !== 1 ? 's' : ''}** in your live inventory.`
      : `No devices are currently in your inventory. Add devices on the Devices page to begin monitoring.`,
    compromised.length > 0
      ? `⚠️ **${compromised.length} device${compromised.length !== 1 ? 's' : ''}** ${compromised.length !== 1 ? 'are' : 'is'} in COMPROMISED state: ${compromised.slice(0, 3).map((d) => d.id).join(', ')}.`
      : null,
    suspicious.length > 0
      ? `🔍 **${suspicious.length} device${suspicious.length !== 1 ? 's' : ''}** ${suspicious.length !== 1 ? 'are' : 'is'} flagged as SUSPICIOUS: ${suspicious.slice(0, 3).map((d) => d.id).join(', ')}.`
      : null,
    activeAlerts.length > 0
      ? `🚨 **${activeAlerts.length} active alert${activeAlerts.length !== 1 ? 's' : ''}** require triage.`
      : `✅ No active security alerts at this time.`,
  ].filter(Boolean).join('\n\n')

  return {
    message: `**Sentinel AI Intelligence Summary:**\n\n${summaryLines}\n\nHow would you like to proceed with the investigation?`,
    confidence: 0.95,
    actions: quickActions,
  }
}

function buildQuickActions(
  topThreat: DeviceTelemetry | undefined,
  activeAlerts: ThreatAlert[]
) {
  const actions = []
  if (topThreat) {
    actions.push({
      id: `act-investigate-${topThreat.id}`,
      label: `Investigate ${topThreat.id}`,
      actionType: 'navigate' as const,
      payload: { path: `/devices/${topThreat.id}` },
    })
    actions.push({
      id: `act-isolate-${topThreat.id}`,
      label: `Isolate ${topThreat.id}`,
      actionType: 'isolate_device' as const,
      payload: { deviceId: topThreat.id },
    })
  }
  actions.push({ id: 'act-view-threats', label: 'Review All Alerts', actionType: 'navigate' as const, payload: { path: '/threats' } })
  actions.push({ id: 'act-attack-graph', label: 'Open Attack Graph', actionType: 'navigate' as const, payload: { path: '/attack-graph' } })
  if (activeAlerts.length > 0) {
    actions.push({ id: 'act-reports', label: 'Export Incident Report', actionType: 'navigate' as const, payload: { path: '/reports' } })
  }
  return actions
}

function buildEvidenceList(device: DeviceTelemetry, alerts: ThreatAlert[]): string[] {
  const evidence: string[] = []
  if (device.status === 'COMPROMISED') evidence.push(`Device status: COMPROMISED (Risk: ${device.riskScore}%)`)
  if (device.status === 'SUSPICIOUS') evidence.push(`Device status: SUSPICIOUS (Risk: ${device.riskScore}%)`)
  if (device.compromiseProbability >= 80) evidence.push(`High compromise probability: ${device.compromiseProbability}%`)
  alerts.slice(0, 4).forEach((a) => {
    evidence.push(`${a.alertCode}: ${a.title} (${a.severity})`)
  })
  if (evidence.length === 0) evidence.push(`Monitoring ${device.id} — no high-severity flags currently.`)
  return evidence
}
