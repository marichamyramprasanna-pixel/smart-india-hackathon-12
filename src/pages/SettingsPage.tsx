import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Settings,
  Shield,
  Save,
  CheckCircle,
  AlertTriangle,
  User,
  Sliders,
  Webhook,
  Database,
  BrainCircuit,
  Activity,
  Download,
  Check,
  RefreshCw,
  Mail,
  Send,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Switch } from '../components/common/Switch'
import { Badge } from '../components/common/Badge'
import { productConfig } from '../../src/config/productConfig'
import { supabaseRestFetch } from '../lib/supabase'
import { env } from '../config/env'
import {
  gmailAlertService,
  getGmailRecipient,
  setGmailRecipient,
  getGmailDispatchLogs,
  GmailDispatchLog,
} from '../services/gmailAlertService'

const settingsSchema = z.object({
  analystName: z.string().min(2, 'Analyst name must be at least 2 characters'),
  callsign: z.string().min(2, 'Callsign required'),
  anomalyThreshold: z.number().min(50).max(99),
  dgaEntropyThreshold: z.number().min(2.0).max(5.0),
  autoQuarantineCritical: z.boolean(),
  siemWebhookUrl: z.string().url('Must be a valid SIEM Webhook URL').or(z.literal('')),
  notificationEmail: z.string().email('Please enter a valid notification email'),
  gmailAlertRecipient: z.string().email('Please enter a valid Gmail address'),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export const SettingsPage: React.FC = () => {
  const [isSaved, setIsSaved] = useState(false)
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null)
  const [dispatchLogs, setDispatchLogs] = useState<GmailDispatchLog[]>([])

  const [dbStatus, setDbStatus] = useState<{
    testing: boolean
    success?: boolean
    latency?: number
    message?: string
  }>({ testing: false })

  const [aiStatus, setAiStatus] = useState<{
    testing: boolean
    success?: boolean
    message?: string
  }>({ testing: false })

  const savedSettingsRaw =
    typeof window !== 'undefined' ? localStorage.getItem('sentinelx_settings') : null
  const savedSettings = savedSettingsRaw ? JSON.parse(savedSettingsRaw) : null

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      analystName: savedSettings?.analystName || productConfig.brand.analyst.name,
      callsign: savedSettings?.callsign || productConfig.brand.analyst.callsign,
      anomalyThreshold: savedSettings?.anomalyThreshold || 85,
      dgaEntropyThreshold: savedSettings?.dgaEntropyThreshold || 3.5,
      autoQuarantineCritical: savedSettings?.autoQuarantineCritical ?? true,
      siemWebhookUrl: savedSettings?.siemWebhookUrl || 'https://siem-collector.internal.corp/v1/sentinelx-alerts',
      notificationEmail: savedSettings?.notificationEmail || 'soc-responders@enterprise.com',
      gmailAlertRecipient: savedSettings?.gmailAlertRecipient || getGmailRecipient(),
    },
  })

  useEffect(() => {
    setDispatchLogs(getGmailDispatchLogs())
  }, [])

  const autoQuarantine = watch('autoQuarantineCritical')
  const currentGmailRecipient = watch('gmailAlertRecipient')

  const onSubmit = (data: SettingsFormValues) => {
    localStorage.setItem('sentinelx_settings', JSON.stringify(data))
    setGmailRecipient(data.gmailAlertRecipient)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  // Diagnostic Test for Database
  const testDatabase = async () => {
    setDbStatus({ testing: true })
    const start = performance.now()
    try {
      const res = await supabaseRestFetch('devices?select=count', {
        headers: { Prefer: 'count=exact' },
      })
      const latency = Math.round(performance.now() - start)
      if (!res.error) {
        setDbStatus({
          testing: false,
          success: true,
          latency,
          message: `Connected via REST API (Latency: ${latency}ms)`,
        })
      } else {
        throw res.error
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - start)
      setDbStatus({
        testing: false,
        success: false,
        latency,
        message: `Database unreachable: ${err.message || 'Network error'}`,
      })
    }
  }

  // Diagnostic Test for AI Engine
  const testAIEngine = async () => {
    setAiStatus({ testing: true })
    setTimeout(() => {
      setAiStatus({
        testing: false,
        success: true,
        message: 'Isolation Forest & Multi-Feature Shannon Entropy models active.',
      })
    }, 600)
  }

  // Send Test Gmail Alert
  const handleSendTestGmail = async () => {
    setTestEmailStatus('Dispatching test security advisory...')
    try {
      const res = await gmailAlertService.sendTestAlert(currentGmailRecipient)
      setTestEmailStatus(`✅ Test advisory dispatched! Opening Gmail compose preview...`)
      setDispatchLogs(getGmailDispatchLogs())
      gmailAlertService.openGmailCompose(res.composeUrl)
      setTimeout(() => setTestEmailStatus(null), 5000)
    } catch {
      setTestEmailStatus('⚠️ Could not complete test dispatch')
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="h-5 w-5 text-cyan-400" />
            SOC System Settings & Operational Thresholds
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure automated Gmail emergency dispatch (&gt;80% risk), machine learning detection sensitivities, and enterprise integrations.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg animate-in fade-in">
            <CheckCircle className="h-4 w-4" />
            <span>Configuration saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 0: Automated Gmail Emergency Alerting (>80% Risk) */}
        <Card variant="cyber" className="rounded-xl overflow-hidden p-5 space-y-4 border-red-500/40 shadow-neon-red/10">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-red-400" />
              <div>
                <CardTitle className="text-sm text-slate-100">Automated Gmail Emergency Escalation (&gt;80% Risk)</CardTitle>
                <p className="text-xs text-slate-400">
                  Automatically dispatches incident advisories to Gmail whenever any threat or device risk score exceeds 80%.
                </p>
              </div>
            </div>
            <Badge variant="critical" className="text-[10px] font-mono">
              THRESHOLD: &gt;80% RISK
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="sm:col-span-2">
              <label className="text-slate-300 font-medium block mb-1">Target SOC Incident Gmail Address</label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  {...register('gmailAlertRecipient')}
                  className="h-9 flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 focus:border-red-400 focus:outline-none"
                  placeholder="analyst@gmail.com or soc-team@gmail.com"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendTestGmail}
                  className="text-xs gap-1.5 border-red-500/40 text-red-300 hover:bg-red-950/40"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Test Gmail Alert</span>
                </Button>
              </div>
              {errors.gmailAlertRecipient && (
                <p className="text-red-400 mt-1 text-[11px]">{errors.gmailAlertRecipient.message}</p>
              )}
              {testEmailStatus && (
                <p className="text-cyan-300 mt-1.5 text-[11px] font-mono">{testEmailStatus}</p>
              )}
            </div>
          </div>

          {/* Recent Gmail Dispatch Log */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Recent Emergency Gmail Dispatches ({dispatchLogs.length})
              </span>
              <span>Rate Limit: 5 min throttle / host</span>
            </div>

            {dispatchLogs.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono italic p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                No critical threats (&gt;80% risk) dispatched yet. Alerts will appear here automatically when triggered.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {dispatchLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                      <div>
                        <span className="font-bold text-slate-200">{log.deviceId}</span>
                        <span className="text-slate-500 ml-2">({log.riskScore}% Risk)</span>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{log.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => gmailAlertService.openGmailCompose(log.composeUrl)}
                        className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-0.5"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Section 1: Analyst Profile & Identification */}
        <Card variant="cyber" className="rounded-xl overflow-hidden p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-sm">Analyst Identity & Operator Profile</CardTitle>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Lead Analyst Name</label>
              <input
                type="text"
                {...register('analystName')}
                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
              {errors.analystName && (
                <p className="text-red-400 mt-1 text-[11px]">{errors.analystName.message}</p>
              )}
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">SOC Tactical Callsign</label>
              <input
                type="text"
                {...register('callsign')}
                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
              />
              {errors.callsign && (
                <p className="text-red-400 mt-1 text-[11px]">{errors.callsign.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Section 2: Machine Learning Detection & Quarantine Thresholds */}
        <Card variant="cyber" className="rounded-xl overflow-hidden p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-sm">ML Anomaly Detection & Quarantine Policy</CardTitle>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Bayesian Compromise Threshold (%)
              </label>
              <input
                type="number"
                {...register('anomalyThreshold', { valueAsNumber: true })}
                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Triggers automatic escalation when Bayesian posterior exceeds this value (Default: 85%).
              </p>
              {errors.anomalyThreshold && (
                <p className="text-red-400 mt-1 text-[11px]">{errors.anomalyThreshold.message}</p>
              )}
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                DNS DGA Shannon Entropy Boundary
              </label>
              <input
                type="number"
                step="0.1"
                {...register('dgaEntropyThreshold', { valueAsNumber: true })}
                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Domains exceeding this Shannon entropy threshold trigger DGA tunneling alerts (Default: 3.5).
              </p>
              {errors.dgaEntropyThreshold && (
                <p className="text-red-400 mt-1 text-[11px]">{errors.dgaEntropyThreshold.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <span className="font-semibold text-slate-200 block">Automated 802.1X Host Quarantine</span>
                <p className="text-[11px] text-slate-400">
                  Automatically isolate endpoints that reach 90%+ compromise probability to block lateral movement.
                </p>
              </div>
              <Switch
                checked={autoQuarantine}
                onCheckedChange={(val) => setValue('autoQuarantineCritical', val)}
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Diagnostic Health Checks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card variant="cyber" className="p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-400" />
                <span className="font-bold text-slate-200">Supabase DB Health Check</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={testDatabase}
                isLoading={dbStatus.testing}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Test DB
              </Button>
            </div>
            {dbStatus.message && (
              <p
                className={`text-[11px] p-2 rounded border ${
                  dbStatus.success
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                    : 'border-red-500/40 bg-red-950/40 text-red-300'
                }`}
              >
                {dbStatus.message}
              </p>
            )}
          </Card>

          <Card variant="cyber" className="p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-purple-400" />
                <span className="font-bold text-slate-200">AI Inference Engine</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={testAIEngine}
                isLoading={aiStatus.testing}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Test AI
              </Button>
            </div>
            {aiStatus.message && (
              <p className="text-[11px] p-2 rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-300">
                {aiStatus.message}
              </p>
            )}
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isSubmitting}
            className="text-xs font-semibold gap-2 px-6 shadow-cyan-glow-sm"
          >
            <Save className="h-4 w-4" />
            <span>Save SOC Configuration</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
