import React from 'react'
import { Search, Filter, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react'
import { ThreatSeverity, ThreatStatus } from '../../types/threat'

interface ThreatFilterBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  selectedSeverity: string
  onSeverityChange: (s: string) => void
  selectedStatus: string
  onStatusChange: (st: string) => void
  totalCount: number
}

export const ThreatFilterBar: React.FC<ThreatFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  selectedStatus,
  onStatusChange,
  totalCount,
}) => {
  const severities = [
    { label: 'All Severities', value: 'ALL' },
    { label: 'Critical', value: 'CRITICAL' },
    { label: 'High', value: 'HIGH' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Low', value: 'LOW' },
  ]

  const statuses = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Investigating', value: 'INVESTIGATING' },
    { label: 'New', value: 'NEW' },
    { label: 'Resolved', value: 'RESOLVED' },
  ]

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/70 backdrop-blur-md">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by Alert ID (e.g. AL-2041), device, IP, or keyword..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-full rounded-md border border-slate-700 bg-slate-900/90 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Severity Pills */}
        <div className="flex items-center rounded-lg bg-slate-900/90 border border-slate-800 p-0.5 text-xs">
          {severities.map((sev) => (
            <button
              key={sev.value}
              onClick={() => onSeverityChange(sev.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                selectedSeverity === sev.value
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev.label}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
        >
          {statuses.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
