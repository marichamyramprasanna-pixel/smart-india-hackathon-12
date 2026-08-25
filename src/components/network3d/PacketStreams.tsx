import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Network3DNode, Network3DLink } from '../../types/network'

interface PacketStreamsProps {
  nodes: Network3DNode[]
  links: Network3DLink[]
}

export const PacketStreams: React.FC<PacketStreamsProps> = ({ nodes, links }) => {
  const particleGroupRef = useRef<THREE.Group>(null)

  // Map nodes to coordinates lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, [number, number, number]>()
    nodes.forEach((n) => map.set(n.id, n.position))
    return map
  }, [nodes])

  // Generate line geometries for all links
  const linkLines = useMemo(() => {
    return links
      .map((link) => {
        const srcPos = nodeMap.get(link.source)
        const tgtPos = nodeMap.get(link.target)
        if (!srcPos || !tgtPos) return null

        const points = [
          new THREE.Vector3(...srcPos),
          new THREE.Vector3(...tgtPos),
        ]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)

        let color = '#38BDF8' // Sky Blue
        let opacity = 0.4
        const isBlocked = link.status === 'blocked'
        const isTombstone = link.status === 'tombstone'

        if (link.status === 'compromised') {
          color = '#EF4444' // Red
          opacity = 0.8
        } else if (link.status === 'suspicious') {
          color = '#F59E0B' // Amber
          opacity = 0.6
        } else if (isBlocked) {
          color = '#F43F5E' // Rose Red (Quarantine / Null-Route)
          opacity = 0.35
        } else if (isTombstone) {
          color = '#D97706' // Faint Amber
          opacity = 0.15
        }

        return {
          id: link.id,
          geometry,
          color,
          opacity,
          link,
          srcPos,
          tgtPos,
          hasPackets: !isBlocked && !isTombstone,
        }
      })
      .filter(Boolean) as {
      id: string
      geometry: THREE.BufferGeometry
      color: string
      opacity: number
      link: Network3DLink
      srcPos: [number, number, number]
      tgtPos: [number, number, number]
      hasPackets: boolean
    }[]
  }, [links, nodeMap])

  // Active packet lines that actually transmit data
  const activePacketLines = useMemo(() => {
    return linkLines.filter((l) => l.hasPackets)
  }, [linkLines])

  // Animated packet particles travelling along active links
  useFrame(({ clock }) => {
    if (!particleGroupRef.current || activePacketLines.length === 0) return
    const t = clock.getElapsedTime()

    particleGroupRef.current.children.forEach((child, index) => {
      const lineData = activePacketLines[index % activePacketLines.length]
      if (!lineData) return

      const speed = (lineData.link.trafficSpeed || 1) * 0.45
      const progress = (t * speed + index * 0.22) % 1

      const src = new THREE.Vector3(...lineData.srcPos)
      const tgt = new THREE.Vector3(...lineData.tgtPos)
      const currentPos = new THREE.Vector3().lerpVectors(src, tgt, progress)

      child.position.copy(currentPos)
    })
  })

  return (
    <group>
      {/* Static & Severed Connection Lines */}
      {linkLines.map((l) => (
        // @ts-expect-error - Three.js line primitive JSX
        <line key={l.id} geometry={l.geometry}>
          <lineBasicMaterial
            color={l.color}
            transparent
            opacity={l.opacity}
            linewidth={1}
          />
        </line>
      ))}

      {/* Animated Packet Stream Particles (Zero for blocked/tombstone links) */}
      <group ref={particleGroupRef}>
        {activePacketLines.map((l, idx) => (
          <mesh key={`p-${idx}`}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshBasicMaterial
              color={l.color}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
