import React, { useState } from 'react'
import { NetworkConnection } from '../../types/device'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { formatBytes } from '../../utils/formatters'
import { useInvestigation } from '../../context/InvestigationContext'
import { DeepPacketInspectorModal } from '../network/DeepPacketInspectorModal'
import { Binary, Eye } from 'lucide-react'

interface ActiveConnectionsTableProps {
  connections: NetworkConnection[]
}

export const ActiveConnectionsTable: React.FC<ActiveConnectionsTableProps> = ({ connections }) => {
  const { blockIp, isIpBlocked } = useInvestigation()
  const [inspectingConn, setInspectingConn] = useState<NetworkConnection | null>(null)

  return (
    <Card variant="cyber" className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950/80">
      <CardHeader className="pb-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              <Binary className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm">Active Network Sockets & Packet Flows</CardTitle>
              <p className="text-[11px] text-slate-400">Click any row to inspect deep hex payloads</p>
            </div>
          </div>
          <span className="font-mono text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md">
            {connections.length} Monitored Flows
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-2.5 px-3.5">Protocol</th>
                <th className="py-2.5 px-3.5">Source Socket</th>
                <th className="py-2.5 px-3.5">Destination Remote</th>
                <th className="py-2.5 px-3.5">Threat Level</th>
                <th className="py-2.5 px-3.5">Data Egress</th>
                <th className="py-2.5 px-3.5">Reputation</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {connections.map((conn) => {
                const blocked = isIpBlocked(conn.destinationIp)

                return (
                  <tr
                    key={conn.id}
                    onClick={() => setInspectingConn(conn)}
                    className="hover:bg-cyan-950/20 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
                        {conn.protocol}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-300">
                      {conn.sourceIp}:{conn.sourcePort}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {conn.destinationIp}:{conn.destinationPort}
                      </div>
                      {conn.destinationHostname && (
                        <div className="text-[10px] text-slate-400 font-sans truncate max-w-xs">
                          {conn.destinationHostname}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3.5">
                      <Badge
                        variant={
                          conn.threatLevel === 'critical'
                            ? 'critical'
                            : conn.threatLevel === 'high'
                            ? 'high'
                            : 'healthy'
                        }
                        pulse={conn.threatLevel === 'critical'}
                        className="text-[9px]"
                      >
                        {conn.threatLevel}
                      </Badge>
                    </td>
                    <td className="py-3 px-3.5 text-slate-200">
                      ↑ {formatBytes(conn.bytesSent)} / ↓ {formatBytes(conn.bytesReceived)}
                    </td>
                    <td className="py-3 px-3.5 text-slate-400 font-sans text-[11px] max-w-xs truncate">
                      {conn.reputation}
                    </td>
                    <td className="py-3 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInspectingConn(conn)}
                          className="h-6 px-2 text-[10px] gap-1 text-cyan-300 hover:bg-cyan-950/40"
                          title="Inspect Packet Hex"
                        >
                          <Eye className="h-3 w-3" />
                          <span>DPI</span>
                        </Button>

                        {!conn.destinationIp.startsWith('10.') && (
                          <Button
                            variant={blocked ? 'secondary' : 'destructive'}
                            size="sm"
                            onClick={() => blockIp(conn.destinationIp, 'Drop malicious C2 IP')}
                            disabled={blocked}
                            className="h-6 px-2 text-[10px] font-sans"
                          >
                            {blocked ? 'Blocked' : 'Block IP'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Deep Packet Inspector Modal */}
      <DeepPacketInspectorModal
        isOpen={Boolean(inspectingConn)}
        onClose={() => setInspectingConn(null)}
        packet={inspectingConn}
      />
    </Card>
  )
}
