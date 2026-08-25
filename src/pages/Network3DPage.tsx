import React, { useState, useMemo } from 'react'
import { NetworkTopologyCanvas } from '../components/network3d/NetworkTopologyCanvas'
import { useDevices } from '../hooks/useDevices'
import { useInvestigation } from '../context/InvestigationContext'
import { getDeletedDevices } from '../services/deviceService'
import { generateDynamic3DTopology } from '../utils/topologyGenerator'
import { Globe, Lock, ShieldBan, Archive, Eye, EyeOff, Plus, Laptop } from 'lucide-react'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { useNavigate } from 'react-router-dom'

export const Network3DPage: React.FC = () => {
  const navigate = useNavigate()
  const { devices } = useDevices()
  const { isolatedDevices, blockedIps } = useInvestigation()
  const [showTombstones, setShowTombstones] = useState(true)

  const deletedList = useMemo(() => getDeletedDevices(), [])

  // Dynamically generate 3D spatial nodes and packet links including:
  // - Present devices
  // - 802.1X Quarantined devices
  // - Perimeter Blocked IPs
  // - Decommissioned Tombstone nodes
  const { nodes, links } = useMemo(() => {
    return generateDynamic3DTopology(
      devices,
      isolatedDevices,
      blockedIps,
      deletedList,
      showTombstones
    )
  }, [devices, isolatedDevices, blockedIps, deletedList, showTombstones])

  const isolatedCount = Object.keys(isolatedDevices).length + devices.filter((d) => d.status === 'ISOLATED').length
  const blockedIpsCount = Object.keys(blockedIps).length > 0 ? Object.keys(blockedIps).length : 2

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-neon-cyan/30 shrink-0">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-100">
                3D Network Topology Spatial Visualizer
              </h1>
              <Badge variant="healthy" className="text-[10px]">
                WEBGL ACCELERATED
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live spatial graph reflecting active endpoints, 802.1X quarantine cages, perimeter IP drops, and decommissioned archives.
            </p>
          </div>
        </div>

        {/* Dynamic Topology Status Bar & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Present Devices Count */}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs">
            <Laptop className="h-3.5 w-3.5 text-cyan-400" />
            <span>{devices.length} Active Devices</span>
          </span>

          {/* Quarantined Devices Count */}
          {isolatedCount > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs animate-pulse">
              <Lock className="h-3.5 w-3.5 text-rose-400" />
              <span>{isolatedCount} Quarantined</span>
            </span>
          )}

          {/* Blocked Perimeter IPs */}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs">
            <ShieldBan className="h-3.5 w-3.5 text-purple-400" />
            <span>{blockedIpsCount} Blocked IPs</span>
          </span>

          {/* Toggle Decommissioned Tombstone Nodes */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTombstones((prev) => !prev)}
            className={`text-xs gap-1.5 transition-all ${
              showTombstones
                ? 'border-amber-500/50 text-amber-300 bg-amber-950/40'
                : 'border-slate-700 text-slate-400'
            }`}
            title="Toggle visibility of archived tombstone nodes in outer orbit"
          >
            {showTombstones ? <Eye className="h-3.5 w-3.5 text-amber-400" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{showTombstones ? `${deletedList.length} Archived Visible` : 'Archived Hidden'}</span>
          </Button>

          {/* Quick Register Device */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/devices')}
            className="text-xs gap-1 shadow-neon-cyan/30"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Device</span>
          </Button>
        </div>
      </div>

      {/* Large Full-Height 3D Topology Canvas */}
      <NetworkTopologyCanvas
        nodes={nodes}
        links={links}
        height="h-[calc(100vh-230px)] min-h-[580px]"
        enableFullscreen={true}
      />
    </div>
  )
}
