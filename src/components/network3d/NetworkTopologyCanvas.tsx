import React, { useState, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Grid } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import {
  RotateCcw,
  Layers,
  ZoomIn,
  Search,
  Filter,
  Eye,
  Shield,
  Activity,
  Play,
  Pause,
  Compass,
  Sliders,
  Maximize2,
  Sparkles,
  Plus,
} from 'lucide-react'
import { Network3DNode, Network3DLink } from '../../types/network'
import { NetworkNodes } from './NetworkNodes'
import { PacketStreams } from './PacketStreams'
import { NodeDetailsDrawer } from './NodeDetailsDrawer'
import { Network2DFallback } from './Network2DFallback'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { useDemoScenario } from '../../context/DemoScenarioContext'

interface NetworkTopologyCanvasProps {
  nodes: Network3DNode[]
  links: Network3DLink[]
  height?: string
  enableFullscreen?: boolean
  packetSpeedMultiplier?: number
}

export const NetworkTopologyCanvas: React.FC<NetworkTopologyCanvasProps> = ({
  nodes,
  links,
  height = 'h-[620px]',
  packetSpeedMultiplier = 1.0,
}) => {
  const navigate = useNavigate()
  const { currentStage } = useDemoScenario()
  const controlsRef = useRef<any>(null)

  const [selectedNode, setSelectedNode] = useState<Network3DNode | null>(null)
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [autoRotate, setAutoRotate] = useState(true)
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'threat' | 'top'>('overview')

  // Real-time canvas render parameter controls
  const [nodeScale, setNodeScale] = useState(1.0)
  const [starfieldDensity, setStarfieldDensity] = useState(4000)
  const [packetVelocity, setPacketVelocity] = useState(1.0)
  const [showConfig, setShowConfig] = useState(false)

  // Sync node statuses dynamically with DemoScenario state
  const reactiveNodes = nodes.map((n) => {
    if (n.id === 'DEVICE-042') {
      return {
        ...n,
        status:
          currentStage.device42Status === 'COMPROMISED'
            ? ('COMPROMISED' as const)
            : currentStage.device42Status === 'SUSPICIOUS'
            ? ('SUSPICIOUS' as const)
            : ('HEALTHY' as const),
        riskScore: currentStage.device42Risk,
        compromiseProbability: currentStage.compromiseProbability,
      }
    }
    if (n.id === 'SERVER-07') {
      return {
        ...n,
        status:
          currentStage.server07Status === 'SUSPICIOUS'
            ? ('SUSPICIOUS' as const)
            : ('HEALTHY' as const),
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

    if (filterType === 'threats')
      return node.status === 'COMPROMISED' || node.status === 'SUSPICIOUS' || node.status === 'ISOLATED'
    if (filterType === 'endpoints')
      return node.type === 'workstation' || node.type === 'laptop'
    if (filterType === 'infrastructure')
      return (
        node.type === 'firewall' || node.type === 'router' || node.type === 'server'
      )
    return true
  })

  const setCameraAngle = (preset: 'overview' | 'threat' | 'top') => {
    setCameraPreset(preset)
    if (!controlsRef.current) return

    if (preset === 'overview') {
      controlsRef.current.object.position.set(0, 10, 24)
    } else if (preset === 'threat') {
      controlsRef.current.object.position.set(4, 5, 12)
    } else if (preset === 'top') {
      controlsRef.current.object.position.set(0, 26, 0.1)
    }
    controlsRef.current.update()
  }

  return (
    <div
      className={`relative w-full ${height} rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-950/90 to-[#020617] backdrop-blur-2xl overflow-hidden shadow-2xl flex flex-col`}
    >
      {/* Top Floating Cyber Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-auto bg-slate-950/85 p-2.5 rounded-xl border border-slate-800/80 backdrop-blur-md shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar inside 3D canvas */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-400" />
            <input
              type="text"
              placeholder="Filter 3D node ID or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-36 sm:w-52 rounded-lg border border-slate-700 bg-slate-900/90 pl-8 pr-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-xs">
            {[
              { key: 'all', label: `All (${reactiveNodes.length})` },
              { key: 'threats', label: 'Threats', color: 'text-red-400' },
              { key: 'endpoints', label: 'Endpoints', color: 'text-blue-400' },
              { key: 'infrastructure', label: 'Core Infra', color: 'text-cyan-400' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  filterType === f.key
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Camera Presets, Auto-Rotate & Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Camera Preset Buttons */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setCameraAngle('overview')}
              className={`px-2 py-1 rounded text-[10px] ${
                cameraPreset === 'overview'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Orbit
            </button>
            <button
              onClick={() => setCameraAngle('threat')}
              className={`px-2 py-1 rounded text-[10px] ${
                cameraPreset === 'threat'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Focus Threat
            </button>
            <button
              onClick={() => setCameraAngle('top')}
              className={`px-2 py-1 rounded text-[10px] ${
                cameraPreset === 'top'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Top-Down
            </button>
          </div>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              autoRotate
                ? 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300 shadow-neon-cyan/20'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle 3D Cinematic Auto-Rotation"
          >
            {autoRotate ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span className="hidden xl:inline text-[11px]">Auto Orbit</span>
          </button>

          {/* display config slider toggle */}
          <button
            onClick={() => setShowConfig((prev) => !prev)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              showConfig
                ? 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300 shadow-neon-cyan/20'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
            }`}
            title="Display Tweaks Settings Panel"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span className="hidden xl:inline text-[11px]">3D Sliders</span>
          </button>

          {/* 3D vs 2D Switcher */}
          <div className="flex items-center rounded-lg bg-slate-900/90 border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === '3d'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D WebGL
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === '2d'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Standby State Overlay if No Nodes */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-6">
          <div className="max-w-md p-6 rounded-2xl border-2 border-dashed border-cyan-500/40 bg-slate-950/90 backdrop-blur-xl shadow-2xl text-center space-y-4 font-mono pointer-events-auto">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/50 text-cyan-300 mx-auto shadow-neon-cyan/30">
              <Sparkles className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">3D TOPOLOGY CANVAS: STANDBY</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Zero active endpoints in inventory. The 3D canvas is clean and ready. Register your first device to construct the 3D network nodes and packet streams!
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/devices')}
              className="text-xs font-semibold gap-1.5 shadow-neon-cyan/40"
            >
              <Plus className="h-4 w-4" />
              <span>Register First Endpoint</span>
            </Button>
          </div>
        </div>
      )}

      {/* 3D WebGL Canvas or 2D Vector Fallback */}
      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        {viewMode === '3d' ? (
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-slate-950">
                <div className="text-center space-y-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent mx-auto shadow-neon-cyan" />
                  <p className="text-xs font-mono text-cyan-300">
                    Initializing High-Fidelity 3D WebGL Cyber Canvas...
                  </p>
                </div>
              </div>
            }
          >
            <Canvas
              camera={{ position: [0, 10, 24], fov: 45 }}
              className="w-full h-full"
            >
              {/* Studio Cyber Lighting */}
              <ambientLight intensity={0.7} />
              <pointLight position={[15, 20, 15]} intensity={1.5} color="#00F0FF" />
              <pointLight position={[-15, -15, -15]} intensity={1.2} color="#A855F7" />
              <pointLight position={[0, -10, 20]} intensity={0.8} color="#10B981" />
              <directionalLight position={[0, 15, 5]} intensity={0.6} />

              {/* Starfield Backdrop */}
              <Stars
                radius={120}
                depth={60}
                count={starfieldDensity}
                factor={4}
                saturation={0.5}
                fade
                speed={1.5}
              />

              {/* Cyber Grid Plane Floor */}
              <Grid
                position={[0, -6, 0]}
                args={[40, 40]}
                cellSize={1.5}
                cellThickness={0.8}
                cellColor="#06b6d4"
                sectionSize={4.5}
                sectionThickness={1.2}
                sectionColor="#a855f7"
                fadeDistance={35}
                fadeStrength={1.5}
              />

              {/* 3D Network Topology Components */}
              <NetworkNodes
                nodes={filteredNodes}
                selectedNodeId={selectedNode?.id || null}
                onSelectNode={(node) => setSelectedNode(node)}
                nodeScale={nodeScale}
              />

              <PacketStreams
                nodes={reactiveNodes}
                links={links}
                velocityMultiplier={packetVelocity * packetSpeedMultiplier}
              />

              {/* Orbit Controls with Smooth Damping & Auto-Rotation */}
              <OrbitControls
                ref={controlsRef}
                enablePan={true}
                enableZoom={true}
                maxDistance={50}
                minDistance={5}
                autoRotate={autoRotate}
                autoRotateSpeed={0.8}
                dampingFactor={0.05}
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

      {/* 3D Parameter Configuration Overlay Panel */}
      {showConfig && viewMode === '3d' && (
        <div className="absolute bottom-3 right-3 z-20 w-64 p-4 rounded-xl border border-cyan-500/40 bg-slate-950/90 backdrop-blur-md shadow-2xl space-y-3.5 text-xs font-mono animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5" /> Display Tweaks
            </span>
            <button
              onClick={() => {
                setNodeScale(1.0)
                setStarfieldDensity(4000)
                setPacketVelocity(1.0)
              }}
              className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="space-y-3">
            {/* Node scale slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Node Scaling:</span>
                <span className="text-cyan-300 font-bold">{nodeScale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={nodeScale}
                onChange={(e) => setNodeScale(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Packet velocity slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Stream Velocity:</span>
                <span className="text-cyan-300 font-bold">{(packetVelocity * packetSpeedMultiplier).toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={packetVelocity}
                onChange={(e) => setPacketVelocity(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Star density slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Star Backdrop:</span>
                <span className="text-cyan-300 font-bold">{starfieldDensity} Stars</span>
              </div>
              <input
                type="range"
                min="500"
                max="8000"
                step="500"
                value={starfieldDensity}
                onChange={(e) => setStarfieldDensity(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Forensic Drawer for Selected 3D Node */}
      <NodeDetailsDrawer
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  )
}
