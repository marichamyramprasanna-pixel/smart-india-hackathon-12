import React, { useState } from 'react'
import {
  Lock,
  Shield,
  Key,
  Terminal,
  Play,
  CheckCircle,
  AlertTriangle,
  Flame,
  Copy,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import {
  ingestSecureTelemetry,
  TelemetryIngestionPayload,
  IngestionResponse,
} from '../../api/secureIngestion'
import { useDevices } from '../../hooks/useDevices'
import { useAlerts } from '../../hooks/useAlerts'

export const SecureIngestionConsole: React.FC = () => {
  const { refetch: refetchDevices } = useDevices()
  const { refetch: refetchAlerts } = useAlerts()

  const [secretKey, setSecretKey] = useState('sentinelx_enterprise_hmac_secret_2026')
  const [signature, setSignature] = useState('hmac-sha256-a9b8c7d6e5f43210')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<IngestionResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const defaultPayload: TelemetryIngestionPayload = {
    sensorId: 'SENSOR-VLAN-04',
    timestamp: new Date().toISOString(),
    nonce: `NONCE-${Math.random().toString(36).substring(2, 10)}`,
    deviceId: 'DEVICE-042',
    hostname: 'FIN-WS-042.internal.corp',
    ipAddress: '10.0.4.42',
    macAddress: '00:1A:2B:3C:4D:5E',
    metrics: {
      outboundBytes: 4800000000,
      inboundBytes: 342000000,
      dnsQueriesPerMin: 342,
      failedLogins24h: 14,
      activeSockets: 18,
      queriedDomains: ['d3x9a10-tunnel-c2.biz', 'internal.corp', 'update.windows.com'],
    },
  }

  const [jsonText, setJsonText] = useState(JSON.stringify(defaultPayload, null, 2))

  const handleSendIngestion = async () => {
    setIsLoading(true)
    try {
      const parsed: TelemetryIngestionPayload = JSON.parse(jsonText)
      // Update timestamp to current to prevent drift error
      parsed.timestamp = new Date().toISOString()
      setJsonText(JSON.stringify(parsed, null, 2))

      const res = await ingestSecureTelemetry(parsed, signature)
      setResponse(res)
      await refetchDevices()
      await refetchAlerts()
    } catch (err: any) {
      setResponse({
        success: false,
        ingestionId: 'ERR-PARSE',
        timestamp: new Date().toISOString(),
        anomalyDetected: false,
        calculatedRisk: 0,
        riskTier: 'NOMINAL',
        flags: [],
        message: 'JSON Syntax Error',
        error: err.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadCleanPayload = () => {
    const clean: TelemetryIngestionPayload = {
      sensorId: 'SENSOR-VLAN-01',
      timestamp: new Date().toISOString(),
      nonce: `NONCE-${Math.random().toString(36).substring(2, 10)}`,
      deviceId: 'WS-012',
      hostname: 'MKT-LAPTOP-012.internal.corp',
      ipAddress: '10.0.1.12',
      macAddress: '52:54:00:12:34:56',
      metrics: {
        outboundBytes: 150000000,
        inboundBytes: 280000000,
        dnsQueriesPerMin: 18,
        failedLogins24h: 0,
        activeSockets: 6,
        queriedDomains: ['google.com', 'slack.com', 'internal.corp'],
      },
    }
    setJsonText(JSON.stringify(clean, null, 2))
  }

  const handleCopyCurl = () => {
    const curl = `curl -X POST https://cgkdtqtrbkrcmymzvuaa.supabase.co/rest/v1/devices \\
  -H "apikey: sb_publishable_vpI3rBVolg6-h1KTcUAjbQ_fM59c454" \\
  -H "Authorization: Bearer sb_publishable_vpI3rBVolg6-h1KTcUAjbQ_fM59c454" \\
  -H "X-SentinelX-Signature: ${signature}" \\
  -H "Content-Type: application/json" \\
  -d '${jsonText.replace(/\n/g, '').replace(/\s+/g, ' ')}'`

    navigator.clipboard.writeText(curl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card variant="cyber" className="rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/40 bg-slate-950/90">
      <CardHeader className="pb-3 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-300 shadow-neon-cyan/20">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <span>Cryptographic Telemetry Ingestion & Injection API</span>
                <Badge variant="healthy" className="text-[9px] font-mono">
                  HMAC-SHA256 VERIFIED
                </Badge>
              </CardTitle>
              <p className="text-xs text-slate-400">
                Tamper-resistant endpoint telemetry ingestion pipeline with automated anomaly evaluation and replay attack defense.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCurl}
            className="text-xs gap-1.5 border-slate-700 hover:border-cyan-500/40 h-7"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>Copy cURL Command</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Security Headers Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-400">X-SentinelX-Signature (HMAC-SHA256):</span>
              <span className="text-[10px] text-cyan-400 font-mono">Protected</span>
            </div>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="h-8 w-full rounded-md border border-slate-700 bg-slate-950 px-2.5 text-xs text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-400">Shared Ingestion Secret Key:</span>
              <span className="text-[10px] text-purple-400 font-mono">256-Bit</span>
            </div>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="h-8 w-full rounded-md border border-slate-700 bg-slate-950 px-2.5 text-xs text-purple-300 font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {/* JSON Request Editor & Actions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-300 font-medium">JSON Ingestion Payload (POST /api/v1/telemetry):</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadCleanPayload}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline"
              >
                Load Clean Host Payload
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setJsonText(JSON.stringify(defaultPayload, null, 2))}
                className="text-[11px] font-mono text-red-400 hover:text-red-300 underline"
              >
                Load Compromised C2 Payload
              </button>
            </div>
          </div>

          <textarea
            rows={9}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-xs font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none leading-relaxed select-text"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleSendIngestion}
            isLoading={isLoading}
            className="gap-2 text-xs font-semibold px-6 shadow-cyan-glow-sm"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Send Signed Telemetry Payload</span>
          </Button>
        </div>

        {/* Response Box */}
        {response && (
          <div
            className={`p-4 rounded-xl border space-y-2.5 animate-in fade-in duration-300 ${
              response.success
                ? response.anomalyDetected
                  ? 'border-red-500/40 bg-red-950/20 text-red-200'
                  : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                : 'border-amber-500/40 bg-amber-950/20 text-amber-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold">HTTP 200 Ingestion Response:</span>
                <span className="text-[11px] opacity-80">[{response.ingestionId}]</span>
              </div>
              <Badge
                variant={
                  response.riskTier === 'CRITICAL'
                    ? 'critical'
                    : response.riskTier === 'HIGH'
                    ? 'high'
                    : 'healthy'
                }
              >
                {response.riskTier} RISK ({response.calculatedRisk}%)
              </Badge>
            </div>

            <p className="text-xs font-mono leading-relaxed">{response.message}</p>

            {response.flags.length > 0 && (
              <div className="space-y-1 text-xs font-mono">
                <span className="font-semibold block opacity-90">Evaluated Anomaly Indicators:</span>
                <ul className="list-disc list-inside space-y-0.5 opacity-85">
                  {response.flags.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {response.error && (
              <p className="text-xs font-mono text-red-400">Error Detail: {response.error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
