import React from 'react'
import { Network3DNode, Network3DLink } from '../../types/network'
import { Badge } from '../common/Badge'

interface Network2DFallbackProps {
  nodes: Network3DNode[]
  links: Network3DLink[]
  selectedNodeId: string | null
  onSelectNode: (node: Network3DNode) => void
}

export const Network2DFallback: React.FC<Network2DFallbackProps> = ({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
}) => {
  // Normalize 3D coordinates (-12..12) into SVG viewBox (800x500)
  const mapCoords = (pos: [number, number, number]): [number, number] => {
    const x = ((pos[0] + 14) / 28) * 740 + 30
    const y = ((-pos[1] + 10) / 20) * 440 + 30
    return [x, y]
  }

  const nodeMap = new Map<string, [number, number]>()
  nodes.forEach((n) => nodeMap.set(n.id, mapCoords(n.position)))

  return (
    <div className="relative w-full h-full min-h-[420px] bg-slate-950/90 rounded-xl border border-slate-800 p-4 overflow-hidden">
      <svg className="w-full h-full min-h-[400px]" viewBox="0 0 800 500">
        {/* Background Grid Pattern */}
        <defs>
          <pattern id="grid2d" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#grid2d)" />

        {/* Links */}
        {links.map((link) => {
          const src = nodeMap.get(link.source)
          const tgt = nodeMap.get(link.target)
          if (!src || !tgt) return null

          const isCompromised = link.status === 'compromised'
          const isSuspicious = link.status === 'suspicious'

          return (
            <g key={link.id}>
              <line
                x1={src[0]}
                y1={src[1]}
                x2={tgt[0]}
                y2={tgt[1]}
                stroke={isCompromised ? '#EF4444' : isSuspicious ? '#F59E0B' : '#00F0FF'}
                strokeWidth={isCompromised ? 2.5 : 1.5}
                strokeOpacity={isCompromised ? 0.85 : 0.35}
                strokeDasharray={isCompromised ? '6,3' : undefined}
              />
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const coords = nodeMap.get(node.id)
          if (!coords) return null

          const isSelected = selectedNodeId === node.id
          const isCompromised = node.status === 'COMPROMISED'
          const isSuspicious = node.status === 'SUSPICIOUS'

          const nodeColor = isCompromised ? '#EF4444' : isSuspicious ? '#F59E0B' : '#00F0FF'

          return (
            <g
              key={node.id}
              transform={`translate(${coords[0]}, ${coords[1]})`}
              className="cursor-pointer"
              onClick={() => onSelectNode(node)}
            >
              {/* Outer pulsing ring for critical nodes */}
              {(isCompromised || isSelected) && (
                <circle
                  r="24"
                  fill="none"
                  stroke={nodeColor}
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                  className={isCompromised ? 'animate-ping' : ''}
                />
              )}

              {/* Main Node Circle */}
              <circle
                r="16"
                fill={nodeColor}
                fillOpacity="0.25"
                stroke={nodeColor}
                strokeWidth={isSelected ? 3 : 2}
              />

              <circle r="6" fill={nodeColor} />

              {/* Label */}
              <text
                y="30"
                textAnchor="middle"
                className="fill-slate-200 text-[11px] font-mono font-semibold select-none"
              >
                {node.id}
              </text>
              {isCompromised && (
                <text
                  y="42"
                  textAnchor="middle"
                  className="fill-red-400 text-[9px] font-mono font-bold select-none"
                >
                  RISK 94%
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
