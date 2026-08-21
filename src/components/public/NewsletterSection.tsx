import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, CheckCircle, AlertCircle, Send, Lock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Button } from '../common/Button'
import { productConfig } from '../../config/productConfig'

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
})

type NewsletterFormValues = z.infer<typeof newsletterSchema>

export const NewsletterSection: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: NewsletterFormValues) => {
    setSubmitError(null)
    try {
      // Simulated secure newsletter subscription
      await new Promise((resolve) => setTimeout(resolve, 800))
      setIsSuccess(true)
      reset()
    } catch {
      setSubmitError(productConfig.newsletter.errorMessage)
    }
  }

  return (
    <Card variant="cyber" className="rounded-xl overflow-hidden p-6 sm:p-8 relative">
      <div className="max-w-2xl space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
            SECURITY INTELLIGENCE BRIEF
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
            {productConfig.newsletter.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            {productConfig.newsletter.subtitle}
          </p>
        </div>

        {isSuccess ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold">{productConfig.newsletter.successMessage}</p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">
                Zero-day behavioural intelligence and threat analysis briefs will be delivered to your inbox.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="analyst@enterprise.com"
                  {...register('email')}
                  className={`h-10 w-full rounded-lg border bg-slate-900/90 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 ${
                    errors.email ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isSubmitting}
                className="text-xs font-semibold gap-1.5 h-10 px-5"
              >
                <span>{productConfig.newsletter.cta}</span>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>

            {errors.email && (
              <p className="text-xs text-red-400 flex items-center gap-1 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.email.message}
              </p>
            )}

            {submitError && (
              <p className="text-xs text-red-400 flex items-center gap-1 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                {submitError}
              </p>
            )}

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <Lock className="h-3 w-3" />
              <span>We never sell data or expose credentials. Unsubscribe at any time.</span>
            </div>
          </form>
        )}
      </div>
    </Card>
  )
}
