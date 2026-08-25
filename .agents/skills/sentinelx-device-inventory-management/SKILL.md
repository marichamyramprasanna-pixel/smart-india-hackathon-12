---
name: sentinelx-device-inventory-management
description: >-
  Procedures for managing active device inventory, clean fleet registration,
  tombstone vault archiving, 1-click restoration, and natural language AI commands.
---

# SentinelX Device Inventory & Lifecycle Management

This skill documents how to manage active monitored endpoints, handle batch fleet decommissions, archive tombstone records, and control inventory state via AI voice/text commands.

---

## 1. Core Service Architecture (`src/services/deviceService.ts`)

- **Active Devices Storage**: `sentinelx_local_devices` + Supabase `devices` table.
- **Tombstone Vault Storage**: `sentinelx_deleted_devices` (NIST SP 800-88 compliance audit trail).
- **Clean Slate Flag**: `sentinelx_inventory_cleared`.

```typescript
import { deviceService } from './services/deviceService'

// Register new endpoint
await deviceService.createDevice({
  id: 'DEV-HQ-01',
  hostname: 'Core-App-Server',
  ip_address: '10.0.1.10',
  device_type: 'Server',
  department: 'Infrastructure',
  owner: 'Lead DevOps',
  status: 'HEALTHY',
  risk_score: 0,
  compromise_probability: 0,
})

// Decommission & Archive single device
await deviceService.deleteDevice('DEV-HQ-01', 'Hardware refresh cycle')

// Batch Purge / Clean Slate
await deviceService.deleteAllDevices()

// 1-Click Restore Tombstone Record
await deviceService.restoreDevice(deletedRecord)
```

---

## 2. Natural Language AI Commands (`src/context/SentinelAIContext.tsx`)

Analysts can speak or type operational commands into Sentinel AI (`Ctrl + /`):
- *"Delete all devices"* ➔ Batch decommissions fleet into tombstone vault.
- *"Delete device DEVICE-001"* ➔ Decommissions specific host.
- *"Quarantine device DEVICE-001"* ➔ Enforces 802.1X port isolation into VLAN-999.
- *"Release quarantine on DEVICE-001"* ➔ Re-authorizes network port.
- *"Block IP 185.220.101.5"* ➔ Creates perimeter firewall null-route rule.
- *"Restore device DEVICE-001"* ➔ Recovers tombstone asset back to active inventory.

---

## 3. UI Pages

- **Active Inventory**: `/devices`
- **Tombstone Vault**: `/deleted-devices`
- **Quarantined & Blocked Hub**: `/blocked-devices`
