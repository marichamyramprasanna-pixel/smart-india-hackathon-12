import React, { useState, Suspense, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import {
  RotateCcw,
  Layers,
  ZoomIn,
  Search,
  Filter,
  Eye,
  Shield,
  Activity,
} from 'lucide-react'
import { Network3DNode, Network3DLink } from '../../types/network'
import { NetworkNodes } from './NetworkNodes'
import { PacketStreams } from './PacketStreams'
import { NodeDetailsDrawer } from './NodeDetailsDrawer'
import { Network2DFallback } from './Network2DFallback'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { Skeleton } from '../common/Skeleton'
import { useDemoScenario } from '../../context/DemoScenarioContext'

interface NetworkTopologyCanvasProps {
  nodes: Network3DNode[]
  links: Network3DLink[]
  height?: string
  enableFullscreen?: boolean
}

export const NetworkTopologyCanvas: React.FC<NetworkTopologyCanvasProps> = ({
  nodes,
  links,
  height = 'h-[540px]',
}) => {
  const { currentStage } = useDemoScenario()
  const [selectedNode, setSelectedNode] = useState<Network3DNode | null>(null)
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Sync node statuses dynamically with DemoScenario state
  const reactiveNodes = nodes.map((n) => {
    if (n.id === 'DEVICE-042') {
      return {
        ...n,
        status: currentStage.device42Status === 'COMPROMISED' ? ('COMPROMISED' as const) :
                currentStage.device42Status === 'SUSPICIOUS' ? ('SUSPICIOUS' as const) : ('HEALTHY' as const),
        riskScore: currentStage.device42Risk,
        compromiseProbability: currentStage.compromiseProbability,
      }
    }
    if (n.id === 'SERVER-07') {
      return {
        ...n,
        status: currentStage.server07Status === 'SUSPICIOUS' ? ('SUSPICIOUS' as const) : ('HEALTHY' as const),
        riskScore: currentStage.server07Risk,
      }
    }
    return n
  })

  // Filter nodes by category and search query
  const filteredNodes = reactiveNodes.filter((node) => {
    const matchesSearch =
      node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.ip.includes(searchQuery)

    if (!matchesSearch) return false

    if (filterType === 'threats') return node.status === 'COMPROMISED' || node.status === 'SUSPICIOUS'
    if (filterType === 'endpoints') return node.type === 'workstation' || node.type === 'laptop'
    if (filterType === 'infrastructure') return node.type === 'firewall' || node.type === 'router' || node.type === 'server'
    return true
  })

  return (
    <div className={`relative w-full ${height} rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col`}>
      {/* Top Toolbar Controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Search bar inside canvas */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search 3D topology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-36 sm:w-48 rounded-md border border-slate-800 bg-slate-900/90 pl-8 pr-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Filter Chips */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-1 rounded-md border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filterType === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Nodes ({reactiveNodes.length})
            </button>
            <button
              onClick={() => setFilterType('threats')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filterType === 'threats' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Threats
            </button>
            <button
              onClick={() => setFilterType('endpoints')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filterType === 'endpoints' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Endpoints
            </button>
          </div>
        </div>

        {/* View Switcher & Legend */}
        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-2.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400" /> Healthy
            </span>
            <span className="flex items-center gap-1 text-orange-400">
              <span className="h-2 w-2 rounded-full bg-orange-400" /> Suspicious
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" /> Compromised
            </span>
          </div>

          <div className="flex items-center rounded-md bg-slate-900/80 border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === '3d' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D Space
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === '2d' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D Flat
            </button>
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas or 2D Vector Fallback */}
      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        {viewMode === '3d' ? (
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-slate-950">
                <div className="text-center space-y-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent mx-auto" />
                  <p className="text-xs text-slate-400">Initializing 3D Telemetry WebGL Canvas...</p>
                </div>
              </div>
            }
          >
            <Canvas
              camera={{ position: [0, 8, 22], fov: 45 }}
              className="w-full h-full"
            >
              {/* Lighting */}
              <ambientLight intensity={0.65} />
              <pointLight position={[10, 15, 10]} intensity={1.2} color="#00F0FF" />
              <pointLight position={[-10, -10, -10]} intensity={0.8} color="#A855F7" />

              {/* Starfield backdrop */}
              <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

              {/* 3D Network Topology Components */}
              <NetworkNodes
                nodes={filteredNodes}
                selectedNodeId={selectedNode?.id || null}
                onSelectNode={(node) => setSelectedNode(node)}
              />

              <PacketStreams nodes={reactiveNodes} links={links} />

              {/* Controls */}
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxDistance={40}
                minDistance={5}
                dampingFactor={0.08}
              />
            </Canvas>
          </Suspense>
        ) : (
          <Network2DFallback
            nodes={filteredNodes}
            links={links}
            selectedNodeId={selectedNode?.id || null}
            onSelectNode={(node) => setSelectedNode(node)}
          />
        )}
      </div>

      {/* Bottom status bar in Canvas */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 pointer-events-none text-[11px] font-mono text-slate-400 bg-slate-950/80 px-3 py-1 rounded-md border border-slate-800/80">
        <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
        <span>R3F Interactive Graph | Drag to rotate • Scroll to zoom • Click node to triage</span>
      </div>

      {/* Slide-out Node Investigation Drawer */}
      <NodeDetailsDrawer
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  )
}
