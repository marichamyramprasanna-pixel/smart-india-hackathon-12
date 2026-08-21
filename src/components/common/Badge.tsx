import React from 'react'
import { cn } from '../../utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'critical' | 'high' | 'medium' | 'low' | 'healthy' | 'ai' | 'outline'
  pulse?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  pulse = false,
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    critical: 'bg-red-500/20 text-red-300 border-red-500/50 shadow-red-glow-sm',
    high: 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-amber-glow',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    low: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    healthy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-glow',
    ai: 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-purple-glow',
    outline: 'bg-transparent text-slate-300 border-slate-600',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            variant === 'critical' ? 'bg-red-400' :
            variant === 'high' ? 'bg-orange-400' :
            variant === 'healthy' ? 'bg-emerald-400' :
            variant === 'ai' ? 'bg-purple-400' : 'bg-cyan-400'
          )} />
          <span className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            variant === 'critical' ? 'bg-red-500' :
            variant === 'high' ? 'bg-orange-500' :
            variant === 'healthy' ? 'bg-emerald-500' :
            variant === 'ai' ? 'bg-purple-500' : 'bg-cyan-500'
          )} />
        </span>
      )}
      {children}
    </div>
  )
}
