import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Globe,
  Server,
  Laptop,
  ShieldAlert,
  ArrowRight,
  Flame,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Badge } from '../common/Badge'
import { useDevices } from '../../hooks/useDevices'

export interface AttackNode {
  id: string
  label: string
  role: string
  ip: string
  status: 'critical' | 'high' | 'medium' | 'external'
  risk: number
  hopNumber: number
  iconType: 'internet' | 'c2' | 'endpoint' | 'database' | 'secondary'
  anomalies: string[]
}

interface AttackGraphCanvasProps {
  onSelectNode?: (node: AttackNode) => void
  selectedNodeId?: string
}

export const AttackGraphCanvas: React.FC<AttackGraphCanvasProps> = ({
  onSelectNode,
  selectedNodeId,
}) => {
  const { devices } = useDevices()

  const compromised = devices.filter((d) => d.status === 'COMPROMISED')
  const suspicious = devices.filter((d) => d.status === 'SUSPICIOUS')
  const primaryThreat = compromised[0] || suspicious[0] || devices[0]

  const attackNodes: AttackNode[] = [
    {
      id: 'NODE-INET',
      label: 'Public Internet Gateway',
      role: 'External WAN Ingress',
      ip: '198.51.100.1',
      status: 'external',
      risk: 10,
      hopNumber: 0,
      iconType: 'internet',
      anomalies: [],
    },
    {
      id: 'C2-RELAY',
      label: 'External C2 Server',
      role: 'Adversary Command & Control',
      ip: '185.220.101.5',
      status: 'critical',
      risk: 99,
      hopNumber: 1,
      iconType: 'c2',
      anomalies: ['Unclassified Bulletproof ASN 49302', 'Target of periodic C2 beacon pulses'],
    },
    ...(primaryThreat
      ? [
          {
            id: primaryThreat.id,
            label: `${primaryThreat.hostname} (Patient Zero)`,
            role: `Compromised ${primaryThreat.department} Endpoint`,
            ip: primaryThreat.ip,
            status: 'critical' as const,
            risk: primaryThreat.riskScore || 94,
            hopNumber: 2,
            iconType: 'endpoint' as const,
            anomalies: [
              'High Shannon entropy DNS DGA queries',
              'Periodic C2 socket beaconing',
              'Volumetric data exfiltration',
            ],
          },
        ]
      : []),
    {
      id: 'SERVER-07',
      label: 'DB-CORE-07',
      role: 'Core Production Database Server',
      ip: '10.0.2.7',
      status: 'high',
      risk: 78,
      hopNumber: 3,
      iconType: 'database',
      anomalies: ['Unauthorized SMB access probe', 'Pass-the-hash ticket reuse'],
    },
    ...(suspicious.length > 0 && suspicious[0].id !== primaryThreat?.id
      ? [
          {
            id: suspicious[0].id,
            label: suspicious[0].hostname,
            role: `${suspicious[0].department} Endpoint (Probed)`,
            ip: suspicious[0].ip,
            status: 'medium' as const,
            risk: suspicious[0].riskScore || 58,
            hopNumber: 4,
            iconType: 'secondary' as const,
            anomalies: ['Received secondary RPC discovery sweep'],
          },
        ]
      : [
          {
            id: 'DEVICE-118',
            label: 'ENG-LAP-118',
            role: 'Secondary Probed Laptop',
            ip: '10.0.4.118',
            status: 'medium' as const,
            risk: 58,
            hopNumber: 4,
            iconType: 'secondary' as const,
            anomalies: ['Received secondary RPC discovery sweep'],
          },
        ]),
  ]

  const activeSelected = selectedNodeId || primaryThreat?.id || 'NODE-INET'

  return (
    <Card variant="cyber" className="rounded-xl overflow-hidden shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm">Multi-Hop Attack Path & Lateral Propagation Graph</CardTitle>
          <p className="text-xs text-slate-400">
            Visual progression of unauthorized hops from external C2 infrastructure to internal
            high-value database assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="critical" pulse className="text-[10px] font-mono">
            PATH CONFIRMED ({primaryThreat ? `${primaryThreat.riskScore}% RISK` : '94% CONFIDENCE'})
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[700px] flex items-center justify-between relative py-6">
          {/* Connecting Line Background */}
          <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-1 bg-slate-800 -z-0" />
          <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 via-red-500 to-orange-500 opacity-75 -z-0" />

          {attackNodes.map((node) => {
            const isSelected = activeSelected === node.id
            const isCompromised = node.status === 'critical'
            const isSuspicious = node.status === 'high'

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode?.(node)}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
              >
                {/* Hop Step Number Badge */}
                <span className="mb-2 font-mono text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                  HOP 0{node.hopNumber}
                </span>

                {/* Node Orb with Glow */}
                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/80 shadow-cyan-glow scale-110'
                      : isCompromised
                      ? 'border-red-500/80 bg-red-950/80 shadow-red-glow'
                      : isSuspicious
                      ? 'border-orange-500/80 bg-orange-950/80 shadow-amber-glow'
                      : 'border-slate-700 bg-slate-900 shadow-md'
                  }`}
                >
                  {node.iconType === 'internet' && <Globe className="h-6 w-6 text-cyan-400" />}
                  {node.iconType === 'c2' && (
                    <Flame className="h-6 w-6 text-red-400 animate-pulse" />
                  )}
                  {node.iconType === 'endpoint' && <Laptop className="h-6 w-6 text-red-300" />}
                  {node.iconType === 'database' && <Server className="h-6 w-6 text-orange-400" />}
                  {node.iconType === 'secondary' && <Laptop className="h-6 w-6 text-amber-400" />}
                </div>

                {/* Node Details Below */}
                <div className="mt-3 text-center max-w-[130px]">
                  <p className="font-mono font-bold text-xs text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {node.id}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{node.role}</p>
                  <p className="font-mono text-[10px] text-slate-500 mt-0.5">{node.ip}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
