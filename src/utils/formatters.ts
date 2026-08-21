import { format, formatDistanceToNow } from 'date-fns'

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function formatPercentage(val: number, decimals: number = 1): string {
  return `${val.toFixed(decimals)}%`
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)
}

export function formatTimestamp(date: Date | string | number, formatStr: string = 'HH:mm:ss'): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  try {
    return format(d, formatStr)
  } catch {
    return '00:00:00'
  }
}

export function formatRelativeTime(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  try {
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return 'just now'
  }
}

export function getSeverityColor(severity: 'critical' | 'high' | 'medium' | 'low' | 'info' | string): {
  bg: string
  text: string
  border: string
  glow: string
  badge: string
} {
  switch (severity.toLowerCase()) {
    case 'critical':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        glow: 'shadow-red-glow-sm',
        badge: 'bg-red-500/20 text-red-300 border-red-500/40',
      }
    case 'high':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        glow: 'shadow-amber-glow',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      }
    case 'medium':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        glow: 'shadow-amber-glow',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      }
    case 'low':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        glow: 'shadow-cyan-glow-sm',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      }
    case 'info':
    default:
      return {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        glow: 'shadow-cyan-glow-sm',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      }
  }
}
