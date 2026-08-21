import React, { createContext, useContext, useState, useCallback } from 'react'
import { trackEvent } from '../api/analytics'

interface IsolationRecord {
  deviceId: string
  hostname: string
  isolatedAt: string
  reason: string
}

interface BlockedIpRecord {
  ip: string
  blockedAt: string
  ruleId: string
  reason: string
}

interface InvestigationContextType {
  isolatedDevices: Record<string, IsolationRecord>
  blockedIps: Record<string, BlockedIpRecord>
  activeNotes: Record<string, string[]>
  isolateDevice: (deviceId: string, hostname?: string, reason?: string) => void
  unisolateDevice: (deviceId: string) => void
  isDeviceIsolated: (deviceId: string) => boolean
  blockIp: (ip: string, reason?: string) => void
  unblockIp: (ip: string) => void
  isIpBlocked: (ip: string) => boolean
  addInvestigationNote: (entityId: string, note: string) => void
}

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined)

export const InvestigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isolatedDevices, setIsolatedDevices] = useState<Record<string, IsolationRecord>>({})
  const [blockedIps, setBlockedIps] = useState<Record<string, BlockedIpRecord>>({})
  const [activeNotes, setActiveNotes] = useState<Record<string, string[]>>({
    'DEVICE-042': [
      'Initial beaconing confirmed on port 443 to ASN 49302 (09:19)',
      'High entropy DGA DNS flood flagged by behavioral model (09:14)',
      'Lateral attempt to DB-CORE-07 intercepted by network policy (09:23)',
    ],
  })

  const isolateDevice = useCallback((deviceId: string, hostname: string = deviceId, reason: string = 'Automated/Analyst High-Risk Quarantine') => {
    setIsolatedDevices((prev) => ({
      ...prev,
      [deviceId]: {
        deviceId,
        hostname,
        isolatedAt: new Date().toISOString(),
        reason,
      },
    }))
    trackEvent('device_isolated', { deviceId, hostname })
  }, [])

  const unisolateDevice = useCallback((deviceId: string) => {
    setIsolatedDevices((prev) => {
      const copy = { ...prev }
      delete copy[deviceId]
      return copy
    })
  }, [])

  const isDeviceIsolated = useCallback((deviceId: string) => {
    return !!isolatedDevices[deviceId]
  }, [isolatedDevices])

  const blockIp = useCallback((ip: string, reason: string = 'Analyst perimeter block') => {
    setBlockedIps((prev) => ({
      ...prev,
      [ip]: {
        ip,
        blockedAt: new Date().toISOString(),
        ruleId: `FW-DROP-${Math.floor(Math.random() * 9000 + 1000)}`,
        reason,
      },
    }))
  }, [])

  const unblockIp = useCallback((ip: string) => {
    setBlockedIps((prev) => {
      const copy = { ...prev }
      delete copy[ip]
      return copy
    })
  }, [])

  const isIpBlocked = useCallback((ip: string) => {
    return !!blockedIps[ip]
  }, [blockedIps])

  const addInvestigationNote = useCallback((entityId: string, note: string) => {
    setActiveNotes((prev) => ({
      ...prev,
      [entityId]: [...(prev[entityId] || []), `[${new Date().toLocaleTimeString()}] ${note}`],
    }))
  }, [])

  return (
    <InvestigationContext.Provider
      value={{
        isolatedDevices,
        blockedIps,
        activeNotes,
        isolateDevice,
        unisolateDevice,
        isDeviceIsolated,
        blockIp,
        unblockIp,
        isIpBlocked,
        addInvestigationNote,
      }}
    >
      {children}
    </InvestigationContext.Provider>
  )
}

export function useInvestigation(): InvestigationContextType {
  const context = useContext(InvestigationContext)
  if (!context) {
    throw new Error('useInvestigation must be used within an InvestigationProvider')
  }
  return context
}
