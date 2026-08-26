import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { Network3DNode } from '../../types/network'

interface NetworkNodesProps {
  nodes: Network3DNode[]
  selectedNodeId: string | null
  onSelectNode: (node: Network3DNode) => void
  nodeScale?: number
}

const NodeMesh: React.FC<{
  node: Network3DNode
  isSelected: boolean
  onSelect: () => void
  nodeScale?: number
}> = ({ node, isSelected, onSelect, nodeScale = 1.0 }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const cageRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Determine node color based on status
  const getColor = () => {
    switch (node.status) {
      case 'ISOLATED':
        return '#F43F5E' // Rose Red (802.1X Quarantine)
      case 'BLOCKED_PERIMETER':
        return '#EF4444' // Drop Red
      case 'DECOMMISSIONED':
        return '#F59E0B' // Amber Ghost Hologram
      case 'COMPROMISED':
        return '#DC2626' // Deep Crimson
      case 'SUSPICIOUS':
        return '#FB923C' // Orange
      case 'AI_FLAGGED':
        return '#A855F7' // Purple
      case 'HEALTHY':
      default:
        return '#00F0FF' // Cyber Cyan
    }
  }

  const nodeColor = getColor()
  const isDecomm = node.status === 'DECOMMISSIONED'
  const isIsolated = node.status === 'ISOLATED' || node.isIsolated
  const isBlockedIp = node.status === 'BLOCKED_PERIMETER'

  // Dynamic 3D rotation and floating animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isDecomm ? 0.15 : 0.4)
      meshRef.current.rotation.x += delta * (isDecomm ? 0.1 : 0.2)

      if (node.status === 'COMPROMISED' || isIsolated) {
        const pulse = (1 + Math.sin(state.clock.elapsedTime * 6) * 0.14) * nodeScale
        meshRef.current.scale.set(pulse, pulse, pulse)
      } else {
        meshRef.current.scale.set(nodeScale, nodeScale, nodeScale)
      }
    }
    if (cageRef.current) {
      cageRef.current.rotation.y -= delta * 0.6
      cageRef.current.rotation.z += delta * 0.3
    }
  })

  // Geometry selection based on node type
  const renderGeometry = () => {
    switch (node.type) {
      case 'internet':
        return <icosahedronGeometry args={[1.2, 2]} />
      case 'c2_server':
        return <octahedronGeometry args={[1.1, 0]} />
      case 'firewall':
        return <boxGeometry args={[1.2, 1.2, 1.2]} />
      case 'router':
        return <torusGeometry args={[0.9, 0.35, 16, 32]} />
      case 'server':
        return <cylinderGeometry args={[0.8, 0.8, 1.3, 16]} />
      case 'workstation':
        return <sphereGeometry args={[0.85, 24, 24]} />
      case 'laptop':
        return <boxGeometry args={[0.9, 0.6, 0.9]} />
      case 'iot':
        return <dodecahedronGeometry args={[0.6, 0]} />
      case 'decommissioned':
        return <dodecahedronGeometry args={[0.75, 0]} />
      default:
        return <sphereGeometry args={[0.7, 16, 16]} />
    }
  }

  return (
    <group position={node.position}>
      {/* 1. Pulsing Quarantine Cage Shield for Isolated 802.1X Nodes */}
      {isIsolated && (
        <mesh ref={cageRef}>
          <octahedronGeometry args={[1.7, 1]} />
          <meshBasicMaterial
            color="#F43F5E"
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>
      )}

      {/* 2. Perimeter Firewall Drop Ring for Blocked Adversary IPs */}
      {isBlockedIp && (
        <mesh>
          <ringGeometry args={[1.3, 1.6, 32]} />
          <meshBasicMaterial
            color="#EF4444"
            side={THREE.DoubleSide}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* 3. Outer Halo / Wireframe Ring if selected or high risk */}
      {(isSelected || hovered || node.status === 'COMPROMISED') && (
        <mesh>
          <sphereGeometry args={[1.6, 16, 16]} />
          <meshBasicMaterial
            color={nodeColor}
            wireframe
            transparent
            opacity={node.status === 'COMPROMISED' ? 0.45 : 0.25}
          />
        </mesh>
      )}

      {/* 4. Main Node Solid Mesh */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        {renderGeometry()}
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isDecomm ? 0.2 : hovered || isSelected ? 0.9 : 0.45}
          roughness={isDecomm ? 0.8 : 0.2}
          metalness={isDecomm ? 0.1 : 0.8}
          wireframe={isDecomm}
          transparent={isDecomm}
          opacity={isDecomm ? 0.45 : 1}
        />
      </mesh>

      {/* 5. 3D Spatial Interactive Billboard Label */}
      <Html
        position={[0, 1.45, 0]}
        center
        distanceFactor={18}
        className="pointer-events-none select-none"
      >
        <div
          className={`flex flex-col items-center gap-0.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-mono shadow-lg backdrop-blur-md transition-all duration-200 ${
            isIsolated
              ? 'bg-red-950/90 text-red-300 border border-red-500/70 shadow-neon-red/30'
              : isBlockedIp
              ? 'bg-red-950/90 text-red-300 border border-red-500/70 shadow-neon-red/30'
              : isDecomm
              ? 'bg-slate-950/80 text-amber-300/80 border border-amber-500/40 opacity-75'
              : node.status === 'COMPROMISED'
              ? 'bg-red-950/90 text-red-200 border border-red-500 shadow-neon-red animate-pulse'
              : node.status === 'SUSPICIOUS'
              ? 'bg-amber-950/90 text-amber-200 border border-amber-500'
              : isSelected
              ? 'bg-cyan-950/90 text-cyan-200 border border-cyan-400 scale-110 shadow-neon-cyan'
              : 'bg-slate-950/85 text-slate-200 border border-slate-700/60'
          }`}
        >
          <div className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isIsolated
                  ? 'bg-red-400 animate-ping'
                  : isBlockedIp
                  ? 'bg-red-500'
                  : isDecomm
                  ? 'bg-amber-500'
                  : node.status === 'COMPROMISED'
                  ? 'bg-red-500 animate-ping'
                  : node.status === 'SUSPICIOUS'
                  ? 'bg-amber-400'
                  : 'bg-cyan-400'
              }`}
            />
            <span className="font-bold">{node.id}</span>
          </div>

          <span className="text-[9px] text-slate-400">
            {isIsolated
              ? '802.1X QUARANTINED'
              : isBlockedIp
              ? 'FW DROP PERIMETER'
              : isDecomm
              ? 'DECOMMISSIONED'
              : node.ip}
          </span>
        </div>
      </Html>
    </group>
  )
}

export const NetworkNodes: React.FC<NetworkNodesProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  nodeScale = 1.0,
}) => {
  return (
    <group>
      {nodes.map((node) => (
        <NodeMesh
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          onSelect={() => onSelectNode(node)}
          nodeScale={nodeScale}
        />
      ))}
    </group>
  )
}
