import React, { useRef, useState, useCallback } from 'react'
import { cn } from '../../utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'cyber' | 'threat' | 'ai' | 'glass'
  glow?: boolean
  tilt?: boolean
  spotlight?: boolean
  spotlightColor?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'red' | 'white'
}

const SPOTLIGHT_COLORS = {
  cyan: {
    spotlight: 'rgba(0, 240, 255, 0.08)',
    borderSpotlight: 'rgba(0, 240, 255, 0.40)',
  },
  purple: {
    spotlight: 'rgba(168, 85, 247, 0.09)',
    borderSpotlight: 'rgba(168, 85, 247, 0.40)',
  },
  emerald: {
    spotlight: 'rgba(16, 185, 129, 0.08)',
    borderSpotlight: 'rgba(16, 185, 129, 0.40)',
  },
  amber: {
    spotlight: 'rgba(245, 158, 11, 0.08)',
    borderSpotlight: 'rgba(245, 158, 11, 0.40)',
  },
  red: {
    spotlight: 'rgba(244, 63, 94, 0.10)',
    borderSpotlight: 'rgba(244, 63, 94, 0.45)',
  },
  white: {
    spotlight: 'rgba(255, 255, 255, 0.06)',
    borderSpotlight: 'rgba(255, 255, 255, 0.25)',
  },
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'cyber',
      glow = false,
      tilt = false,
      spotlight = true,
      spotlightColor,
      children,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLDivElement | null>(null)
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)
    const [transformStyle, setTransformStyle] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg)')

    const variants = {
      default: 'bg-card text-card-foreground border border-border shadow-sm',
      cyber: 'cyber-panel text-slate-100 rounded-2xl',
      threat: 'cyber-panel-threat text-slate-100 rounded-2xl',
      ai: 'cyber-panel-ai text-slate-100 rounded-2xl',
      glass: 'bg-slate-900/60 backdrop-blur-xl border border-slate-800 text-slate-100 rounded-2xl',
    }

    const defaultColor =
      variant === 'threat'
        ? 'red'
        : variant === 'ai'
        ? 'purple'
        : 'cyan'
    const colorKey = spotlightColor || defaultColor
    const colors = SPOTLIGHT_COLORS[colorKey] || SPOTLIGHT_COLORS.cyan

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
          const rotateX = -((y - centerY) / centerY) * 4
          const rotateY = ((x - centerX) / centerX) * 4
          setTransformStyle(
            `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.008, 1.008, 1.008)`
          )
        }

        if (onMouseMove) onMouseMove(e)
      },
      [tilt, onMouseMove]
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

    return (
      <div
        ref={(node) => {
          internalRef.current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: tilt ? transformStyle : undefined,
          transformStyle: tilt ? 'preserve-3d' : undefined,
        }}
        className={cn(
          'relative overflow-hidden transition-[box-shadow,border-color,transform] duration-200 ease-out',
          variants[variant],
          glow && 'cyber-border-glow shadow-cyan-glow-sm',
          className
        )}
        {...props}
      >
        {/* Dynamic Radial Mouse Spotlight */}
        {spotlight && isHovered && (
          <div
            className="pointer-events-none absolute -inset-px z-10 transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${colors.spotlight}, transparent 75%)`,
            }}
          />
        )}

        {/* Dynamic Border Spotlight */}
        {spotlight && isHovered && (
          <div
            className="pointer-events-none absolute -inset-px z-10 rounded-[inherit] transition-opacity duration-300"
            style={{
              border: `1px solid ${colors.borderSpotlight}`,
              maskImage: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 80%)`,
              WebkitMaskImage: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 80%)`,
            }}
          />
        )}

        <div className="relative z-0 h-full w-full">{children}</div>
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-5 pb-3 flex flex-col space-y-1.5 border-b border-slate-800/60', className)} {...props}>
    {children}
  </div>
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-base font-semibold tracking-tight text-slate-100 flex items-center gap-2', className)} {...props}>
    {children}
  </h3>
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-xs text-slate-400', className)} {...props}>
    {children}
  </p>
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => <div className={cn('p-5 pt-4', className)} {...props}>{children}</div>

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-5 pt-0 flex items-center justify-between border-t border-slate-800/40', className)} {...props}>
    {children}
  </div>
)
