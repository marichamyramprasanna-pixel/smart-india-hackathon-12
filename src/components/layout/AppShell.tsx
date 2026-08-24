import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { DemoControllerBar } from './DemoControllerBar'
import { LiveThreatTicker } from './LiveThreatTicker'
import { CommandPalette } from './CommandPalette'
import { CyberCursor } from '../common/CyberCursor'
import { SentinelAIChat } from '../ai-assistant/SentinelAIChat'
import { useSentinelAI } from '../../context/SentinelAIContext'

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    <div className="relative flex min-h-screen bg-[#030712] text-foreground overflow-x-hidden">
      {/* Background Cyber Grid & Radiant Colorful Atmospheric Glows */}
      <div className="fixed inset-0 pointer-events-none bg-cyber-grid bg-grid-24 opacity-30 z-0" />
      <div className="fixed -top-32 -left-32 h-[32rem] w-[32rem] rounded-full bg-cyan-500/15 blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/4 -right-32 h-[32rem] w-[32rem] rounded-full bg-purple-600/15 blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-2/3 right-1/4 h-[24rem] w-[24rem] rounded-full bg-rose-500/10 blur-[130px] pointer-events-none z-0" />

      {/* Persistent Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Layout */}
      <div className="flex flex-1 flex-col lg:pl-64 z-10 min-w-0">
        {/* Persistent Topbar */}
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
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
    </div>
  )
}
