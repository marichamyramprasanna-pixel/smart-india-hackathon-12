# SentinelX — AI-Powered Network Compromise Detection & Investigation Platform

> **Enterprise Security Operations Center (SOC) & Incident Response Intelligence Platform**

SentinelX is an enterprise-grade cybersecurity platform engineered for SOC analysts, incident response teams, and security administrators to detect, investigate, and contain advanced cyber compromises.

Traditional Security Operations Centers rely on static IoC signature matching (known hashes, IP blocklists), which fails against novel zero-days, living-off-the-land techniques, and polymorphic command-and-control (C2) agents. SentinelX continuously monitors multivariate telemetry across DNS entropy, authentication timing, network socket flows, and lateral graph hops to detect compromises through statistical behavioral deviations before any public signature exists.

---

## ⚡ Key Capabilities

1. **Network Security Command Center**: Real-time network health overview with circular animated risk gauges (18% Baseline to 94% Compromise Probability), active KPI counters, and live event telemetry.
2. **Supabase PostgreSQL & Realtime Backend**: Fully connected to Supabase PostgreSQL database with Row Level Security (RLS), typed CRUD services, real-time alert subscriptions, and session authentication.
3. **Interactive 3D Network Topology**: Three.js / React Three Fiber spatial visualization with animated particle packet flows, orbital controls, and click-to-inspect device forensics.
4. **AI Behavioural Anomaly & Explainability Engine**: Transparent SHAP-style waterfall contribution attribution (`+31% Abnormal DNS`, `+24% Outbound Traffic`, `+18% Auth Timing`, `+14% Beaconing`, `+7% Lateral Hop`).
5. **Visual Attack Graph & Blast Radius**: Multi-hop path tracing from external C2 servers (`185.220.101.5`) through patient zero (`DEVICE-042`) to core database assets (`SERVER-07`).
6. **Interactive Attack Chronology Timeline**: Step-by-step forensic progression from initial access (09:12) to high compromise probability (09:25) with MITRE ATT&CK technique mapping.
7. **Deep Endpoint Forensics (`DEVICE-042`)**: Dedicated triage tabs for NetFlow traffic bursts (4.8 GB exfiltration spike), DNS Shannon entropy, authentication anomalies, active sockets, and 802.1X quarantine.
8. **Sentinel AI Copilot**: Dedicated full-screen AI Analyst Workspace (`/ai-chat`) and floating assistant with streaming reasoning, prompt playbooks, and structured threat cards.
9. **Audit-Ready Incident Reports**: Automated compliance summaries with PDF/print stylesheets, JSON export, technical IoC tables, and analyst sign-offs.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Backend & Database**: Supabase (`@supabase/supabase-js`) + PostgreSQL + Supabase Realtime + Row Level Security (RLS)
- **Styling**: Tailwind CSS + Custom Dark Cyber Tactical Glass Design System
- **3D Spatial Topology**: Three.js + React Three Fiber (`@react-three/fiber`) + `@react-three/drei`
- **Charts & Telemetry**: Recharts (Bandwidth area charts, Shannon entropy bar charts)
- **State Management**: TanStack Query + React Context (Auth, Theming, Demo State Machine, Sentinel AI)
- **Forms & Validation**: React Hook Form + Zod
- **Icons & Animations**: Lucide React + Framer Motion
- **Testing**: Vitest + Testing Library + JSDOM

---

## 🔌 Supabase Backend Integration

### 1. Project Configuration
- **Supabase Project URL**: `https://cgkdtqtrbkrcmymzvuaa.supabase.co`
- **Client Implementation**: `src/lib/supabase.ts` (Singleton Supabase JS v2 client)
- **Database Schema & RLS Policies**: `supabase/migrations/20260822_initial_schema.sql`

### 2. Environment Variables Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your public anonymous key in `.env`:
```env
VITE_SUPABASE_URL=https://cgkdtqtrbkrcmymzvuaa.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

> [!CRITICAL]
> **Zero Service Role Key Exposure**: Only the public anonymous key (`VITE_SUPABASE_ANON_KEY`) is used client-side. The `SUPABASE_SERVICE_ROLE_KEY` is **NEVER** placed in frontend code, commits, or client environment variables.

### 3. Database Tables & RLS Security Model
| Table Name | Description | RLS Policy |
| :--- | :--- | :--- |
| `devices` | Monitored workstations, servers, firewalls, and IoT endpoints | Public Read, Authenticated Analyst Write |
| `threat_alerts` | Real-time multi-vector threat detections and IoCs | Public Read, Authenticated Analyst Write |
| `investigation_notes` | Analyst investigation notes and forensic findings | Authenticated Analyst Read/Insert |
| `analyst_profiles` | User clearance levels, callsigns, and roles | User Self-Management (`auth.uid() = user_id`) |
| `audit_logs` | Tamper-evident log of isolation and blocking actions | Append-Only Audit Logging |

### 4. Modular Service Architecture
```
Presentation Component (e.g. DevicesPage.tsx)
       │
       ▼
Custom Hook (useDevices / useAlerts / useAuth)
       │
       ▼
Service Layer (src/services/deviceService.ts)  <── Zod Validation
       │
       ▼
Supabase Client (src/lib/supabase.ts)
       │
       ▼
PostgreSQL Database (https://cgkdtqtrbkrcmymzvuaa.supabase.co)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>= 18.0.0` (Recommended: Node.js 20 LTS)
- npm `>= 9.0.0`

### Installation
```bash
# Clone repository
git clone https://github.com/marichamyramprasanna-pixel/sih.git
cd sih

# Install dependencies
npm install

# Run local development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 🧪 Running Tests & Build Validation

```bash
# Run Vitest test suite (18 unit tests)
npm run test

# Run TypeScript compilation check & production bundle
npm run build
```

---

## 📄 License
Enterprise Tactical License — Internal Security Operations Center use only.
