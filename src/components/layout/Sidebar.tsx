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
  ShieldBan,
  Archive,
  Bot,
  Mail,
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
      name: 'Blocked Devices',
      href: '/blocked-devices',
      icon: <ShieldBan className="h-4 w-4 text-rose-400" />,
      color: 'hover:text-rose-300 hover:bg-rose-950/40 border-rose-500/30',
      badge: 'QUARANTINE',
    },
    {
      name: 'Deleted Devices',
      href: '/deleted-devices',
      icon: <Archive className="h-4 w-4 text-amber-400" />,
      color: 'hover:text-amber-300 hover:bg-amber-950/40 border-amber-500/30',
      badge: 'ARCHIVE',
    },
    {
      name: 'Gmail & PDF Dispatch',
      href: '/gmail-dispatch',
      icon: <Mail className="h-4 w-4 text-red-400" />,
      color: 'hover:text-red-300 hover:bg-red-950/40 border-red-500/30',
      badge: 'GMAIL / PDF',
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
      icon: <HelpCircle className="h-4 w-4 text-cyan-400" />,
      color: 'hover:text-cyan-300 hover:bg-cyan-950/40 border-cyan-500/30',
    },
  ]

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-[#020617] backdrop-blur-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-500/40 shadow-neon-cyan/20">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-bold tracking-wider text-slate-100">
                  {productConfig.brand.name}
                </span>
                <span className="text-[10px] rounded bg-cyan-950 border border-cyan-500/40 px-1 py-0.2 text-cyan-400 font-mono">
                  {productConfig.brand.version || 'v2.4'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {productConfig.brand.tagline}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-slate-100 transition-colors"
            title="Close navigation menu"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            SOC Navigation
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 border border-transparent',
                  item.color,
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-neon-cyan/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                )
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wide',
                    item.badge === 'CRITICAL' || item.badge === 'GMAIL / PDF'
                      ? 'bg-red-950 text-red-400 border border-red-500/40 animate-pulse'
                      : item.badge === 'QUARANTINE'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : item.badge === 'ARCHIVE'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : item.badge.includes('VOICE')
                      ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* User Status / System Indicator Footer */}
        <div className="border-t border-slate-800 p-3 bg-slate-950/60 font-mono">
          <div className="flex items-center gap-2.5 rounded-lg bg-slate-900/90 border border-slate-800/90 p-2">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-cyan-400 font-bold text-xs">
                {productConfig.brand.analyst.name.split(' ').map((w) => w[0]).join('')}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {productConfig.brand.analyst.name}
              </p>
              <p className="text-[10px] text-cyan-400 truncate">
                {productConfig.brand.analyst.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
