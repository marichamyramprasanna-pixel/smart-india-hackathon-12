import { ThreatAlert } from '../types/threat'

export function exportThreatsToSTIX21(threats: ThreatAlert[]): void {
  const objects: any[] = []
  
  // Create an Identity object for the reporting organization
  const orgId = 'identity--c60ad41e-35ee-4a81-9b1a-2895f32bdf60'
  objects.push({
    type: 'identity',
    spec_version: '2.1',
    id: orgId,
    name: 'SentinelX Security Operations Center',
    identity_class: 'organization',
    sectors: ['technology', 'defense'],
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  })

  threats.forEach((threat) => {
    const threatActorId = `threat-actor--${threat.id}-actor`
    const indicatorId = `indicator--${threat.id}-indicator`

    // 1. STIX 2.1 Threat Actor (representing the adversary cluster)
    objects.push({
      type: 'threat-actor',
      spec_version: '2.1',
      id: threatActorId,
      name: `Adversary Group targeting ${threat.deviceId}`,
      threat_actor_types: ['cyber-adversary'],
      sophistication: 'advanced',
      resource_level: 'organization',
      created: threat.detectedAt,
      modified: threat.detectedAt,
    })

    // 2. STIX 2.1 Indicator (containing the observed indicators of compromise)
    const patterns = threat.indicators.map((ind) => {
      if (ind.type === 'IP') return `[ipv4-addr:value = '${ind.value}']`
      if (ind.type === 'Domain') return `[domain-name:value = '${ind.value}']`
      return `[file:name = '${ind.value}']`
    }).join(' OR ')

    objects.push({
      type: 'indicator',
      spec_version: '2.1',
      id: indicatorId,
      name: `Indicator for ${threat.alertCode}: ${threat.title}`,
      description: `${threat.summary} | Confidence: ${threat.confidenceScore}%`,
      indicator_types: ['malicious-activity'],
      pattern: patterns || "[ipv4-addr:value = '185.220.101.5']",
      pattern_type: 'stix',
      valid_from: threat.detectedAt,
      created: threat.detectedAt,
      modified: threat.detectedAt,
    })

    // 3. STIX 2.1 Relationship (mapping Indicator indicates Threat Actor)
    objects.push({
      type: 'relationship',
      spec_version: '2.1',
      id: `relationship--${threat.id}-ind-indicates-actor`,
      relationship_type: 'indicates',
      source_ref: indicatorId,
      target_ref: threatActorId,
      created: threat.detectedAt,
      modified: threat.detectedAt,
    })
  })

  const bundle = {
    type: 'bundle',
    id: `bundle--c9b8a7d6-e5f4-3210-9876-543210fedcba`,
    spec_version: '2.1',
    objects,
  }

  // Trigger browser download
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `stix_2.1_threat_feed_${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
export const stixExporter = { exportThreatsToSTIX21 }
