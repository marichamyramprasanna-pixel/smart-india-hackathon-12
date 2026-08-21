import React from 'react'
import { cn } from '../../utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'cyber' | 'threat' | 'ai' | 'glass'
  glow?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'cyber', glow = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-card text-card-foreground border border-border shadow-sm',
      cyber: 'cyber-panel text-slate-100 rounded-lg',
      threat: 'cyber-panel-threat text-slate-100 rounded-lg',
      ai: 'cyber-panel-ai text-slate-100 rounded-lg',
      glass: 'bg-slate-900/60 backdrop-blur-md border border-slate-800 text-slate-100 rounded-lg',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-200',
          variants[variant],
          glow && 'cyber-border-glow shadow-cyan-glow-sm',
          className
        )}
        {...props}
      >
        {children}
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
