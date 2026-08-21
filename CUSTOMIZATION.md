# SentinelX Customization & Administration Guide

This guide is designed for **both technical administrators and non-technical stakeholders** to customize product branding, telemetry labels, KPI counters, FAQ items, theme palettes, and demo simulation datasets without breaking code structure.

---

## 1. Centralized Product Configuration

All public text, navigation labels, KPI definitions, analyst credentials, and FAQ items are centralized in a single file:

📁 **`src/config/productConfig.ts`**

### Modifying Product Brand & Analyst Callout
Open `src/config/productConfig.ts` and modify the `brand` object:
```typescript
export const productConfig = {
  brand: {
    name: 'YourSecPlatform',             // Change product name
    tagline: 'Autonomous AI Threat Defense', // Change subtitle
    version: 'v4.0 Enterprise',
    socRegion: 'EU-CENTRAL SOC Frankfurt',
    analyst: {
      name: 'Agent Sarah Connor',
      callsign: 'CYBER-01',
      role: 'Senior Incident Responder',
      avatar: 'SC',
      clearanceLevel: 'LEVEL 5 STRATEGIC',
    }
  },
  // ...
}
```

---

## 2. Customizing FAQ Questions & Answers
To update or add new technical questions in the FAQ accordion, edit `productConfig.faq`:
```typescript
faq: [
  {
    question: 'How does SentinelX integrate with our firewalls?',
    answer: 'SentinelX uses REST API webhooks to dynamically push quarantine drop rules to Palo Alto, Fortinet, and Cisco ASA firewalls.'
  },
  // Add more questions here...
]
```

---

## 3. Customizing the Demo Scenario & Device Datasets

### Changing Demo Compromise Stages
Open **`src/context/DemoScenarioContext.tsx`**.
The `DEMO_STAGES_DATA` array controls each step of the simulation (timestamps, compromise probability, and timeline events).

### Adding New Monitored Devices
Open **`src/api/devices.ts`** and add entries to `mockDevices`:
```typescript
{
  id: 'SERVER-09',
  hostname: 'AUTH-KDC-09.internal.corp',
  ip: '10.0.1.9',
  mac: '00:50:56:A1:B2:C3',
  os: 'Windows Server 2022',
  type: 'Server',
  department: 'Core Infrastructure',
  owner: 'Identity & Access Team',
  status: 'HEALTHY',
  riskScore: 10,
  compromiseProbability: 6,
  lastSeen: new Date().toISOString(),
  anomalies: [],
  metrics: {
    inboundTrafficBytes: 120000000,
    outboundTrafficBytes: 95000000,
    dnsQueriesPerMin: 1400,
    failedLogins24h: 0,
    activeConnections: 540,
  },
  isolationStatus: { isIsolated: false }
}
```

---

## 4. Theme & Color Customization

Tailwind theme tokens and cyber glows are configured in **`tailwind.config.js`** and **`src/index.css`**:

- **Primary Cyber Accent**: `#00F0FF` (Electric Cyan)
- **Critical Threat Color**: `#EF4444` (Crimson Red)
- **Warning Color**: `#F59E0B` (Amber Orange)
- **Healthy Nominal Color**: `#10B981` (Emerald Green)
- **AI Intelligence Accent**: `#A855F7` (Violet Purple)
- **Background**: `#030712` (Deep Space Navy)

---

## 5. Deployment Options

### Vercel (Recommended)
1. Push to GitHub.
2. Import repository into Vercel.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.

### Netlify
1. Build command: `npm run build`.
2. Publish directory: `dist`.
3. SPA redirect configured via `public/_redirects` or `netlify.toml`.
