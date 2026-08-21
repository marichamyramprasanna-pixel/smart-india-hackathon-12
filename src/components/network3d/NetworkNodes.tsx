import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { Network3DNode } from '../../types/network'

interface NetworkNodesProps {
  nodes: Network3DNode[]
  selectedNodeId: string | null
  onSelectNode: (node: Network3DNode) => void
}

const NodeMesh: React.FC<{
  node: Network3DNode
  isSelected: boolean
  onSelect: () => void
}> = ({ node, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Determine node color based on status
  const getColor = () => {
    switch (node.status) {
      case 'COMPROMISED':
        return '#EF4444' // Red
      case 'SUSPICIOUS':
        return '#F59E0B' // Amber/Orange
      case 'AI_FLAGGED':
        return '#A855F7' // Purple
      case 'HEALTHY':
      default:
        return '#00F0FF' // Cyan
    }
  }

  const nodeColor = getColor()

  // Gentle floating and rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4
      meshRef.current.rotation.x += delta * 0.2
      if (node.status === 'COMPROMISED') {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.15
        meshRef.current.scale.set(pulse, pulse, pulse)
      }
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
      default:
        return <sphereGeometry args={[0.7, 16, 16]} />
    }
  }

  return (
    <group position={node.position}>
      {/* Outer Halo / Wireframe Ring if selected or high risk */}
      {(isSelected || hovered || node.status === 'COMPROMISED') && (
        <mesh>
          <sphereGeometry args={[1.6, 16, 16]} />
          <meshBasicMaterial
            color={nodeColor}
            wireframe
            transparent
            opacity={node.status === 'COMPROMISED' ? 0.4 : 0.25}
          />
        </mesh>
      )}

      {/* Main Node Solid Mesh */}
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
        scale={hovered || isSelected ? 1.25 : 1}
      >
        {renderGeometry()}
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={node.status === 'COMPROMISED' ? 0.8 : hovered || isSelected ? 0.6 : 0.3}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* 3D HTML Label */}
      <Html
        position={[0, 1.5, 0]}
        center
        distanceFactor={22}
        className="pointer-events-none select-none"
      >
        <div
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold backdrop-blur-md border transition-all whitespace-nowrap ${
            isSelected || hovered
              ? 'bg-slate-900/95 text-cyan-300 border-cyan-400 shadow-cyan-glow-sm scale-110'
              : node.status === 'COMPROMISED'
              ? 'bg-red-950/90 text-red-200 border-red-500/80 shadow-red-glow-sm animate-pulse'
              : node.status === 'SUSPICIOUS'
              ? 'bg-amber-950/80 text-amber-200 border-amber-500/60'
              : 'bg-slate-950/80 text-slate-300 border-slate-700/60'
          }`}
        >
          {node.id}
          {node.status === 'COMPROMISED' && ' [94%]'}
        </div>
      </Html>
    </group>
  )
}

export const NetworkNodes: React.FC<NetworkNodesProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
}) => {
  return (
    <group>
      {nodes.map((node) => (
        <NodeMesh
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          onSelect={() => onSelectNode(node)}
        />
      ))}
    </group>
  )
}
