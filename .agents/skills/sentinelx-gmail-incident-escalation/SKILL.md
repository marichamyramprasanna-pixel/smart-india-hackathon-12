---
name: sentinelx-gmail-incident-escalation
description: >-
  Automated emergency Gmail incident escalation and printable forensic PDF report dispatch
  when network threats or endpoints exceed 80% risk.
---

# SentinelX Gmail Incident Escalation & PDF Report Dispatch

This skill provides procedures for automating emergency incident escalation to Gmail (`ramprasannamarichamy31@gmail.com`) and generating printable forensic PDF reports.

---

## 1. Automated Threshold Rule (>80% Risk)

- **Trigger Condition**: Any device or telemetry anomaly reaching `riskScore >= 80` or `compromiseProbability >= 80`.
- **Target Recipient**: `ramprasannamarichamy31@gmail.com` (configurable in `/settings` or `/gmail-dispatch`).
- **Cooldown & Rate-Limiting**: 5-minute cooldown per device to prevent email storming.

---

## 2. Core Dispatch Service (`src/services/gmailAlertService.ts`)

```typescript
import { gmailAlertService } from './services/gmailAlertService'

// Trigger automated security advisory
await gmailAlertService.triggerRiskAlert({
  id: 'alert-unique-id',
  deviceId: 'DEV-SERVER-01',
  hostname: 'Main-Database-Cluster',
  ip: '10.0.1.50',
  riskScore: 88,
  compromiseProbability: 85,
  threatTitle: 'Ransomware Staging & Exfiltration Probe',
  mitreTactic: 'MITRE ATT&CK TA0040 Impact / TA0010 Exfiltration',
  anomalies: ['High Shannon entropy DNS query flood', 'Outbound connection burst'],
  recommendedAction: 'Enforce 802.1X Port Isolation immediately.',
  timestamp: new Date().toISOString(),
}, true)
```

---

## 3. Printable Forensic PDF Incident Report Workflow

1. Navigate to `/gmail-dispatch` or `/reports`.
2. Inspect the live NIST SP 800-61 Rev 2 incident report summary.
3. Click **"Print / Export PDF"** (`window.print()`).
4. Select **"Save as PDF"** in the browser print dialog.

---

## 4. UI Entrypoints

- **Gmail Dispatch Page**: `http://localhost:5174/gmail-dispatch`
- **Settings & Dispatch History**: `http://localhost:5174/settings`
- **Automated Interceptor**: Built into `ThreatAutoBlockInterceptor.tsx` mounted in `AppShell.tsx`.
