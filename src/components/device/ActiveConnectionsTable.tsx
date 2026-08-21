import React from 'react'
import { NetworkConnection } from '../../types/device'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { formatBytes } from '../../utils/formatters'
import { useInvestigation } from '../../context/InvestigationContext'

interface ActiveConnectionsTableProps {
  connections: NetworkConnection[]
}

export const ActiveConnectionsTable: React.FC<ActiveConnectionsTableProps> = ({ connections }) => {
  const { blockIp, isIpBlocked } = useInvestigation()

  return (
    <Card variant="cyber" className="rounded-xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Active Network Sockets & Sinks</CardTitle>
          <span className="font-mono text-xs text-slate-400">
            {connections.length} Monitored Flows
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-2.5 px-3.5">Protocol</th>
                <th className="py-2.5 px-3.5">Source Socket</th>
                <th className="py-2.5 px-3.5">Destination Remote</th>
                <th className="py-2.5 px-3.5">Threat Level</th>
                <th className="py-2.5 px-3.5">Data Egress</th>
                <th className="py-2.5 px-3.5">Reputation</th>
                <th className="py-2.5 px-3.5 text-right">Firewall Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {connections.map((conn) => {
                const blocked = isIpBlocked(conn.destinationIp)

                return (
                  <tr key={conn.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-3.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {conn.protocol}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-300">
                      {conn.sourceIp}:{conn.sourcePort}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-200">
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
                          conn.threatLevel === 'critical' ? 'critical' :
                          conn.threatLevel === 'high' ? 'high' : 'low'
                        }
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
                    <td className="py-3 px-3.5 text-right">
                      {conn.destinationIp.startsWith('10.') ? (
                        <span className="text-[10px] text-slate-500 font-sans">Internal Hop</span>
                      ) : (
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
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
