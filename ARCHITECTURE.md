# SentinelX Architecture & System Design Specification

This document details the architectural principles, data flow pipelines, explainability models, component hierarchy, state management boundaries, and security design of the **SentinelX** platform.

---

## 1. High-Level System Architecture

```
                                  [ Enterprise Network Sensors ]
                                 (NetFlow / Zeek / Auth / Syslog)
                                                │
                                                ▼
                                    [ Ingestion Pipeline ]
                                                │
                                                ▼
                                 [ Baseline Profiling Engine ]
                              (30-Day Historical Distributions)
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            SENTINELX CORE MULTIVARIATE REASONING                            │
├──────────────────────────┬────────────────────────────┬─────────────────────────────────────┤
│   DNS Entropy Model      │   Beaconing Cadence Model  │   Graph Lateral Adjacency Model     │
│ (Shannon Entropy >= 3.5) │ (FFT Time-Series Jitter)   │ (Cross-VLAN Unauthorized Probing)   │
└──────────────────────────┴────────────────────────────┴─────────────────────────────────────┘
                                                │
                                                ▼
                                 [ Bayesian Correlation Engine ]
                              Posterior Prob = P(Compromise | Sensor Deviations)
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND APPLICATION LAYER                                   │
├──────────────────────────┬────────────────────────────┬─────────────────────────────────────┤
│  Command Center Overview │ 3D R3F Topology Canvas     │ Deep Device Forensics (DEVICE-042)  │
│  Attack Graph Visualizer │ Chronological Timeline     │ Contextual Sentinel AI Copilot      │
└──────────────────────────┴────────────────────────────┴─────────────────────────────────────┘
```

---

## 2. Behavioral Detection vs Static IoC Engine

SentinelX calculates compromise risk using multivariate Bayesian posterior probability:

$$\text{LogOdds}(\text{Compromise}) = \text{LogOdds}(\text{Prior}) + \sum_{i=1}^n w_i \cdot \frac{\text{Observed}_i - \text{Baseline}_i}{\sigma_i}$$

Where:
- $\text{Observed}_1$: Shannon entropy of DNS query subdomains (e.g. `4.88` vs `1.90` baseline).
- $\text{Observed}_2$: Egress volume standard deviation z-score (`4.8 GB` burst vs `50 MB` baseline).
- $\text{Observed}_3$: Inter-packet interval variance ($\sigma < 0.12\text{s}$ indicates periodic bot heartbeat).
- $\text{Observed}_4$: Temporal authentication dissonance (off-hours Kerberos logon at 09:12).
- $\text{Observed}_5$: Graph topological hop probability (unauthorized SMB access to core database tier).

---

## 3. Component Hierarchy

```
App
├── QueryClientProvider
├── ThemeProvider (Dark / Light / System)
├── DemoScenarioProvider (Stage 0 Baseline -> Stage 6 Lateral Compromise)
├── InvestigationProvider (Quarantine & IP drop rules)
├── SentinelAIProvider (Context-aware copilot & streaming assistant)
└── BrowserRouter
    └── AppShell
        ├── Sidebar (Responsive navigation & Analyst credentials)
        ├── Topbar (⌘K Search trigger, Health indicators, Theme toggle)
        ├── DemoControllerBar (Stage playback, stepping, & risk feedback)
        ├── CommandPalette (Global rapid search across endpoints, alerts, & actions)
        ├── SentinelAIChat (Floating 420x650 assistant with context indicator)
        └── Routes
            ├── /             -> OverviewPage (HeroStatus, KPIs, 3D Canvas, Threats, Explainability)
            ├── /live         -> LiveNetworkPage (High-frequency telemetry stream & socket tables)
            ├── /threats      -> ThreatDetectionPage (Filterable alert table with row expansion)
            ├── /network-3d   -> Network3DPage (Dedicated full-screen WebGL topology canvas)
            ├── /attack-graph -> AttackGraphPage (Multi-hop lateral attack path visualizer)
            ├── /timeline     -> AttackTimelinePage (Chronological progression & MITRE mappings)
            ├── /devices      -> DevicesPage (Inventory of monitored endpoints)
            ├── /devices/:id  -> DeviceDetailPage (Deep forensic telemetry for DEVICE-042)
            ├── /ai-analysis  -> AIAnalysisPage (Explainability hub & SHAP waterfall attribution)
            ├── /reports      -> ReportsPage (Incident report generator & PDF/JSON export)
            ├── /settings     -> SettingsPage (Zod-validated ML thresholds & analyst profile)
            └── /faq          -> FaqLandingPage (Public-facing architecture & technical FAQ)
```

---

## 4. 3D Spatial Network Topology Pipeline

- Powered by `@react-three/fiber` and `@react-three/drei`.
- Optimized with instanced meshes, orbit controls, custom shaders, and auto-throttled frame loops.
- Fallback ready: switches to an accessible, responsive 2D SVG canvas topology for low-power or mobile environments.

---

## 5. Security & Privacy Safeguards

- **Zero Client-Side Secret Leakage**: No private LLM API keys or database connection strings are exposed client-side.
- **Privacy-Safe Analytics Abstraction**: `trackEvent` strictly sanitizes passwords, session tokens, and raw packet payloads before logging.
- **Strict Input Validation**: All form actions are validated with Zod schemas.
