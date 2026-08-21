export const productConfig = {
  brand: {
    name: 'SentinelX',
    tagline: 'AI Security Intelligence',
    description: 'AI-Powered Network Compromise Detection & Investigation Platform',
    version: 'v3.8.4 Enterprise',
    socRegion: 'US-EAST SOC Center 01',
    analyst: {
      name: 'Agent Alex Rivera',
      callsign: 'SPECTRE-09',
      role: 'Lead Incident Responder',
      avatar: 'AR',
      clearanceLevel: 'LEVEL 4 TACTICAL',
    }
  },

  navigation: [
    { label: 'Overview', path: '/', icon: 'LayoutDashboard', description: 'Command Center & KPIs' },
    { label: 'Live Network', path: '/live', icon: 'Activity', description: 'Real-time telemetry stream' },
    { label: 'Threat Detection', path: '/threats', icon: 'ShieldAlert', description: 'Active alerts & triage' },
    { label: '3D Network', path: '/network-3d', icon: 'Globe', description: '3D interactive topology' },
    { label: 'Attack Graph', path: '/attack-graph', icon: 'Network', description: 'Visual compromise path' },
    { label: 'Attack Timeline', path: '/timeline', icon: 'Clock', description: 'Chronological events' },
    { label: 'Devices', path: '/devices', icon: 'Laptop', description: 'Endpoints & servers' },
    { label: 'AI Analysis', path: '/ai-analysis', icon: 'BrainCircuit', description: 'Behavioral explainability' },
    { label: 'Sentinel AI Chat', path: '/ai-chat', icon: 'Bot', description: 'Autonomous AI Copilot Workspace' },
    { label: 'Reports', path: '/reports', icon: 'FileText', description: 'Incident summaries & exports' },
    { label: 'Settings', path: '/settings', icon: 'Settings', description: 'Thresholds & API config' },
    { label: 'Product & FAQ', path: '/faq', icon: 'HelpCircle', description: 'Architecture & FAQ' },
  ],

  kpiLabels: {
    activeDevices: 'Active Monitored Devices',
    suspiciousDevices: 'Suspicious Endpoints',
    activeThreats: 'Active Threats',
    networkHealth: 'Network Baseline Health',
    aiConfidence: 'AI Detection Confidence',
  },

  stats: {
    monitoredEntities: '1,248+',
    aiConfidenceRate: '96.4%',
    uptime: '99.99%',
    coverageHours: '24/7/365',
    baselineModelsActive: '48 Machine Learning Classifiers',
  },

  faq: [
    {
      question: 'What makes SentinelX different from traditional IoC-based detection?',
      answer: 'Traditional security relies on static IoC matching (known file hashes, IP blocklists, domain lists), which fails against novel malware, zero-days, and polymorphic command-and-control. SentinelX learns multivariate behavioral baselines across DNS frequency, authentication rhythms, connection graph topologies, and data transfer volumes to detect compromises through anomalous deviations before any public signature exists.'
    },
    {
      question: 'How does behavioural anomaly detection work?',
      answer: 'SentinelX continuously computes probabilistic distance metrics between real-time network telemetry streams and historical baselines (covering 30+ dimensions such as Shannon entropy of DNS requests, off-hours authentication clusters, beaconing jitter, and outbound volumetric bursts). When deviations correlate across multiple vectors, compromise probability escalates automatically.'
    },
    {
      question: 'Can SentinelX explain why a device was flagged?',
      answer: 'Yes. SentinelX features a native explainability engine that computes feature importance waterfall contributions (e.g. +31% Abnormal DNS, +24% Outbound Traffic Anomaly, +18% Authentication Anomaly). It provides transparent, probabilistic reasoning rather than black-box alerts.'
    },
    {
      question: 'Does SentinelX automatically block devices?',
      answer: 'SentinelX supports both automated quarantine policies and analyst-in-the-loop remediation. Analysts can trigger one-click micro-segmentation, host isolation, DNS sinkholing, or firewall IP blocking directly from the investigation console or through Sentinel AI.'
    },
    {
      question: 'Can SentinelX integrate with existing network infrastructure?',
      answer: 'SentinelX ingests telemetry via NetFlow/IPFIX, Zeek/Bro logs, Syslog, Active Directory/Kerberos auth logs, and endpoint sensors via standard Kafka/Syslog/REST streams without requiring invasive deep packet inspection hardware.'
    },
    {
      question: 'Is the AI detection always accurate?',
      answer: 'SentinelX uses calibrated probabilistic confidence scoring. Detections are explicitly framed as compromise probabilities (e.g. 94% Compromise Probability with 96.4% AI Model Confidence) to assist analyst triage without making false claims of infallible certainty.'
    },
    {
      question: 'How is sensitive security data handled?',
      answer: 'All private security telemetry, payload captures, and authentication tokens are kept strictly within the enterprise perimeter. Analytics abstractions and AI queries never expose raw credentials or private enterprise payloads to public AI models.'
    }
  ],

  newsletter: {
    title: 'Stay ahead of emerging threats.',
    subtitle: 'Receive tactical behavioral threat intelligence briefs and zero-day anomaly patterns curated by the SentinelX Research Team.',
    cta: 'Subscribe',
    successMessage: 'You are subscribed to the SentinelX Intelligence Brief.',
    errorMessage: 'Unable to subscribe. Please try again.',
  },

  socialProof: {
    categories: ['Security Operations Teams', 'Cybersecurity Researchers', 'Enterprise Security Teams'],
    demoNotice: 'Demonstration environment with simulated telemetry data based on real-world enterprise compromise scenarios.'
  }
}
