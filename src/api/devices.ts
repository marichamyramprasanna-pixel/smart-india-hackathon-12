import { DeviceTelemetry, NetworkConnection, DnsQueryRecord, AuthEventRecord } from '../types/device'

export const mockDevices: DeviceTelemetry[] = []

export const mockDeviceConnections: Record<string, NetworkConnection[]> = {}

export const mockDnsRecords: Record<string, DnsQueryRecord[]> = {}

export const mockAuthEvents: Record<string, AuthEventRecord[]> = {}

export async function fetchDevices(): Promise<DeviceTelemetry[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDevices), 50)
  })
}

export async function fetchDeviceById(id: string): Promise<DeviceTelemetry | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dev = mockDevices.find((d) => d.id === id) || null
      resolve(dev)
    }, 50)
  })
}

export async function fetchDeviceConnections(id: string): Promise<NetworkConnection[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDeviceConnections[id] || []), 50)
  })
}

export async function fetchDeviceDnsLogs(id: string): Promise<DnsQueryRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDnsRecords[id] || []), 50)
  })
}

export async function fetchDeviceAuthLogs(id: string): Promise<AuthEventRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockAuthEvents[id] || []), 50)
  })
}
