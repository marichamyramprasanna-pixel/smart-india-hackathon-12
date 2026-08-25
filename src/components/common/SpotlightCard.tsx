import React, { useRef, useState, useCallback } from 'react'
import { cn } from '../../utils/cn'

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'red' | 'white'
  tilt?: boolean
  maxTilt?: number
  glowOnHover?: boolean
  children?: React.ReactNode
}

const COLOR_MAP = {
  cyan: {
    spotlight: 'rgba(0, 240, 255, 0.12)',
    borderSpotlight: 'rgba(0, 240, 255, 0.45)',
  },
  purple: {
    spotlight: 'rgba(168, 85, 247, 0.14)',
    borderSpotlight: 'rgba(168, 85, 247, 0.45)',
  },
  emerald: {
    spotlight: 'rgba(16, 185, 129, 0.12)',
    borderSpotlight: 'rgba(16, 185, 129, 0.45)',
  },
  amber: {
    spotlight: 'rgba(245, 158, 11, 0.12)',
    borderSpotlight: 'rgba(245, 158, 11, 0.45)',
  },
  red: {
    spotlight: 'rgba(244, 63, 94, 0.15)',
    borderSpotlight: 'rgba(244, 63, 94, 0.50)',
  },
  white: {
    spotlight: 'rgba(255, 255, 255, 0.08)',
    borderSpotlight: 'rgba(255, 255, 255, 0.30)',
  },
}

export const SpotlightCard = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
  (
    {
      className,
      spotlightColor = 'cyan',
      tilt = true,
      maxTilt = 6,
      glowOnHover = true,
      children,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLDivElement | null>(null)
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)
    const [transformStyle, setTransformStyle] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg)')

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const card = internalRef.current
        if (!card) return

        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setMousePos({ x, y })
        setIsHovered(true)

        if (tilt) {
          const centerX = rect.width / 2
          const centerY = rect.height / 2

          const rotateX = -((y - centerY) / centerY) * maxTilt
          const rotateY = ((x - centerX) / centerX) * maxTilt

          setTransformStyle(
            `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`
          )
        }

        if (onMouseMove) onMouseMove(e)
      },
      [tilt, maxTilt, onMouseMove]
    )

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        setIsHovered(false)
        if (tilt) {
          setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
        }
        if (onMouseLeave) onMouseLeave(e)
      },
      [tilt, onMouseLeave]
    )

    const colors = COLOR_MAP[spotlightColor] || COLOR_MAP.cyan

    return (
      <div
        ref={(node) => {
          internalRef.current = node
          if (typeof forwardedRef === 'function') {
            forwardedRef(node)
          } else if (forwardedRef) {
            forwardedRef.current = node
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: transformStyle,
          transformStyle: 'preserve-3d',
        }}
        className={cn(
          'relative overflow-hidden transition-[transform,box-shadow,border-color] duration-200 ease-out will-change-transform',
          className
        )}
        {...props}
      >
        {/* Dynamic Radial Mouse Spotlight Layer */}
        {glowOnHover && isHovered && (
          <div
            className="pointer-events-none absolute -inset-px z-10 transition-opacity duration-300"
            style={{
              background: `radial-gradient(360px circle at ${mousePos.x}px ${mousePos.y}px, ${colors.spotlight}, transparent 75%)`,
            }}
          />
        )}

        {/* Dynamic Border Spotlight Glow */}
        {isHovered && (
          <div
            className="pointer-events-none absolute -inset-px z-10 rounded-[inherit] transition-opacity duration-300"
            style={{
              border: `1px solid ${colors.borderSpotlight}`,
              maskImage: `radial-gradient(180px circle at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 80%)`,
              WebkitMaskImage: `radial-gradient(180px circle at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 80%)`,
            }}
          />
        )}

        {/* Inner Content */}
        <div className="relative z-0 h-full w-full">{children}</div>
      </div>
    )
  }
)

SpotlightCard.displayName = 'SpotlightCard'
