import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { AIChatMessage } from '../types/ai'
import { sendChatMessage } from '../api/ai'
import { trackEvent } from '../api/analytics'

interface ActiveContextInfo {
  type: 'device' | 'threat' | 'network' | 'global'
  id?: string
  name?: string
}

interface SentinelAIContextType {
  isOpen: boolean
  isMinimized: boolean
  isLoading: boolean
  messages: AIChatMessage[]
  currentContext: ActiveContextInfo
  setIsOpen: (open: boolean) => void
  setIsMinimized: (minimized: boolean) => void
  toggleOpen: () => void
  setCurrentContext: (ctx: ActiveContextInfo) => void
  sendMessage: (text: string) => Promise<void>
  clearChat: () => void
  sendQuickAction: (actionLabel: string) => void
}

const INITIAL_MESSAGE: AIChatMessage = {
  id: 'msg-welcome',
  sender: 'assistant',
  timestamp: new Date().toLocaleTimeString(),
  content: `Hello, Analyst. I'm **Sentinel AI**.\n\nI can analyze network telemetry, investigate suspicious devices, explain AI behavioral detections, trace attack paths, and generate incident reports.\n\nHow can I assist your investigation?`,
  suggestedActions: [
    { id: 'qa-1', label: 'Investigate Threats', actionType: 'filter_threats' },
    { id: 'qa-2', label: 'Analyze DEVICE-042', actionType: 'navigate', payload: { path: '/devices/DEVICE-042' } },
    { id: 'qa-3', label: 'Explain AI Detection', actionType: 'explain_anomaly' },
    { id: 'qa-4', label: 'Trace Attack Path', actionType: 'navigate', payload: { path: '/attack-graph' } },
    { id: 'qa-5', label: 'Generate Incident Summary', actionType: 'generate_report' },
  ],
}

const SentinelAIContext = createContext<SentinelAIContextType | undefined>(undefined)

export const SentinelAIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isMinimized, setIsMinimized] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<AIChatMessage[]>([INITIAL_MESSAGE])
  const [currentContext, setCurrentContext] = useState<ActiveContextInfo>({
    type: 'global',
    name: 'Command Center',
  })

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) trackEvent('ai_chat_opened', { contextType: currentContext.type })
      return next
    })
  }, [currentContext.type])

  const clearChat = useCallback(() => {
    setMessages([INITIAL_MESSAGE])
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      content: text,
      context: currentContext,
    }

    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    trackEvent('ai_question_submitted', { queryLength: text.length, context: currentContext.type })

    try {
      const response = await sendChatMessage({
        message: text,
        context: {
          type: currentContext.type,
          id: currentContext.id,
        },
        conversation_id: 'conv-session-01',
      })

      const assistantMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
        content: response.message,
        confidence: response.confidence,
        context: currentContext,
        suggestedActions: response.actions as AIChatMessage['suggestedActions'],
        structuredInsight: response.structuredInsight,
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const errorMsg: AIChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'system',
        timestamp: new Date().toLocaleTimeString(),
        content: '⚠️ Sentinel AI is temporarily operating in offline cache mode. Please retry your inquiry.',
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [currentContext])

  const sendQuickAction = useCallback((actionLabel: string) => {
    sendMessage(actionLabel)
  }, [sendMessage])

  // Context updates helper
  useEffect(() => {
    // Optional event listening or analytics hook
  }, [currentContext])

  return (
    <SentinelAIContext.Provider
      value={{
        isOpen,
        isMinimized,
        isLoading,
        messages,
        currentContext,
        setIsOpen,
        setIsMinimized,
        toggleOpen,
        setCurrentContext,
        sendMessage,
        clearChat,
        sendQuickAction,
      }}
    >
      {children}
    </SentinelAIContext.Provider>
  )
}

export function useSentinelAI(): SentinelAIContextType {
  const context = useContext(SentinelAIContext)
  if (!context) {
    throw new Error('useSentinelAI must be used within a SentinelAIProvider')
  }
  return context
}
