import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BrainCircuit,
  User,
  ShieldAlert,
  ArrowRight,
  Lock,
  Network,
  Clock,
  FileText,
  CheckCircle,
} from 'lucide-react'
import { AIChatMessage } from '../../types/ai'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { useInvestigation } from '../../context/InvestigationContext'

interface ChatMessageListProps {
  messages: AIChatMessage[]
  isLoading: boolean
  onActionClick: (action: { id: string; label: string; actionType?: string; payload?: Record<string, unknown> }) => void
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  onActionClick,
}) => {
  const navigate = useNavigate()
  const { isolateDevice, isDeviceIsolated } = useInvestigation()

  const handleAction = (act: any) => {
    if (act.actionType === 'navigate' && act.payload?.path) {
      navigate(act.payload.path)
    } else if (act.actionType === 'isolate_device' && act.payload?.deviceId) {
      isolateDevice(act.payload.deviceId)
    } else if (act.actionType === 'generate_report') {
      navigate('/reports')
    } else {
      onActionClick(act)
    }
  }

  // Format simple markdown into styled elements
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n')
    return (
      <div className="space-y-1.5 text-xs text-slate-200 leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <p key={idx} className="font-bold text-cyan-300">
                {line.replace(/\*\*/g, '')}
              </p>
            )
          }
          if (line.startsWith('- **')) {
            const parts = line.replace('- **', '').split('**')
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-slate-100">{parts[0]}</strong>
                  {parts.slice(1).join('')}
                </span>
              </div>
            )
          }
          if (line.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-1">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <span>{line.replace('- ', '')}</span>
              </div>
            )
          }
          if (line.startsWith('*') && line.endsWith('*')) {
            return (
              <p key={idx} className="text-slate-400 italic text-[11px]">
                {line.replace(/\*/g, '')}
              </p>
            )
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />
          }
          return <p key={idx}>{line}</p>
        })}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => {
        const isUser = msg.sender === 'user'
        const isSystem = msg.sender === 'system'

        if (isSystem) {
          return (
            <div key={msg.id} className="text-center p-2 rounded bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300">
              {msg.content}
            </div>
          )
        }

        return (
          <div
            key={msg.id}
            className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!isUser && (
              <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-lg bg-purple-900/60 border border-purple-500/40 text-purple-300 shadow-purple-glow">
                <BrainCircuit className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3.5 space-y-2.5 ${
                isUser
                  ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/40 rounded-tr-none'
                  : 'bg-slate-900/90 text-slate-100 border border-slate-800 rounded-tl-none shadow-md'
              }`}
            >
              {/* Header Timestamp */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800/60 pb-1">
                <span className="font-mono font-medium">
                  {isUser ? 'Analyst' : 'Sentinel AI (Probabilistic SOC Engine)'}
                </span>
                <span className="font-mono">{msg.timestamp}</span>
              </div>

              {/* Message Content */}
              {renderFormattedContent(msg.content)}

              {/* Structured Security Insight Card if available */}
              {msg.structuredInsight && (
                <div className="p-3 rounded-lg bg-slate-950 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-purple-300">
                      {msg.structuredInsight.title}
                    </span>
                    <Badge variant="critical" className="text-[9px]">
                      RISK {msg.structuredInsight.riskScore}%
                    </Badge>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300">
                    <span className="text-slate-500 font-mono text-[10px] uppercase block">
                      Evidence Correlation:
                    </span>
                    {msg.structuredInsight.evidence.map((ev, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-purple-400" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-cyan-300 font-medium pt-1 border-t border-slate-800">
                    💡 {msg.structuredInsight.recommendedMitigation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => handleAction(act)}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/40 text-[11px] font-medium text-slate-200 hover:text-cyan-300 transition-colors flex items-center gap-1"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isUser && (
              <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-lg bg-cyan-900/60 border border-cyan-500/40 text-cyan-300">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        )
      })}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3 items-center text-xs text-purple-300 bg-purple-950/20 p-3 rounded-lg border border-purple-500/20">
          <BrainCircuit className="h-4 w-4 animate-spin text-purple-400" />
          <span className="font-mono">Sentinel AI is computing multi-dimensional behavioral probabilities...</span>
        </div>
      )}
    </div>
  )
}
