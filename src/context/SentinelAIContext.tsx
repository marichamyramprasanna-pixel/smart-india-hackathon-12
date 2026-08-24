import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { AIChatMessage } from '../types/ai'
import { sendChatMessage } from '../api/ai'
import { trackEvent } from '../api/analytics'
import { useDevices } from '../hooks/useDevices'
import { useAlerts } from '../hooks/useAlerts'

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
  content: `Hello, Analyst. I'm **Sentinel AI**.\n\nI can analyze your live device inventory, investigate suspicious endpoints, explain AI behavioral detections, trace attack paths, and generate incident reports.\n\nHow can I assist your investigation?`,
  suggestedActions: [
    { id: 'qa-1', label: 'Investigate Threats', actionType: 'filter_threats' },
    { id: 'qa-2', label: 'Explain AI Detection', actionType: 'explain_anomaly' },
    { id: 'qa-3', label: 'Trace Attack Path', actionType: 'navigate', payload: { path: '/attack-graph' } },
    { id: 'qa-4', label: 'Generate Incident Summary', actionType: 'generate_report' },
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

  // Pull live inventory data to feed into Sentinel AI context
  const { devices } = useDevices()
  const { alerts } = useAlerts()

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
      // Pass live devices and alerts into the AI request so it can build
      // a dynamic, accurate system prompt from the real database state
      const response = await sendChatMessage({
        message: text,
        context: {
          type: currentContext.type,
          id: currentContext.id,
        },
        conversation_id: 'conv-session-01',
        devices,
        alerts,
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
  }, [currentContext, devices, alerts])

  const sendQuickAction = useCallback((actionLabel: string) => {
    sendMessage(actionLabel)
  }, [sendMessage])

  // Optional: update welcome message's suggested actions when live data arrives
  useEffect(() => {
    const compromised = devices.filter((d) => d.status === 'COMPROMISED')
    const topDevice = compromised[0] || devices.find((d) => d.status === 'SUSPICIOUS') || devices[0]
    if (topDevice) {
      setMessages((prev) => {
        if (prev.length !== 1 || prev[0].id !== 'msg-welcome') return prev
        return [{
          ...prev[0],
          suggestedActions: [
            { id: 'qa-1', label: `Investigate ${topDevice.id}`, actionType: 'navigate', payload: { path: `/devices/${topDevice.id}` } },
            { id: 'qa-2', label: 'Review Active Alerts', actionType: 'filter_threats' },
            { id: 'qa-3', label: 'Trace Attack Path', actionType: 'navigate', payload: { path: '/attack-graph' } },
            { id: 'qa-4', label: 'Generate Incident Summary', actionType: 'generate_report' },
          ],
        }]
      })
    }
  }, [devices])

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
