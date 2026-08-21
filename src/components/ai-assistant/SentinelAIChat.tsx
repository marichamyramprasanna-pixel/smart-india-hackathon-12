import React, { useState, useRef, useEffect } from 'react'
import {
  BrainCircuit,
  X,
  Minus,
  Maximize2,
  Send,
  Sparkles,
  Zap,
  Trash2,
} from 'lucide-react'
import { useSentinelAI } from '../../context/SentinelAIContext'
import { ChatMessageList } from './ChatMessageList'
import { QuickActionChips } from './QuickActionChips'
import { ContextIndicator } from './ContextIndicator'
import { Button } from '../common/Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../common/Tooltip'

export const SentinelAIChat: React.FC = () => {
  const {
    isOpen,
    isMinimized,
    isLoading,
    messages,
    currentContext,
    setIsOpen,
    setIsMinimized,
    toggleOpen,
    sendMessage,
    clearChat,
  } = useSentinelAI()

  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim() || isLoading) return
    sendMessage(inputVal)
    setInputVal('')
  }

  return (
    <>
      {/* Floating Bottom-Right Action Button when closed */}
      {!isOpen && (
        <TooltipProvider>
          <div className="fixed bottom-6 right-6 z-50">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleOpen}
                  className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-glow hover:brightness-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                  aria-label="Ask Sentinel AI"
                >
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-400 border border-slate-900" />
                  </span>
                  <BrainCircuit className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="font-semibold text-xs">
                Ask Sentinel AI (⌘/)
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )}

      {/* Floating Chat Panel (420px x 650px desktop, full-screen on mobile) */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 ${
            isMinimized
              ? 'bottom-6 right-6 w-80 h-14 rounded-xl'
              : 'bottom-0 right-0 sm:bottom-6 sm:right-6 w-full h-full sm:w-[420px] sm:h-[650px] sm:max-h-[85vh] sm:rounded-2xl'
          } flex flex-col border border-purple-500/40 bg-slate-950/98 shadow-2xl backdrop-blur-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className="flex h-14 items-center justify-between px-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-glow-sm">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-xs text-slate-100">
                    Sentinel AI
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-purple-300 font-mono">
                  AI Security Analyst Copilot
                </p>
              </div>
            </div>

            {/* Window controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                title="Clear Chat History"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hidden sm:block p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                title={isMinimized ? 'Expand window' : 'Minimize window'}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                title="Close AI Copilot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Context Awareness Bar */}
              <ContextIndicator context={currentContext} />

              {/* Chat Message Stream */}
              <ChatMessageList
                messages={messages}
                isLoading={isLoading}
                onActionClick={(act) => sendMessage(act.label)}
              />

              {/* Quick Action Chips */}
              <QuickActionChips onSelectAction={(prompt) => sendMessage(prompt)} />

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask Sentinel AI to analyze, explain, or triage..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                />
                <Button
                  variant="ai"
                  size="sm"
                  type="submit"
                  disabled={!inputVal.trim() || isLoading}
                  className="h-9 w-9 p-0 rounded-md"
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
