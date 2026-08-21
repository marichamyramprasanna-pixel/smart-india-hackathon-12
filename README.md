# SentinelX — AI-Powered Network Compromise Detection & Investigation Platform

> **Enterprise Security Operations Center (SOC) & Incident Response Intelligence Platform**

SentinelX is an enterprise-grade cybersecurity platform engineered for SOC analysts, incident response teams, and security administrators to detect, investigate, and contain advanced cyber compromises.

Traditional Security Operations Centers rely on static IoC signature matching (known hashes, IP blocklists), which fails against novel zero-days, living-off-the-land techniques, and polymorphic command-and-control (C2) agents. SentinelX continuously monitors multivariate telemetry across DNS entropy, authentication timing, network socket flows, and lateral graph hops to detect compromises through statistical behavioral deviations before any public signature exists.

---

## ⚡ Key Capabilities

1. **Network Security Command Center**: Real-time network health overview with circular animated risk gauges (18% Baseline to 94% Compromise Probability), active KPI counters, and live event telemetry.
2. **Interactive 3D Network Topology**: Three.js / React Three Fiber spatial visualization with animated particle packet flows, orbital controls, and click-to-inspect device forensics.
3. **AI Behavioural Anomaly & Explainability Engine**: Transparent SHAP-style waterfall contribution attribution (`+31% Abnormal DNS`, `+24% Outbound Traffic`, `+18% Auth Timing`, `+14% Beaconing`, `+7% Lateral Hop`).
4. **Visual Attack Graph & Blast Radius**: Multi-hop path tracing from external C2 servers (`185.220.101.5`) through patient zero (`DEVICE-042`) to core database assets (`SERVER-07`).
5. **Interactive Attack Chronology Timeline**: Step-by-step forensic progression from initial access (09:12) to high compromise probability (09:25) with MITRE ATT&CK technique mapping.
6. **Deep Endpoint Forensics (`DEVICE-042`)**: Dedicated triage tabs for NetFlow traffic bursts (4.8 GB exfiltration spike), DNS Shannon entropy, authentication anomalies, active sockets, and 802.1X quarantine.
7. **Sentinel AI Copilot**: Context-aware AI Security Analyst assistant with streaming reasoning, prompt chips, structured threat cards, and one-click containment action triggers.
8. **Audit-Ready Incident Reports**: Automated compliance summaries with PDF/print stylesheets, JSON export, technical IoC tables, and analyst sign-offs.
9. **Interactive Demo Scenario State Machine**: Dedicated toolbar to step through the 6 progressive compromise stages of `DEVICE-042` with live reactive synchronization across all views.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Dark Cyber Tactical Glass Design System
- **3D Spatial Topology**: Three.js + React Three Fiber (`@react-three/fiber`) + `@react-three/drei`
- **Charts & Telemetry**: Recharts (Bandwidth area charts, Shannon entropy bar charts)
- **State Management**: TanStack Query + React Context (Theming, Demo State Machine, Investigation Workspace, Sentinel AI)
- **Forms & Validation**: React Hook Form + Zod
- **Icons & Animations**: Lucide React + Framer Motion
- **UI Primitives**: Radix UI (Tabs, Dialogs, Dropdowns, Accordions, Tooltips, Sliders, Switches)
- **Testing**: Vitest + Testing Library + JSDOM

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>= 18.0.0` (Recommended: Node.js 20 LTS)
- npm `>= 9.0.0`

### Installation
```bash
# Clone repository
git clone https://github.com/enterprise/sentinelx.git
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
# Run Vitest test suite
npm run test

# Run TypeScript compilation check
npm run build
```

---

## 🧭 Complete 30-Second Hackathon Demo Walkthrough

1. **Baseline Command Center**: Open `/` — notice the network status is **PROTECTED** with 18% baseline risk.
2. **Launch Demo Simulation**: On the top **DEMO SCENARIO** toolbar, click **Simulate** or click through Stages 1 to 6.
3. **Observe Multi-Vector Escalation**:
   - **Stage 1 (09:12)**: Off-hours Kerberos authentication anomaly.
   - **Stage 2 (09:14)**: High Shannon entropy DNS DGA queries resolving to C2 domain.
   - **Stage 3 (09:17)**: Direct TLS tunnel to foreign IP `185.220.101.5`.
   - **Stage 4 (09:19)**: Deterministic 30.02s beacon pulses with zero jitter.
   - **Stage 5 (09:21)**: 4.8 GB outbound exfiltration burst.
   - **Stage 6 (09:23)**: Lateral movement to `SERVER-07` (DB-CORE-07).
4. **Deep Dive on `DEVICE-042`**: Click **Investigate DEVICE-042** to view traffic bandwidth spikes, DGA entropy distributions, and active sockets.
5. **Engage Sentinel AI**: Press `⌘/` (or click bottom-right floating orb) and ask *"Explain why DEVICE-042 was flagged"*.
6. **Enforce Containment**: Click **Quarantine Host** to isolate `DEVICE-042` via 802.1X network micro-segmentation.
7. **Generate Incident Report**: Navigate to `/reports` and click **Print / Export PDF** or **Export JSON**.

---

## 📄 License
Enterprise Tactical License — Internal Security Operations Center use only.
