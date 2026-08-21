import React from 'react'
import { KeyRound, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Badge } from '../common/Badge'

export const AuthAnomalyMatrix: React.FC = () => {
  const authRecords = [
    {
      time: '09:12:04',
      user: 'mvance_adm',
      method: 'Kerberos Ticket (TGS)',
      target: 'FIN-WS-042 (Local Admin)',
      status: 'ANOMALOUS_HOURS',
      details: 'Elevated Kerberos ticket generated outside normal 08:30-17:00 shift profile',
    },
    {
      time: '09:12:45',
      user: 'root',
      method: 'SSH Password',
      target: '10.0.2.7 (DB-CORE-07)',
      status: 'FAILURE (BRUTE)',
      details: '14 rapid password attempts in 15 seconds against database server',
    },
    {
      time: '09:23:18',
      user: 'svc_backup_db',
      method: 'NTLMv2 / Pass-the-Hash',
      target: '10.0.2.7 (DB-CORE-07:445)',
      status: 'CRITICAL LATERAL',
      details: 'Unauthorized administrative SMB session established from finance host',
    },
  ]

  return (
    <Card variant="cyber" className="rounded-xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-orange-400" />
            <CardTitle className="text-sm">Authentication Anomalies & Credential Misuse</CardTitle>
          </div>
          <Badge variant="critical" className="text-[10px] font-mono">
            3 ANOMALOUS LOGONS
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-800/60">
          {authRecords.map((rec, idx) => (
            <div key={idx} className="p-3.5 hover:bg-slate-900/40 transition-colors text-xs">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-semibold">{rec.time}</span>
                  <span className="font-mono font-bold text-slate-200">User: {rec.user}</span>
                  <span className="text-slate-400">({rec.method})</span>
                </div>
                <Badge
                  variant={rec.status.includes('CRITICAL') ? 'critical' : 'high'}
                  className="text-[9px] font-mono"
                >
                  {rec.status}
                </Badge>
              </div>
              <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                {rec.details}
              </p>
              <div className="mt-1 font-mono text-[10px] text-slate-500">
                Target: {rec.target}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
