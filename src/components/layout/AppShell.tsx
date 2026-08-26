import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { DemoControllerBar } from './DemoControllerBar'
import { LiveThreatTicker } from './LiveThreatTicker'
import { CommandPalette } from './CommandPalette'
import { CyberCursor } from '../common/CyberCursor'
import { ScrollEffects } from '../common/ScrollEffects'
import { ScrollParticleMatrix } from '../common/ScrollParticleMatrix'
import { GmailIncidentMonitor } from '../common/GmailIncidentMonitor'
import { ConsoleLockGuard } from '../security/ConsoleLockGuard'
import { SentinelAIChat } from '../ai-assistant/SentinelAIChat'
import { useSentinelAI } from '../../context/SentinelAIContext'
import { JuryWalkthroughPanel } from '../dashboard/JuryWalkthroughPanel'
import { cn } from '../../utils/cn'
import { PanelLeftOpen } from 'lucide-react'

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024
    }
    return true
  })
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const { toggleOpen: toggleAiChat } = useSentinelAI()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
      // ⌘/ or Ctrl+/ for AI Assistant
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        toggleAiChat()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleAiChat])

  return (
    <div className="relative flex min-h-screen bg-[#02040a] text-slate-100 overflow-x-hidden">
      {/* Deep Obsidian Background Cyber Grid & Vibrant Atmospheric Neon Glows */}
      <div className="fixed inset-0 pointer-events-none bg-cyber-grid bg-grid-24 opacity-35 z-0" />
      <div className="fixed -top-32 -left-32 h-[34rem] w-[34rem] rounded-full bg-cyan-500/15 blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/4 -right-32 h-[34rem] w-[34rem] rounded-full bg-purple-600/15 blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-2/3 right-1/4 h-[26rem] w-[26rem] rounded-full bg-rose-500/10 blur-[130px] pointer-events-none z-0" />

      {/* Floating Button to Bring Back Navigation Menu when Closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-20 left-0 z-40 flex items-center gap-2 px-3 py-2 rounded-r-xl border border-l-0 border-cyan-500/50 bg-slate-950/95 text-cyan-300 shadow-neon-cyan hover:bg-slate-900 transition-all font-mono text-xs font-bold animate-in fade-in slide-in-from-left-2 duration-300 group"
          title="Bring back navigation menu"
          aria-label="Bring back navigation menu"
        >
          <PanelLeftOpen className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Open Navigation Menu</span>
        </button>
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Layout */}
      <div className={cn('flex flex-1 flex-col z-10 min-w-0 transition-all duration-300', sidebarOpen ? 'lg:pl-64' : 'lg:pl-0')}>
        {/* Persistent Topbar */}
        <Topbar
          onOpenSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Live Marquee Broadcast Ticker */}
        <LiveThreatTicker />

        {/* Demo Scenario Controller Bar */}
        <DemoControllerBar />

        {/* Dynamic Route Outlet */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-7 max-w-[1750px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command Search Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Floating Sentinel AI Assistant Chat Window */}
      <SentinelAIChat />

      {/* Cyber Reticle & Laser Follower Cursor Effect */}
      <CyberCursor />

      {/* Dynamic Scroll Progress & Floating Top Button */}
      <ScrollEffects />

      {/* Cyber Particle Sparks & Matrix Rain Stream Canvas on Scroll */}
      <ScrollParticleMatrix />

      {/* Emergency Gmail Incident Escalation Monitor (>80% Risk) */}
      <GmailIncidentMonitor />

      {/* SOC Inactivity Lock & Biometric PIN Session Guard */}
      <ConsoleLockGuard />

      {/* 3-Minute Guided Jury Presentation Walkthrough Panel */}
      <JuryWalkthroughPanel />
    </div>
  )
}
