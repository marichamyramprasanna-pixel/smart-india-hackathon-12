import React from 'react'
import { cn } from '../../utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'cyber' | 'ai'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none rounded-md'

    const variants = {
      primary: 'bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 active:bg-cyan-600 shadow-cyan-glow-sm',
      secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 active:bg-slate-850',
      outline: 'border border-cyan-500/40 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-500/15 active:bg-cyan-500/25',
      ghost: 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60',
      destructive: 'bg-red-600 text-white hover:bg-red-500 shadow-red-glow-sm active:bg-red-700',
      cyber: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold hover:brightness-110 shadow-cyan-glow',
      ai: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:brightness-110 shadow-purple-glow',
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
