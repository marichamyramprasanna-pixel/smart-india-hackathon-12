import React from 'react'
import { Radio, Shield, Laptop, AlertTriangle } from 'lucide-react'

interface ContextIndicatorProps {
  context: {
    type: 'device' | 'threat' | 'network' | 'global'
    id?: string
    name?: string
  }
}

export const ContextIndicator: React.FC<ContextIndicatorProps> = ({ context }) => {
  const getIcon = () => {
    switch (context.type) {
      case 'device':
        return <Laptop className="h-3 w-3 text-cyan-400" />
      case 'threat':
        return <AlertTriangle className="h-3 w-3 text-red-400" />
      case 'network':
        return <Radio className="h-3 w-3 text-purple-400" />
      default:
        return <Shield className="h-3 w-3 text-slate-400" />
    }
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
      <span className="text-slate-500">Context:</span>
      <div className="flex items-center gap-1 font-mono font-medium text-slate-200">
        {getIcon()}
        <span>{context.id || context.name || 'Network SOC Console'}</span>
      </div>
    </div>
  )
}
