import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { DemoControllerBar } from './DemoControllerBar'
import { CommandPalette } from './CommandPalette'
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
    <div className="relative flex min-h-screen bg-cyber-950 text-foreground overflow-x-hidden">
      {/* Background cyber grid & glow effects */}
      <div className="fixed inset-0 pointer-events-none bg-cyber-grid bg-grid-24 opacity-35 z-0" />
      <div className="fixed -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-40 h-96 w-96 rounded-full bg-purple-500/10 blur-[140px] pointer-events-none z-0" />

      {/* Persistent Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Layout */}
      <div className="flex flex-1 flex-col lg:pl-64 z-10 min-w-0">
        {/* Persistent Topbar */}
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Demo Scenario Controller Bar */}
        <DemoControllerBar />

        {/* Dynamic Route Outlet */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-7 max-w-[1700px] w-full mx-auto">
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
    </div>
  )
}
