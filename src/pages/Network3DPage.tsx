import React from 'react'
import { NetworkTopologyCanvas } from '../components/network3d/NetworkTopologyCanvas'
import { demo3DNodes, demo3DLinks } from '../data/demo/network'
import { Globe, ShieldCheck, Activity } from 'lucide-react'
import { Badge } from '../components/common/Badge'

export const Network3DPage: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100">
                3D Network Topology Spatial Visualizer
              </h1>
              <Badge variant="healthy" className="text-[10px] font-mono">
                WEBGL ACTIVE
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Interactive 3D representation of perimeter firewalls, routers, cloud VPCs, servers, and compromised workstations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Click any node to open forensic drawer</span>
        </div>
      </div>

      {/* Large Full-Height 3D Topology Canvas */}
      <NetworkTopologyCanvas
        nodes={demo3DNodes}
        links={demo3DLinks}
        height="h-[calc(100vh-220px)] min-h-[580px]"
        enableFullscreen={true}
      />
    </div>
  )
}
