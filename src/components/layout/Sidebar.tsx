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
  Zap,
  Bot,
  X,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { productConfig } from '../../config/productConfig'
import { useDemoScenario } from '../../context/DemoScenarioContext'

const ICONS_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Activity: <Activity className="h-4 w-4" />,
  ShieldAlert: <ShieldAlert className="h-4 w-4" />,
  Globe: <Globe className="h-4 w-4" />,
  Network: <Network className="h-4 w-4" />,
  Clock: <Clock className="h-4 w-4" />,
  Laptop: <Laptop className="h-4 w-4" />,
  BrainCircuit: <BrainCircuit className="h-4 w-4" />,
  Bot: <Bot className="h-4 w-4 text-purple-400" />,
  FileText: <FileText className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
  HelpCircle: <HelpCircle className="h-4 w-4" />,
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentStage } = useDemoScenario()

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
          'fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-slate-950/95 lg:bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80 transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-500/40 shadow-cyan-glow-sm">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-base tracking-wider text-slate-100">
                  {productConfig.brand.name}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SOC
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide">
                {productConfig.brand.tagline}
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

        {/* Live Status Pill */}
        <div className="px-4 py-3 border-b border-slate-800/40 bg-slate-900/40">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', currentStage.activeThreatsCount > 0 ? 'bg-red-400' : 'bg-emerald-400')} />
                <span className={cn('relative inline-flex rounded-full h-2 w-2', currentStage.activeThreatsCount > 0 ? 'bg-red-500' : 'bg-emerald-500')} />
              </span>
              <span className="text-slate-300 font-medium">
                {currentStage.activeThreatsCount > 0 ? 'Threat Intercepted' : 'Telemetry Normal'}
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              {currentStage.activeThreatsCount} ALERTS
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {productConfig.navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose()
              }}
              className={({ isActive }) =>
                cn(
                  'group flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow-sm'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                )
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                  {ICONS_MAP[item.icon] || <Activity className="h-4 w-4" />}
                </span>
                <span>{item.label}</span>
              </div>
              {item.path === '/threats' && currentStage.activeThreatsCount > 0 && (
                <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-red-300 border border-red-500/40 animate-pulse">
                  {currentStage.activeThreatsCount}
                </span>
              )}
              {item.path === '/ai-analysis' && (
                <span className="flex items-center gap-0.5 text-[10px] font-mono text-purple-400">
                  <Zap className="h-2.5 w-2.5 fill-current" />
                  AI
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Analyst Profile Bottom Section */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-cyan-500/40 text-xs font-bold text-cyan-300 shadow-cyan-glow-sm">
              {productConfig.brand.analyst.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">
                {productConfig.brand.analyst.name}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="truncate">{productConfig.brand.analyst.clearanceLevel}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
