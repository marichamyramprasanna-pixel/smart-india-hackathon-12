/**
 * DEMO SCENARIO DATASET — ISOLATED TEST FIXTURES
 * Used exclusively for the interactive SOC simulation showcase (Patient Zero: DEVICE-042).
 * Real production data is queried directly from Supabase via `src/services/deviceService.ts`.
 */
import { DeviceTelemetry, NetworkConnection, DnsQueryRecord, AuthEventRecord } from '../../types/device'
import { mockDevices, mockDeviceConnections, mockDnsRecords, mockAuthEvents } from '../../api/devices'

export const demoDevices: DeviceTelemetry[] = mockDevices
export const demoDeviceConnections: Record<string, NetworkConnection[]> = mockDeviceConnections
export const demoDnsQueries: Record<string, DnsQueryRecord[]> = mockDnsRecords
export const demoAuthEvents: Record<string, AuthEventRecord[]> = mockAuthEvents
