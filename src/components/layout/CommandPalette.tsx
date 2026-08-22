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
import { useDevices } from '../../hooks/useDevices'
import { useAlerts } from '../../hooks/useAlerts'
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
  const { devices } = useDevices()
  const { alerts } = useAlerts()

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
    if (!query) return devices.slice(0, 3)
    const q = query.toLowerCase()
    return devices.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.hostname.toLowerCase().includes(q) ||
        d.ip.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q)
    )
  }, [query, devices])

  const filteredThreats = useMemo(() => {
    if (!query) return alerts.slice(0, 3)
    const q = query.toLowerCase()
    return alerts.filter(
      (t) =>
        t.alertCode.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.deviceId.toLowerCase().includes(q) ||
        t.deviceIp.includes(q)
    )
  }, [query, alerts])

  const quickActions = [
    {
      label: 'Open Sentinel AI Chat Workspace',
      icon: 'AI Security Copilot',
      action: () => {
        navigate('/ai-chat')
        onClose()
      },
    },
    {
      label: 'Explore 3D Network Topology',
      icon: '3D Spatial View',
      action: () => {
        navigate('/network-3d')
        onClose()
      },
    },
    {
      label: 'Review Patient Zero Telemetry (DEVICE-042)',
      icon: 'Endpoint Forensic',
      action: () => {
        navigate('/devices/DEVICE-042')
        onClose()
      },
    },
    {
      label: 'Generate Forensic Incident Brief',
      icon: 'Compliance Report',
      action: () => {
        navigate('/reports')
        onClose()
      },
    },
  ]

  const handleAskAI = () => {
    if (!query.trim()) return
    toggleOpen()
    sendMessage(`Investigate query: ${query}`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-950/95 border-slate-700/80 shadow-2xl p-0 overflow-hidden backdrop-blur-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-800 px-4 py-3 bg-slate-900/60">
          <Search className="h-4 w-4 text-cyan-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, host ID, IP, alert code, or question for AI..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-sans"
            autoFocus
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Quick Actions */}
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-2 tracking-wider">
              Quick SOC Navigation
            </div>
            <div className="space-y-1">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.action}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-900 hover:text-cyan-300 transition-colors group"
                >
                  <span className="font-medium">{action.label}</span>
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-cyan-400">
                    {action.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Devices Result */}
          {filteredDevices.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-2 tracking-wider flex items-center gap-1.5">
                <Laptop className="h-3.5 w-3.5 text-cyan-400" />
                <span>Matching Monitored Endpoints ({filteredDevices.length})</span>
              </div>
              <div className="space-y-1">
                {filteredDevices.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      navigate(`/devices/${d.id}`)
                      onClose()
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-900 hover:text-cyan-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-100">{d.id}</span>
                      <span className="text-slate-400 font-mono">({d.ip})</span>
                      <span className="text-slate-500 truncate max-w-xs">{d.hostname}</span>
                    </div>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        d.status === 'COMPROMISED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {d.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Threats Result */}
          {filteredThreats.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-2 tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                <span>Security Alerts & IoCs ({filteredThreats.length})</span>
              </div>
              <div className="space-y-1">
                {filteredThreats.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      navigate('/threats')
                      onClose()
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-900 hover:text-red-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-red-400">{t.alertCode}</span>
                      <span className="text-slate-300 truncate max-w-sm">{t.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{t.deviceId}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ask AI Trigger */}
          {query.trim() && (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={handleAskAI}
                className="flex w-full items-center justify-between rounded-lg bg-purple-950/30 border border-purple-500/40 px-3 py-2 text-purple-200 hover:bg-purple-900/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">Ask Sentinel AI:</span>
                  <span className="italic text-purple-300">"{query}"</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-purple-400" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 px-4 py-2 bg-slate-900/40 text-[10px] font-mono text-slate-500">
          <span>Navigate with ↑ ↓ • Press ESC to close</span>
          <span className="text-cyan-400">SentinelX Tactical Search</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
