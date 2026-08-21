import React, { useState } from 'react'
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
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Switch } from '../components/common/Switch'
import { productConfig } from '../../src/config/productConfig'

const settingsSchema = z.object({
  analystName: z.string().min(2, 'Analyst name must be at least 2 characters'),
  callsign: z.string().min(2, 'Callsign required'),
  anomalyThreshold: z.number().min(50).max(99),
  dgaEntropyThreshold: z.number().min(2.0).max(5.0),
  autoQuarantineCritical: z.boolean(),
  siemWebhookUrl: z.string().url('Must be a valid SIEM Webhook URL').or(z.literal('')),
  notificationEmail: z.string().email('Please enter a valid notification email'),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export const SettingsPage: React.FC = () => {
  const [isSaved, setIsSaved] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      analystName: productConfig.brand.analyst.name,
      callsign: productConfig.brand.analyst.callsign,
      anomalyThreshold: 85,
      dgaEntropyThreshold: 3.5,
      autoQuarantineCritical: true,
      siemWebhookUrl: 'https://siem-collector.internal.corp/v1/sentinelx-alerts',
      notificationEmail: 'soc-responders@enterprise.com',
    },
  })

  const autoQuarantine = watch('autoQuarantineCritical')

  const onSubmit = async (data: SettingsFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              CONFIGURATION
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
            SOC Platform & AI Detection Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure machine learning anomaly thresholds, automated quarantine policies, and analyst credentials.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs font-medium animate-in fade-in-0">
            <CheckCircle className="h-4 w-4" />
            <span>Settings successfully committed</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Analyst Profile */}
        <Card variant="cyber" className="rounded-xl overflow-hidden p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-sm">Analyst Profile & Credentials</CardTitle>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Analyst Full Name</label>
              <input
                type="text"
                {...register('analystName')}
                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
              {errors.analystName && <p className="text-red-400 mt-1 text-[11px]">{errors.analystName.message}</p>}
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">SOC Tactical Callsign</label>
              <input
                type="text"
                {...register('callsign')}
                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
              />
              {errors.callsign && <p className="text-red-400 mt-1 text-[11px]">{errors.callsign.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 font-medium block mb-1">Alert Notification Email</label>
              <input
                type="email"
                {...register('notificationEmail')}
                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
              {errors.notificationEmail && <p className="text-red-400 mt-1 text-[11px]">{errors.notificationEmail.message}</p>}
            </div>
          </div>
        </Card>

        {/* Section 2: AI Sensitivity & Detection Thresholds */}
        <Card variant="cyber" className="rounded-xl overflow-hidden p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="h-4 w-4 text-purple-400" />
            <CardTitle className="text-sm">AI Anomaly Sensitivity & Bayesian Calibration</CardTitle>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Critical Alert Compromise Threshold (%)
              </label>
              <input
                type="number"
                {...register('anomalyThreshold', { valueAsNumber: true })}
                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Triggers automatic escalation when Bayesian posterior exceeds this value (Default: 85%).
              </p>
              {errors.anomalyThreshold && <p className="text-red-400 mt-1 text-[11px]">{errors.anomalyThreshold.message}</p>}
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
              {errors.dgaEntropyThreshold && <p className="text-red-400 mt-1 text-[11px]">{errors.dgaEntropyThreshold.message}</p>}
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

        {/* Section 3: Integrations & Webhooks */}
        <Card variant="cyber" className="rounded-xl overflow-hidden p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Webhook className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-sm">SIEM / SOAR Webhook Integrations</CardTitle>
          </div>

          <div className="text-xs">
            <label className="text-slate-300 font-medium block mb-1">SIEM Event Ingestion Webhook URL</label>
            <input
              type="text"
              {...register('siemWebhookUrl')}
              className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
            />
            {errors.siemWebhookUrl && <p className="text-red-400 mt-1 text-[11px]">{errors.siemWebhookUrl.message}</p>}
          </div>
        </Card>

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
