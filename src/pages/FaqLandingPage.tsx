import React from 'react'
import { LandingHero } from '../components/public/LandingHero'
import { FAQAccordion } from '../components/public/FAQAccordion'
import { NewsletterSection } from '../components/public/NewsletterSection'
import { productConfig } from '../config/productConfig'
import { ShieldCheck, BrainCircuit, Activity, Lock } from 'lucide-react'

export const FaqLandingPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Core Product Story & Architecture Narrative */}
      <LandingHero />

      {/* 2. Platform Telemetry & Social Proof Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 text-center space-y-1">
          <span className="text-2xl sm:text-3xl font-display font-extrabold text-cyan-400 font-mono-numbers">
            {productConfig.stats.monitoredEntities}
          </span>
          <p className="text-xs text-slate-300 font-semibold">Network Entities Monitored</p>
          <p className="text-[11px] text-slate-500">Continuous passive flow & agent telemetry</p>
        </div>

        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 text-center space-y-1">
          <span className="text-2xl sm:text-3xl font-display font-extrabold text-purple-300 font-mono-numbers">
            {productConfig.stats.aiConfidenceRate}
          </span>
          <p className="text-xs text-slate-300 font-semibold">AI Detection Confidence</p>
          <p className="text-[11px] text-slate-500">Calibrated over 30-day baseline distributions</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 text-center space-y-1">
          <span className="text-2xl sm:text-3xl font-display font-extrabold text-emerald-400 font-mono-numbers">
            {productConfig.stats.coverageHours}
          </span>
          <p className="text-xs text-slate-300 font-semibold">Behavioural SOC Monitoring</p>
          <p className="text-[11px] text-slate-500">Automated quarantine & triage assist</p>
        </div>
      </div>

      {/* 3. Technical FAQ Accordion */}
      <FAQAccordion />

      {/* 4. Zod-validated Newsletter Brief Signup */}
      <NewsletterSection />
    </div>
  )
}
