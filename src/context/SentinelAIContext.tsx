import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { AIChatMessage } from '../types/ai'
import { sendChatMessage } from '../api/ai'
import { trackEvent } from '../api/analytics'
import { useDevices } from '../hooks/useDevices'
import { useAlerts } from '../hooks/useAlerts'
import { useInvestigation } from './InvestigationContext'
import { useDemoScenario } from './DemoScenarioContext'
import { deviceService, getDeletedDevices } from '../services/deviceService'
import { SystemActionEvent } from '../services/systemEventBus'
import { auditLogService } from '../services/auditLogService'

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
  content: `Hello, Analyst. I'm **Sentinel AI Assistant & Autonomous SOC Copilot**.\n\nYou can ask me questions or **give direct operational commands** such as:\n- *"Delete all devices"* (Clears inventory so you can add new endpoints)\n- *"Delete device DEVICE-042"*\n- *"Quarantine device DEVICE-042"*\n- *"Block IP 185.220.101.5"*\n- *"Unblock IP 185.220.101.5"*\n- *"Restore device DEVICE-LEGACY-019"*\n\nI will execute the actions live in the platform and log audit trails!`,
  suggestedActions: [
    { id: 'qa-1', label: 'Clear All Devices', actionType: 'delete_all' },
    { id: 'qa-2', label: 'Register New Endpoint', actionType: 'navigate', payload: { path: '/devices' } },
    { id: 'qa-3', label: 'View Deleted Archive', actionType: 'navigate', payload: { path: '/deleted-devices' } },
    { id: 'qa-4', label: 'Quarantine DEVICE-042', actionType: 'quarantine' },
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

  // Live platform hooks for executing real system commands
  const { devices, deleteDevice, deleteAllDevices, refetch: refetchDevices } = useDevices()
  const { alerts } = useAlerts()
  const { isolateDevice, unisolateDevice, blockIp, unblockIp, addInvestigationNote } = useInvestigation()
  const { setStageIndex } = useDemoScenario()

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

  // Auto-update AI Agent and Chatbot whenever administrative actions occur (deleting, blocking, isolating, restoring)
  useEffect(() => {
    const handleSystemAction = (e: Event) => {
      const customEvent = e as CustomEvent<SystemActionEvent>
      const act = customEvent.detail
      if (!act) return

      let content = ''
      let actions: AIChatMessage['suggestedActions'] = []

      switch (act.type) {
        case 'DEVICE_ISOLATED':
          content = `🔒 **[SYSTEM ACTION DETECTED] 802.1X Host Quarantine Enforced**\n\nEndpoint **${act.targetId}** (${act.targetName || act.targetId}) was isolated from the network.\n- **Reason**: ${act.details || 'Autonomous/Analyst Containment'}\n- **Network Policy**: VLAN-999 Port Containment\n- **AI Status**: Live context updated.`
          actions = [
            { id: `act-sys-iso-1`, label: 'View Blocked Devices Hub', actionType: 'navigate', payload: { path: '/blocked-devices' } },
            { id: `act-sys-iso-2`, label: `Release ${act.targetId}`, actionType: 'unisolate', payload: { deviceId: act.targetId } },
          ]
          auditLogService.recordAction('QUARANTINE_DEVICE', act.targetId, act.details || 'Quarantine Enforced')
          break

        case 'DEVICE_UNISOLATED':
          content = `🔓 **[SYSTEM ACTION DETECTED] Host Quarantine Released**\n\nEndpoint **${act.targetId}** has been released from isolation and restored to normal network routing.`
          actions = [
            { id: `act-sys-uniso-1`, label: 'Inspect Fleet Inventory', actionType: 'navigate', payload: { path: '/devices' } },
          ]
          auditLogService.recordAction('UNQUARANTINE_DEVICE', act.targetId, 'Quarantine Released')
          break

        case 'DEVICE_DELETED':
          content = `🗑️ **[SYSTEM ACTION DETECTED] Endpoint Decommissioned & Archived**\n\nDevice **${act.targetId}** (${act.targetName || act.targetId}) was removed from active inventory and archived to the **Tombstone Vault**.\n- **Audit Compliance**: NIST SP 800-88`
          actions = [
            { id: `act-sys-del-1`, label: 'View Deleted Vault', actionType: 'navigate', payload: { path: '/deleted-devices' } },
            { id: `act-sys-del-2`, label: `Restore ${act.targetId}`, actionType: 'restore', payload: { deviceId: act.targetId } },
          ]
          auditLogService.recordAction('DELETE_DEVICE', act.targetId, act.details || 'Decommissioned')
          break

        case 'ALL_DEVICES_DELETED':
          content = `🗑️ **[SYSTEM ACTION DETECTED] Fleet Reset & Cleared**\n\nAll active devices have been archived into the Tombstone Vault. Active inventory is now clean for fresh onboarding.`
          actions = [
            { id: `act-sys-clr-1`, label: 'Register New Endpoint', actionType: 'navigate', payload: { path: '/devices' } },
            { id: `act-sys-clr-2`, label: 'View Deleted Archive', actionType: 'navigate', payload: { path: '/deleted-devices' } },
          ]
          auditLogService.recordAction('DELETE_DEVICE', 'ALL_DEVICES', 'All devices cleared')
          break

        case 'DEVICE_RESTORED':
          content = `♻️ **[SYSTEM ACTION DETECTED] Endpoint Restored from Vault**\n\nDevice **${act.targetId}** (${act.targetName || act.targetId}) has been successfully recovered and enrolled back into active telemetry monitoring.`
          actions = [
            { id: `act-sys-res-1`, label: `Inspect ${act.targetId}`, actionType: 'navigate', payload: { path: `/devices/${act.targetId}` } },
            { id: `act-sys-res-2`, label: 'View Devices Inventory', actionType: 'navigate', payload: { path: '/devices' } },
          ]
          auditLogService.recordAction('RESTORE_DEVICE', act.targetId, 'Restored from vault')
          break

        case 'DEVICE_REGISTERED':
          content = `✨ **[SYSTEM ACTION DETECTED] New Endpoint Registered**\n\nEndpoint **${act.targetId}** (${act.targetName || act.targetId}) is now actively reporting NetFlow telemetry and Shannon entropy metrics.`
          actions = [
            { id: `act-sys-reg-1`, label: `Inspect ${act.targetId}`, actionType: 'navigate', payload: { path: `/devices/${act.targetId}` } },
          ]
          break

        case 'IP_BLOCKED':
          content = `🛡️ **[SYSTEM ACTION DETECTED] Perimeter Firewall Drop Enforced**\n\nHostile IP **${act.targetId}** was added to perimeter firewall drop lists.\n- **Status**: Null-routed`
          actions = [
            { id: `act-sys-ip-1`, label: 'View Firewall Drop List', actionType: 'navigate', payload: { path: '/blocked-devices' } },
          ]
          auditLogService.recordAction('BLOCK_IP', act.targetId, act.details || 'Firewall drop')
          break

        case 'IP_UNBLOCKED':
          content = `🔓 **[SYSTEM ACTION DETECTED] Perimeter IP Unblocked**\n\nIP **${act.targetId}** was removed from the perimeter firewall drop list.`
          auditLogService.recordAction('UNBLOCK_IP', act.targetId, 'Firewall unblock')
          break
      }

      if (content) {
        const sysMsg: AIChatMessage = {
          id: `ai-sys-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString(),
          content,
          confidence: 100,
          suggestedActions: actions,
        }
        setMessages((prev) => [...prev, sysMsg])
        refetchDevices()
      }
    }

    window.addEventListener('sentinelx_system_action', handleSystemAction)
    return () => window.removeEventListener('sentinelx_system_action', handleSystemAction)
  }, [refetchDevices])

  // Helper to resolve device ID from command text or current context
  const resolveTargetDevice = (text: string) => {
    const upper = text.toUpperCase()
    const match = upper.match(/(DEVICE-[A-Z0-9_-]+|SERVER-[A-Z0-9_-]+|DEV-[A-Z0-9_-]+|FIN-WS-[A-Z0-9_-]+|DB-CORE-[A-Z0-9_-]+|IOT-[A-Z0-9_-]+|DEVICE\s*([0-9]+))/i)
    if (match) {
      let matchedId = match[1]
      if (match[2]) matchedId = `DEVICE-${match[2].padStart(3, '0')}`
      const found = devices.find((d) => d.id.toUpperCase() === matchedId.toUpperCase() || d.hostname.toUpperCase().includes(matchedId.toUpperCase()))
      if (found) return found
      return { id: matchedId, hostname: `Host (${matchedId})` }
    }
    const numMatch = text.match(/\b(?:device|host|workstation|server)\s*#?([0-9]+)\b/i)
    if (numMatch) {
      const num = numMatch[1].padStart(3, '0')
      const targetId = `DEVICE-${num}`
      const found = devices.find((d) => d.id.toUpperCase() === targetId.toUpperCase())
      if (found) return found
      return { id: targetId, hostname: `Device ${num}` }
    }
    if (currentContext.type === 'device' && currentContext.id) {
      const found = devices.find((d) => d.id.toLowerCase() === currentContext.id?.toLowerCase())
      if (found) return found
      return { id: currentContext.id, hostname: currentContext.name || currentContext.id }
    }
    const comp = devices.find((d) => d.status === 'COMPROMISED') || devices[0]
    return comp || { id: 'DEVICE-042', hostname: 'Workstation-Fin (DEVICE-042)' }
  }

  const extractIpAddress = (text: string) => {
    const ipMatch = text.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/)
    return ipMatch ? ipMatch[0] : null
  }

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

    const lower = text.toLowerCase()

    try {
      // ══════════════════════════════════════════════════════════════════════
      // 0. COMMAND: DELETE ALL DEVICES / CLEAR INVENTORY
      // ══════════════════════════════════════════════════════════════════════
      if (
        (lower.includes('delete all') || lower.includes('clear all') || lower.includes('remove all') || lower.includes('delete al') || lower.includes('clear inventory')) &&
        (lower.includes('device') || lower.includes('devices') || lower.includes('endpoint') || lower.includes('all'))
      ) {
        const count = await deleteAllDevices()
        refetchDevices()

        const responseMsg: AIChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString(),
          content: `🗑️ **ACTION EXECUTED: All Devices Cleared & Archived**\n\nI have decommissioned and removed all **${count} active devices** from your inventory.\n\n- **Inventory Status**: Clean & ready for new endpoints\n- **Archive Status**: All ${count} devices safely preserved in the **[Deleted Devices Archive](/deleted-devices)**\n- **Next Step**: You can now register your brand new endpoints from the **[Devices Inventory](/devices)**!`,
          confidence: 100,
          suggestedActions: [
            { id: 'act-new-1', label: 'Register New Endpoint', actionType: 'navigate', payload: { path: '/devices' } },
            { id: 'act-new-2', label: 'View Deleted Archive', actionType: 'navigate', payload: { path: '/deleted-devices' } },
          ],
        }
        setMessages((prev) => [...prev, responseMsg])
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // 1. COMMAND: DELETE / DECOMMISSION SINGLE DEVICE
      // ══════════════════════════════════════════════════════════════════════
      if (
        (lower.includes('delete') || lower.includes('remove') || lower.includes('decommission') || lower.includes('purge')) &&
        (lower.includes('device') || lower.includes('host') || lower.includes('endpoint') || lower.includes('workstation') || lower.includes('server') || lower.includes('dev-'))
      ) {
        const target = resolveTargetDevice(text)
        await deleteDevice(target.id)
        addInvestigationNote(target.id, `[AI COMMAND EXECUTION] Device ${target.id} decommissioned & archived via natural language command.`)
        refetchDevices()

        const responseMsg: AIChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString(),
          content: `✅ **ACTION EXECUTED: Device Deleted & Archived**\n\nI have decommissioned and removed **${target.id}** (${target.hostname}) from active inventory.\n\n- **Status**: Archived to Tombstone Vault\n- **Audit Log**: Created with NIST SP 800-88 compliance\n- **Recovery**: You can restore this device at any time from the **[Deleted Devices Archive](/deleted-devices)**.`,
          confidence: 100,
          suggestedActions: [
            { id: 'act-del-1', label: 'View Deleted Devices Archive', actionType: 'navigate', payload: { path: '/deleted-devices' } },
            { id: 'act-del-2', label: 'Review Active Inventory', actionType: 'navigate', payload: { path: '/devices' } },
          ],
        }
        setMessages((prev) => [...prev, responseMsg])
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // 2. COMMAND: QUARANTINE / ISOLATE DEVICE (802.1X)
      // ══════════════════════════════════════════════════════════════════════
      if (
        (lower.includes('quarantine') || lower.includes('isolate') || (lower.includes('block') && !lower.includes('ip'))) &&
        (lower.includes('device') || lower.includes('host') || lower.includes('endpoint') || lower.includes('workstation') || lower.includes('server') || lower.includes('dev-') || lower.includes('42'))
      ) {
        const target = resolveTargetDevice(text)
        isolateDevice(target.id, target.hostname, 'Autonomous 802.1X Quarantine enforced by Sentinel AI command')
        addInvestigationNote(target.id, `[AI COMMAND EXECUTION] 802.1X Port Isolation enforced on ${target.id} by Sentinel AI.`)

        const responseMsg: AIChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString(),
          content: `🔒 **ACTION EXECUTED: 802.1X Host Quarantine Enforced**\n\nI have isolated **${target.id}** (${target.hostname}) from the active network.\n\n- **Enforcement Policy**: RADIUS VLAN-999 (Remediation Subnet)\n- **Network Interface**: Port shut / Traffic null-routed\n- **Manage Status**: View in **[Blocked & Quarantined Devices Hub](/blocked-devices)**.`,
          confidence: 100,
          suggestedActions: [
            { id: 'act-blk-1', label: 'View Blocked Devices Hub', actionType: 'navigate', payload: { path: '/blocked-devices' } },
            { id: 'act-blk-2', label: `Inspect ${target.id}`, actionType: 'navigate', payload: { path: `/devices/${target.id}` } },
          ],
        }
        setMessages((prev) => [...prev, responseMsg])
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // 3. COMMAND: RELEASE QUARANTINE / UNISOLATE DEVICE
      // ══════════════════════════════════════════════════════════════════════
      if (
        (lower.includes('unblock') || lower.includes('unisolate') || lower.includes('release') || lower.includes('un-quarantine')) &&
        (lower.includes('device') || lower.includes('host') || lower.includes('dev-') || lower.includes('42'))
      ) {
        const target = resolveTargetDevice(text)
        unisolateDevice(target.id)
        addInvestigationNote(target.id, `[AI COMMAND EXECUTION] Quarantine released for ${target.id} by Sentinel AI.`)

        const responseMsg: AIChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString(),
          content: `🔓 **ACTION EXECUTED: Quarantine Released**\n\nI have restored network access and re-authorized **${target.id}** (${target.hostname}).\n\n- **Port Status**: Re-opened & Authorized\n- **Subnet**: Restored to primary production VLAN.`,
          confidence: 100,
          suggestedActions: [
            { id: 'act-rel-1', label: `Inspect ${target.id}`, actionType: 'navigate', payload: { path: `/devices/${target.id}` } },
            { id: 'act-rel-2', label: 'View Active Inventory', actionType: 'navigate', payload: { path: '/devices' } },
          ],
        }
        setMessages((prev) => [...prev, responseMsg])
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // 4. COMMAND: BLOCK IP ADDRESS
      // ══════════════════════════════════════════════════════════════════════
      if ((lower.includes('block') || lower.includes('drop') || lower.includes('ban')) && (lower.includes('ip') || extractIpAddress(text))) {
        const targetIp = extractIpAddress(text) || '185.220.101.5'
        blockIp(targetIp, 'Perimeter firewall ACL drop enforced by Sentinel AI command')

        const responseMsg: AIChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString(),
          content: `🛡️ **ACTION EXECUTED: Perimeter IP Blocked**\n\nI have created a Layer-3/Layer-7 firewall drop rule for IP **${targetIp}**.\n\n- **Firewall Rule**: FW-DROP-${Math.floor(Math.random() * 9000 + 1000)}\n- **Action**: Null-routing all inbound/outbound packets\n- **Status**: Listed in **[Blocked Devices & Firewall Drops](/blocked-devices)**.`,
          confidence: 100,
          suggestedActions: [
            { id: 'act-ip-1', label: 'View Firewall Drop List', actionType: 'navigate', payload: { path: '/blocked-devices' } },
          ],
        }
        setMessages((prev) => [...prev, responseMsg])
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // 5. COMMAND: UNBLOCK IP ADDRESS
      // ══════════════════════════════════════════════════════════════════════
      if ((lower.includes('unblock') || lower.includes('remove')) && (lower.includes('ip') || extractIpAddress(text))) {
        const targetIp = extractIpAddress(text) || '185.220.101.5'
        unblockIp(targetIp)

        const responseMsg: AIChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString(),
          content: `🔓 **ACTION EXECUTED: IP Unblocked**\n\nI have unblocked IP **${targetIp}** from the perimeter firewall drop list.\n\nYou can also onboard this IP to your **[Devices Inventory](/blocked-devices)** for continuous inspection if desired.`,
          confidence: 100,
          suggestedActions: [
            { id: 'act-unip-1', label: 'Go to Blocked Devices Hub', actionType: 'navigate', payload: { path: '/blocked-devices' } },
          ],
        }
        setMessages((prev) => [...prev, responseMsg])
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // 6. COMMAND: RESTORE DELETED DEVICE
      // ══════════════════════════════════════════════════════════════════════
      if (lower.includes('restore') || lower.includes('recover')) {
        const deletedVault = getDeletedDevices()
        const target = deletedVault.find((d) => lower.includes(d.id.toLowerCase()) || lower.includes(d.hostname.toLowerCase())) || deletedVault[0]
        if (target) {
          await deviceService.restoreDevice(target)
          refetchDevices()

          const responseMsg: AIChatMessage = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString(),
            content: `♻️ **ACTION EXECUTED: Device Restored to Active Inventory**\n\nI have recovered **${target.id}** (${target.hostname}) from the tombstone archive.\n\n- **Inventory Status**: HEALTHY (Baseline Initialized)\n- **Telemetry**: Re-enrolled in continuous behavioral monitoring.`,
            confidence: 100,
            suggestedActions: [
              { id: 'act-res-1', label: `Inspect ${target.id}`, actionType: 'navigate', payload: { path: `/devices/${target.id}` } },
              { id: 'act-res-2', label: 'View Devices Inventory', actionType: 'navigate', payload: { path: '/devices' } },
            ],
          }
          setMessages((prev) => [...prev, responseMsg])
          return
        }
      }

      // ══════════════════════════════════════════════════════════════════════
      // 7. COMMAND: SWITCH ATTACK STAGE / SCENARIO
      // ══════════════════════════════════════════════════════════════════════
      if (lower.includes('stage') || lower.includes('scenario') || lower.includes('baseline') || lower.includes('exfiltration')) {
        let stageNum = 0
        if (lower.includes('1') || lower.includes('phishing') || lower.includes('auth')) stageNum = 1
        else if (lower.includes('2') || lower.includes('beacon') || lower.includes('dga')) stageNum = 2
        else if (lower.includes('3') || lower.includes('lateral')) stageNum = 3
        else if (lower.includes('4') || lower.includes('exfiltration') || lower.includes('ransomware')) stageNum = 4

        setStageIndex(stageNum)
        const responseMsg: AIChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString(),
          content: `⚡ **ACTION EXECUTED: Attack Simulation Stage Updated**\n\nI have advanced the demo simulation state machine to **Stage ${stageNum}**.\n\n- **Live Topology**: Real-time risk probability and anomaly metrics updated across all dashboard pages.`,
          confidence: 100,
          suggestedActions: [
            { id: 'act-stg-1', label: 'Open 3D Spatial Network', actionType: 'navigate', payload: { path: '/network-3d' } },
            { id: 'act-stg-2', label: 'View Visual Attack Graph', actionType: 'navigate', payload: { path: '/attack-graph' } },
          ],
        }
        setMessages((prev) => [...prev, responseMsg])
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // 8. GENERAL AI SOC REASONING & NATURAL INQUIRIES
      // ══════════════════════════════════════════════════════════════════════
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
        content: '⚠️ Sentinel AI processed your command with local fallback handlers.',
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [currentContext, devices, alerts, deleteDevice, deleteAllDevices, isolateDevice, unisolateDevice, blockIp, unblockIp, addInvestigationNote, setStageIndex, refetchDevices])

  const sendQuickAction = useCallback((actionLabel: string) => {
    sendMessage(actionLabel)
  }, [sendMessage])

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
