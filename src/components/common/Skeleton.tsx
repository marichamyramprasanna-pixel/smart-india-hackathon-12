import React from 'react'
import { cn } from '../../utils/cn'

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-800/70 border border-slate-700/40', className)}
      {...props}
    />
  )
}
