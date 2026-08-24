import React, { useState } from 'react'
import { Shield, Zap, ExternalLink, ChevronRight, CheckCircle2, AlertTriangle, Flame } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { useAlerts } from '../../hooks/useAlerts'

interface MitreTechnique {
  id: string
  name: string
  tactic: string
  tacticName: string
  severity: 'critical' | 'high' | 'medium' | 'nominal'
  detected: boolean
  description: string
  mitigation: string
}

export const MitreAttackMatrix: React.FC = () => {
  const { alerts } = useAlerts()
  const [selectedTechnique, setSelectedTechnique] = useState<MitreTechnique | null>(null)

  const techniques: MitreTechnique[] = [
    {
      id: 'T1078.002',
      name: 'Domain Accounts',
      tactic: 'TA0001',
      tacticName: 'Initial Access',
      severity: 'medium',
      detected: true,
      description: 'Adversaries may obtain and abuse credentials of domain accounts to gain initial access and elevate privileges.',
      mitigation: 'Enforce multi-factor authentication (MFA) and restrict off-hours administrative logins.',
    },
    {
      id: 'T1059.001',
      name: 'PowerShell Interpreter',
      tactic: 'TA0002',
      tacticName: 'Execution',
      severity: 'high',
      detected: true,
      description: 'Abuse of PowerShell commands and scripts for code execution and memory reflection.',
      mitigation: 'Enable Script Block Logging (EID 4104) and enforce Constrained Language Mode.',
    },
    {
      id: 'T1078',
      name: 'Valid Accounts',
      tactic: 'TA0004',
      tacticName: 'Privilege Escalation',
      severity: 'high',
      detected: true,
      description: 'Adversary uses legitimate service accounts (e.g. svc_backup_db) to bypass authorization barriers.',
      mitigation: 'Rotate Kerberos KRBTGT password hash and audit Tier-0 Active Directory permissions.',
    },
    {
      id: 'T1071.001',
      name: 'Web Protocols (HTTPS)',
      tactic: 'TA0011',
      tacticName: 'Command & Control',
      severity: 'critical',
      detected: true,
      description: 'Adversaries communicate using application layer protocols (HTTPS/TLS) over port 443 with deterministic beaconing intervals.',
      mitigation: 'Inspect TLS certificate JA3/JA4 fingerprints and block unclassified external ASNs at perimeter firewall.',
    },
    {
      id: 'T1568.002',
      name: 'Domain Generation (DGA)',
      tactic: 'TA0011',
      tacticName: 'Command & Control',
      severity: 'critical',
      detected: true,
      description: 'Adversaries dynamically calculate domain names using pseudorandom algorithms with high Shannon entropy (> 3.5).',
      mitigation: 'Implement DNS sinkholing and real-time entropy calculation on internal DNS resolvers.',
    },
    {
      id: 'T1021.002',
      name: 'SMB / Windows Admin Shares',
      tactic: 'TA0008',
      tacticName: 'Lateral Movement',
      severity: 'high',
      detected: true,
      description: 'Adversary establishes administrative SMB sessions on TCP port 445 to pivot into core database servers.',
      mitigation: 'Block inter-VLAN port 445 traffic with micro-segmentation firewall policies.',
    },
    {
      id: 'T1048.003',
      name: 'Exfiltration Over Symmetric TLS',
      tactic: 'TA0010',
      tacticName: 'Exfiltration',
      severity: 'critical',
      detected: true,
      description: 'Compressed archive payload (4.8 GB) transferred to external adversary drop server during off-hours.',
      mitigation: 'Enforce egress bandwidth rate limiting and Data Loss Prevention (DLP) packet inspection.',
    },
  ]

  return (
    <Card variant="cyber" className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950/90">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800/80 bg-gradient-to-r from-slate-900/80 via-slate-950 to-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-neon-cyan/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <span>MITRE ATT&CK® Enterprise Tactical Coverage Matrix</span>
              <Badge variant="critical" className="text-[9px] font-mono">
                7 TECHNIQUES ACTIVE
              </Badge>
            </CardTitle>
            <p className="text-xs text-slate-400">
              Interactive mapping of detected telemetry anomalies to standardized MITRE tactics and techniques.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
          <span>Coverage: 88.4%</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* Tactics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {['Initial Access', 'Execution', 'Privilege Escalation', 'C2 Protocols', 'Lateral Movement', 'Exfiltration'].map((tacticName, i) => {
            const tacticTechs = techniques.filter(
              (t) => t.tacticName.toLowerCase().includes(tacticName.toLowerCase().split(' ')[0])
            )

            return (
              <div
                key={i}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex flex-col justify-between space-y-3"
              >
                <div className="border-b border-slate-800 pb-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block truncate">
                    {tacticName}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {tacticTechs.map((tech) => (
                    <button
                      key={tech.id}
                      onClick={() => setSelectedTechnique(tech)}
                      className={`w-full text-left p-2 rounded-lg border transition-all duration-200 text-xs flex flex-col gap-1 ${
                        selectedTechnique?.id === tech.id
                          ? 'border-cyan-400 bg-cyan-950/70 shadow-neon-cyan/30 text-cyan-200'
                          : tech.severity === 'critical'
                          ? 'border-red-500/40 bg-red-950/30 hover:border-red-400 text-red-200'
                          : tech.severity === 'high'
                          ? 'border-amber-500/40 bg-amber-950/30 hover:border-amber-400 text-amber-200'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-bold text-[10px] text-cyan-400">
                          {tech.id}
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                      </div>
                      <span className="font-medium text-[11px] line-clamp-2 leading-tight">
                        {tech.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Technique Deep Forensic Inspection Drawer */}
        {selectedTechnique && (
          <div className="p-4 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-purple-950/30 text-xs space-y-3 shadow-neon-cyan/20 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
                  {selectedTechnique.id}
                </span>
                <h4 className="font-bold text-sm text-slate-100">{selectedTechnique.name}</h4>
                <span className="text-slate-400 font-mono text-[11px]">
                  ({selectedTechnique.tacticName})
                </span>
              </div>

              <Badge
                variant={selectedTechnique.severity === 'critical' ? 'critical' : 'high'}
                className="text-[10px]"
              >
                {selectedTechnique.severity.toUpperCase()} THREAT
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1 font-semibold">
                  Adversary Behavior Description:
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedTechnique.description}</p>
              </div>

              <div>
                <span className="text-emerald-400 font-mono uppercase text-[10px] block mb-1 font-semibold">
                  Recommended SOC Containment & Mitigation:
                </span>
                <p className="text-emerald-200 leading-relaxed">{selectedTechnique.mitigation}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
