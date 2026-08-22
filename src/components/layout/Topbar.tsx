import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
  Menu,
  Shield,
  Activity,
  Zap,
  Database,
  User,
  LogOut,
  LogIn,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useDemoScenario } from '../../context/DemoScenarioContext'
import { useSentinelAI } from '../../context/SentinelAIContext'
import { useAuth } from '../../hooks/useAuth'
import { productConfig } from '../../config/productConfig'
import { Button } from '../common/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../common/DropdownMenu'
import { NotificationCenter } from './NotificationCenter'

interface TopbarProps {
  onOpenSidebar: () => void
  onOpenCommandPalette: () => void
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenSidebar,
  onOpenCommandPalette,
}) => {
  const navigate = useNavigate()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { currentStage } = useDemoScenario()
  const { toggleOpen, isOpen: isAiChatOpen } = useSentinelAI()
  const { user, profile, isAuthenticated, isSupabaseConnected, signOut } = useAuth()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 backdrop-blur-xl">
      {/* Left section: Mobile menu + Search Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-850 hover:text-slate-200 lg:hidden"
          aria-label="Open Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Bar (⌘K / Ctrl+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="flex h-8.5 w-48 sm:w-64 md:w-80 items-center justify-between rounded-md border border-slate-800 bg-slate-900/90 px-3 text-xs text-slate-400 shadow-sm transition-all hover:border-cyan-500/40 hover:bg-slate-900 focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">Search devices, alerts, IPs...</span>
          </div>
          <kbd className="hidden sm:inline-flex h-4.5 select-none items-center gap-1 rounded bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-300 border border-slate-700">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Section: Status Pills, Supabase Badge, Sentinel AI, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Supabase Connection Status Badge */}
        <div
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
            isSupabaseConnected
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
          title={isSupabaseConnected ? 'Connected to PostgreSQL via Supabase' : 'Running in local buffer demo mode'}
        >
          <Database className="h-3 w-3" />
          <span>{isSupabaseConnected ? 'Supabase Connected' : 'Local Buffer Mode'}</span>
        </div>

        {/* Network Status Badge */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs">
          <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-400">SOC Health:</span>
          <span className="font-mono font-semibold text-emerald-400">
            {currentStage.networkHealth}%
          </span>
        </div>

        {/* Ask Sentinel AI quick trigger button in Topbar */}
        <Button
          variant="ai"
          size="sm"
          onClick={toggleOpen}
          className="h-8 px-2.5 text-xs font-semibold gap-1.5 shadow-purple-glow hidden sm:inline-flex"
        >
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>{isAiChatOpen ? 'Close AI' : 'Sentinel AI'}</span>
        </Button>

        {/* Notifications Popover */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="h-8.5 w-8.5 rounded-full relative text-slate-400 hover:text-slate-100 hover:bg-slate-850"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {currentStage.activeThreatsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
          </Button>

          {isNotificationsOpen && (
            <NotificationCenter onClose={() => setIsNotificationsOpen(false)} />
          )}
        </div>

        {/* Theme Toggle Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8.5 w-8.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-850"
              aria-label="Toggle Theme"
            >
              {resolvedTheme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2">
              <Moon className="h-3.5 w-3.5" />
              <span>Dark Theme</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2">
              <Sun className="h-3.5 w-3.5" />
              <span>Light Theme</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2">
              <Laptop className="h-3.5 w-3.5" />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Analyst Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-1 border-l border-slate-800 focus:outline-none">
              <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 border border-cyan-400/40 text-xs font-bold text-white shadow-cyan-glow-sm">
                {profile?.callsign?.substring(0, 2) || productConfig.brand.analyst.avatar}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 space-y-1">
            <div className="px-2 py-1.5 border-b border-slate-800">
              <p className="text-xs font-bold text-slate-100">{profile?.fullName || user?.email || productConfig.brand.analyst.name}</p>
              <p className="text-[10px] font-mono text-cyan-400">{profile?.callsign || productConfig.brand.analyst.callsign} • {profile?.clearanceLevel || productConfig.brand.analyst.clearanceLevel}</p>
            </div>
            {isAuthenticated ? (
              <DropdownMenuItem onClick={() => signOut()} className="gap-2 text-xs text-red-300 hover:text-red-200">
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out Analyst</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => navigate('/login')} className="gap-2 text-xs text-cyan-300 hover:text-cyan-200">
                <LogIn className="h-3.5 w-3.5" />
                <span>Analyst Sign In / Auth</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
