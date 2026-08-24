import React from 'react'
import {
  Radio,
  ShieldAlert,
  Flame,
  Globe,
  Lock,
  Activity,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import { useDemoScenario } from '../../context/DemoScenarioContext'
import { useAlerts } from '../../hooks/useAlerts'
import { useDevices } from '../../hooks/useDevices'

export const LiveThreatTicker: React.FC = () => {
  const { currentStage } = useDemoScenario()
  const { alerts } = useAlerts()
  const { devices } = useDevices()

  const tickerItems = [
    {
      icon: <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />,
      text: 'INGESTION ACTIVE: 14,280 PKTS/S VIA NETFLOW SENSORS',
      color: 'text-cyan-300',
    },
    {
      icon: <Flame className="h-3 w-3 text-red-400 animate-pulse" />,
      text: 'ADVERSARY ATTRIBUTION: 185.220.101.5 (C2 COBALT STRIKE)',
      color: 'text-red-300',
    },
    {
      icon: <Globe className="h-3 w-3 text-purple-400" />,
      text: 'DNS ENTROPY: 4.88 BITS/CHAR (DGA CLASSIFICATION > 3.5)',
      color: 'text-purple-300',
    },
    {
      icon: <Lock className="h-3 w-3 text-amber-400" />,
      text: '802.1X ISOLATION PROTOCOL: ACTIVE DEFENSE MODE READY',
      color: 'text-amber-300',
    },
    {
      icon: <Activity className="h-3 w-3 text-emerald-400" />,
      text: `MONITORED HARDWARE: ${devices.length} ENDPOINTS SYNCHRONIZED`,
      color: 'text-emerald-300',
    },
  ]

  return (
    <div className="relative overflow-hidden border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md h-7 flex items-center select-none">
      {/* Left Static Indicator */}
      <div className="z-10 bg-slate-950/95 px-3 py-1 border-r border-slate-800 flex items-center gap-1.5 shrink-0 shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="text-[10px] font-mono font-bold tracking-widest text-slate-200 uppercase">
          SOC BROADCAST
        </span>
      </div>

      {/* Marquee Ticker Stream */}
      <div className="flex-1 overflow-hidden relative flex items-center whitespace-nowrap">
        <div className="flex items-center gap-8 animate-marquee font-mono text-[11px]">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0">
              {item.icon}
              <span className={`font-semibold tracking-wider ${item.color}`}>
                {item.text}
              </span>
              <span className="text-slate-700">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
