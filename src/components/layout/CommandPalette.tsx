import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Laptop,
  ShieldAlert,
  Clock,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react'
import { Dialog, DialogContent } from '../common/Dialog'
import { mockDevices } from '../../api/devices'
import { mockThreats } from '../../api/threats'
import { productConfig } from '../../config/productConfig'
import { useSentinelAI } from '../../context/SentinelAIContext'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { toggleOpen, sendMessage } = useSentinelAI()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Open
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const filteredDevices = useMemo(() => {
    if (!query) return mockDevices.slice(0, 3)
    const q = query.toLowerCase()
    return mockDevices.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.hostname.toLowerCase().includes(q) ||
        d.ip.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q)
    )
  }, [query])

  const filteredThreats = useMemo(() => {
    if (!query) return mockThreats.slice(0, 3)
    const q = query.toLowerCase()
    return mockThreats.filter(
      (t) =>
        t.alertCode.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.deviceId.toLowerCase().includes(q) ||
        t.threatCategory.toLowerCase().includes(q)
    )
  }, [query])

  const filteredPages = useMemo(() => {
    if (!query) return productConfig.navigation.slice(0, 4)
    const q = query.toLowerCase()
    return productConfig.navigation.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
  }, [query])

  const handleSelect = (path: string) => {
    navigate(path)
    onClose()
    setQuery('')
  }

  const handleAskAI = (prompt: string) => {
    onClose()
    toggleOpen()
    sendMessage(prompt)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 max-w-xl overflow-hidden border-slate-700 bg-slate-900/98 shadow-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-800 px-4 py-3 bg-slate-950/60">
          <Search className="h-4 w-4 text-cyan-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, device (e.g. DEVICE-042), alert (AL-2041), or query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Sentinel AI Action */}
          {query && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-purple-400 px-2 mb-1.5 font-bold">
                Sentinel AI Copilot
              </div>
              <div
                onClick={() => handleAskAI(`Investigate ${query}`)}
                className="flex items-center justify-between p-2 rounded-md hover:bg-purple-950/40 border border-purple-500/20 cursor-pointer text-xs transition-colors"
              >
                <div className="flex items-center gap-2 text-purple-200">
                  <span className="font-semibold">Ask Sentinel AI:</span>
                  <span className="text-slate-300">"{query}"</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400">EXECUTE</span>
              </div>
            </div>
          )}

          {/* Devices Section */}
          {filteredDevices.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2 mb-1.5 font-bold">
                Devices & Endpoints
              </div>
              <div className="space-y-1">
                {filteredDevices.map((dev) => (
                  <div
                    key={dev.id}
                    onClick={() => handleSelect(`/devices/${dev.id}`)}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-slate-800/80 cursor-pointer text-xs transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Laptop className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-400" />
                      <div>
                        <span className="font-semibold text-slate-200 group-hover:text-cyan-300">
                          {dev.id}
                        </span>
                        <span className="ml-2 text-slate-400 font-mono text-[11px]">
                          {dev.ip}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        dev.status === 'COMPROMISED'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : dev.status === 'SUSPICIOUS'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {dev.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts Section */}
          {filteredThreats.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2 mb-1.5 font-bold">
                Active Threat Alerts
              </div>
              <div className="space-y-1">
                {filteredThreats.map((threat) => (
                  <div
                    key={threat.id}
                    onClick={() => handleSelect('/threats')}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-slate-800/80 cursor-pointer text-xs transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-mono font-bold text-red-400 mr-2">
                          {threat.alertCode}
                        </span>
                        <span className="text-slate-300 truncate">
                          {threat.title}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-orange-400 shrink-0">
                      {threat.confidenceScore}% conf
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Section */}
          {filteredPages.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2 mb-1.5 font-bold">
                Navigation Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {filteredPages.map((page) => (
                  <div
                    key={page.path}
                    onClick={() => handleSelect(page.path)}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-slate-800/80 cursor-pointer text-xs transition-colors group border border-slate-800"
                  >
                    <span className="text-slate-200 group-hover:text-cyan-300 font-medium">
                      {page.label}
                    </span>
                    <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-cyan-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800/80 bg-slate-950 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Navigate with ↑ ↓ and Enter</span>
          <span>ESC to dismiss</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
