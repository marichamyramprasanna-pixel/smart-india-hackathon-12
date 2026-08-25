import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Globe,
  Network,
  Clock,
  Laptop,
  BrainCircuit,
  FileText,
  Settings,
  HelpCircle,
  ShieldCheck,
  Bot,
  X,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { productConfig } from '../../config/productConfig'
import { useDemoScenario } from '../../context/DemoScenarioContext'

interface NavItemConfig {
  name: string
  href: string
  icon: React.ReactNode
  color: string
  badge?: string
}

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { currentStage } = useDemoScenario()

  const navItems: NavItemConfig[] = [
    {
      name: 'Overview',
      href: '/',
      icon: <LayoutDashboard className="h-4 w-4 text-cyan-400" />,
      color: 'hover:text-cyan-300 hover:bg-cyan-950/40 border-cyan-500/30',
    },
    {
      name: 'Live Telemetry',
      href: '/live',
      icon: <Activity className="h-4 w-4 text-emerald-400" />,
      color: 'hover:text-emerald-300 hover:bg-emerald-950/40 border-emerald-500/30',
      badge: '14.2k/s',
    },
    {
      name: 'Threat Detection',
      href: '/threats',
      icon: <ShieldAlert className="h-4 w-4 text-red-400" />,
      color: 'hover:text-red-300 hover:bg-red-950/40 border-red-500/30',
      badge: currentStage.compromiseProbability >= 80 ? 'CRITICAL' : undefined,
    },
    {
      name: '3D Spatial Network',
      href: '/network-3d',
      icon: <Globe className="h-4 w-4 text-sky-400" />,
      color: 'hover:text-sky-300 hover:bg-sky-950/40 border-sky-500/30',
      badge: '3D',
    },
    {
      name: 'Visual Attack Graph',
      href: '/attack-graph',
      icon: <Network className="h-4 w-4 text-orange-400" />,
      color: 'hover:text-orange-300 hover:bg-orange-950/40 border-orange-500/30',
    },
    {
      name: 'Attack Timeline',
      href: '/timeline',
      icon: <Clock className="h-4 w-4 text-indigo-400" />,
      color: 'hover:text-indigo-300 hover:bg-indigo-950/40 border-indigo-500/30',
    },
    {
      name: 'Devices Inventory',
      href: '/devices',
      icon: <Laptop className="h-4 w-4 text-blue-400" />,
      color: 'hover:text-blue-300 hover:bg-blue-950/40 border-blue-500/30',
    },
    {
      name: 'AI Anomaly Hub',
      href: '/ai-analysis',
      icon: <BrainCircuit className="h-4 w-4 text-purple-400" />,
      color: 'hover:text-purple-300 hover:bg-purple-950/40 border-purple-500/30',
    },
    {
      name: 'Sentinel AI Chat',
      href: '/ai-chat',
      icon: <Bot className="h-4 w-4 text-fuchsia-400" />,
      color: 'hover:text-fuchsia-300 hover:bg-fuchsia-950/40 border-fuchsia-500/30',
      badge: 'VOICE 🎙️',
    },
    {
      name: 'Forensic Reports',
      href: '/reports',
      icon: <FileText className="h-4 w-4 text-teal-400" />,
      color: 'hover:text-teal-300 hover:bg-teal-950/40 border-teal-500/30',
    },
    {
      name: 'SOC Settings',
      href: '/settings',
      icon: <Settings className="h-4 w-4 text-slate-400" />,
      color: 'hover:text-slate-200 hover:bg-slate-900/60 border-slate-700',
    },
    {
      name: 'Platform Architecture',
      href: '/faq',
      icon: <HelpCircle className="h-4 w-4 text-slate-400" />,
      color: 'hover:text-slate-200 hover:bg-slate-900/60 border-slate-700',
    },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-slate-950/95 lg:bg-slate-950/85 backdrop-blur-2xl border-r border-slate-800/80 transition-transform duration-300 lg:translate-x-0 shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/50 shadow-neon-cyan/40">
              <ShieldCheck className="h-5 w-5 text-cyan-300" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 bg-clip-text text-transparent">
                  {productConfig.brand.name}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  v3.5
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight">
                AI Defense Platform
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-slate-100 lg:hidden"
            aria-label="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Status Pill Bar */}
        <div className="px-4 py-2 border-b border-slate-800/60 bg-gradient-to-r from-slate-900/90 to-slate-950/90">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[11px] text-slate-300 font-medium">SOC Engine Online</span>
            </div>
            <span className="font-mono text-[10px] text-purple-300 bg-purple-950/60 border border-purple-500/40 px-1.5 py-0.5 rounded">
              PostgREST
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-none">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => onClose()}
              className={({ isActive }) =>
                cn(
                  'group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 border',
                  isActive
                    ? 'border-cyan-500/50 bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-purple-950/40 text-cyan-200 shadow-neon-cyan/20'
                    : `border-transparent text-slate-400 hover:text-slate-200 ${item.color}`
                )
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1 rounded-lg bg-slate-900/80 border border-slate-800 group-hover:border-slate-700 transition-colors shrink-0">
                  {item.icon}
                </div>
                <span className="truncate">{item.name}</span>
              </div>

              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Analyst Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-mono font-bold text-xs text-white shadow-neon-purple/30">
              SOC
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {productConfig.brand.analyst.name}
              </p>
              <p className="text-[10px] text-cyan-400 font-mono truncate">
                {productConfig.brand.analyst.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
