-- ==========================================================
-- SentinelX SOC Platform Database Schema & RLS Policies
-- Target Supabase Project: https://cgkdtqtrbkrcmymzvuaa.supabase.co
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEVICES TABLE
CREATE TABLE IF NOT EXISTS public.devices (
    id TEXT PRIMARY KEY,
    hostname TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    mac_address TEXT NOT NULL DEFAULT '00:00:00:00:00:00',
    os TEXT NOT NULL DEFAULT 'Linux / Enterprise',
    device_type TEXT NOT NULL DEFAULT 'Workstation' CHECK (device_type IN ('Workstation', 'Server', 'Laptop', 'IoT', 'Router', 'Firewall', 'Cloud', 'External')),
    department TEXT NOT NULL DEFAULT 'Engineering',
    owner TEXT NOT NULL DEFAULT 'Unassigned',
    status TEXT NOT NULL DEFAULT 'HEALTHY' CHECK (status IN ('HEALTHY', 'SUSPICIOUS', 'COMPROMISED', 'ISOLATED', 'OFFLINE')),
    risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    compromise_probability INTEGER NOT NULL DEFAULT 0 CHECK (compromise_probability >= 0 AND compromise_probability <= 100),
    anomalies TEXT[] NOT NULL DEFAULT '{}',
    is_isolated BOOLEAN NOT NULL DEFAULT FALSE,
    isolated_at TIMESTAMPTZ,
    isolated_by TEXT,
    isolation_reason TEXT,
    inbound_bytes BIGINT NOT NULL DEFAULT 0,
    outbound_bytes BIGINT NOT NULL DEFAULT 0,
    dns_queries_per_min INTEGER NOT NULL DEFAULT 0,
    failed_logins_24h INTEGER NOT NULL DEFAULT 0,
    active_connections INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index frequently searched fields
CREATE INDEX IF NOT EXISTS idx_devices_status ON public.devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_risk_score ON public.devices(risk_score);
CREATE INDEX IF NOT EXISTS idx_devices_ip ON public.devices(ip_address);

-- 2. THREAT ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.threat_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    device_id TEXT NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    device_hostname TEXT NOT NULL,
    device_ip TEXT NOT NULL,
    threat_category TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO')),
    confidence_score INTEGER NOT NULL DEFAULT 80 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    compromise_probability INTEGER NOT NULL DEFAULT 50 CHECK (compromise_probability >= 0 AND compromise_probability <= 100),
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'FALSE_POSITIVE')),
    summary TEXT NOT NULL,
    indicators JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_explanation TEXT NOT NULL,
    remediation_steps TEXT[] NOT NULL DEFAULT '{}',
    assigned_analyst TEXT,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threat_alerts_severity ON public.threat_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_threat_alerts_status ON public.threat_alerts(status);
CREATE INDEX IF NOT EXISTS idx_threat_alerts_device ON public.threat_alerts(device_id);

-- 3. INVESTIGATION NOTES TABLE
CREATE TABLE IF NOT EXISTS public.investigation_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id TEXT NOT NULL,
    entity_type TEXT NOT NULL DEFAULT 'device' CHECK (entity_type IN ('device', 'threat', 'incident')),
    analyst_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    analyst_name TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investigation_notes_entity ON public.investigation_notes(entity_id);

-- 4. ANALYST PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.analyst_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    callsign TEXT NOT NULL DEFAULT 'SPECTRE',
    role TEXT NOT NULL DEFAULT 'Security Analyst',
    clearance_level TEXT NOT NULL DEFAULT 'LEVEL 3 TACTICAL',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Enable RLS on all tables
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyst_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Devices Policies:
-- Allow authenticated users full read/write, allow public read for SOC dashboard demo
CREATE POLICY "Allow public read on devices" ON public.devices
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated analysts to manage devices" ON public.devices
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Threat Alerts Policies:
CREATE POLICY "Allow public read on threat alerts" ON public.threat_alerts
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated analysts to modify alerts" ON public.threat_alerts
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Investigation Notes Policies:
CREATE POLICY "Allow read investigation notes" ON public.investigation_notes
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated analysts to add notes" ON public.investigation_notes
    FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Analyst Profiles Policies:
CREATE POLICY "Allow users to read profiles" ON public.analyst_profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update own profile" ON public.analyst_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own profile" ON public.analyst_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 5. Audit Logs Policies:
CREATE POLICY "Allow read audit logs" ON public.audit_logs
    FOR SELECT USING (true);

CREATE POLICY "Allow insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- ==========================================================
-- REALTIME REPLICATION CONFIGURATION
-- ==========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.threat_alerts;

-- ==========================================================
-- SEED INITIAL TELEMETRY DATA
-- ==========================================================
INSERT INTO public.devices (id, hostname, ip_address, mac_address, os, device_type, department, owner, status, risk_score, compromise_probability, anomalies, is_isolated, inbound_bytes, outbound_bytes, dns_queries_per_min, failed_logins_24h, active_connections)
VALUES
    ('DEVICE-042', 'FIN-WS-042.internal.corp', '10.0.4.42', '00:1A:2B:3C:4D:5E', 'Windows 11 Enterprise', 'Workstation', 'Corporate Finance', 'Sarah Jenkins (VP Finance)', 'COMPROMISED', 94, 94, ARRAY['Abnormal DNS Entropy (4.88)', 'Outbound Exfiltration Burst (4.8 GB)', 'C2 Periodic Beaconing (30.02s)', 'Off-Hours Authentication', 'Lateral Movement SMB Probe'], FALSE, 342000000, 4800000000, 342, 14, 18),
    ('SERVER-07', 'DB-CORE-07.internal.corp', '10.0.2.17', '00:50:56:A1:B2:C3', 'Ubuntu Linux 24.04 LTS', 'Server', 'Core Data Infrastructure', 'Database Admin Group', 'SUSPICIOUS', 68, 52, ARRAY['Unauthorized Ingress Port 445', 'Suspicious SMB Named Pipe'], FALSE, 1280000000, 450000000, 890, 3, 48),
    ('DEVICE-118', 'HR-LAPTOP-118.internal.corp', '10.0.4.118', '00:1C:42:7F:8E:91', 'macOS Sonoma 14.5', 'Laptop', 'Human Resources', 'David Miller (Recruiting)', 'HEALTHY', 12, 8, ARRAY[]::text[], FALSE, 45000000, 12000000, 45, 0, 6),
    ('ROUTER-01', 'CORE-RTR-01.edge.corp', '10.0.0.1', '00:00:0C:07:AC:01', 'Cisco IOS-XE 17.9', 'Router', 'Network Operations', 'NOC Infrastructure', 'HEALTHY', 5, 2, ARRAY[]::text[], FALSE, 8450000000, 7890000000, 12400, 0, 1420)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.threat_alerts (alert_code, title, device_id, device_hostname, device_ip, threat_category, severity, confidence_score, compromise_probability, status, summary, indicators, ai_explanation, remediation_steps)
VALUES
    ('AL-2041', 'Persistent C2 Beaconing to Unclassified IP', 'DEVICE-042', 'FIN-WS-042.internal.corp', '10.0.4.42', 'Command & Control', 'CRITICAL', 94, 94, 'NEW', 'Periodic TLS heartbeat detected to 185.220.101.5 on port 8443 with 30.02s cadence and 0.4% jitter.', '[{"type": "IP", "value": "185.220.101.5", "reputation": "Known Bulletproof C2"}, {"type": "Jitter", "value": "0.4%", "reputation": "Deterministic Bot Cadence"}]'::jsonb, 'Multi-layered spectral analysis revealed a rigid harmonic spike at 0.033 Hz, consistent with automated agent heartbeat rather than human browsing.', ARRAY['Isolate host FIN-WS-042 via 802.1X quarantine', 'Block destination IP 185.220.101.5 on perimeter firewall', 'Revoke Kerberos TGT and reset credentials']),
    ('AL-2042', 'Algorithmically Generated Domain Query Flood (DGA)', 'DEVICE-042', 'FIN-WS-042.internal.corp', '10.0.4.42', 'DGA Tunneling', 'HIGH', 88, 85, 'INVESTIGATING', 'High-entropy subdomain queries resolving to dynamic external nameservers.', '[{"type": "Entropy", "value": "4.88", "reputation": "Shannon Threshold > 3.5"}, {"type": "Domain", "value": "x9q7f-tunnel-c2.biz", "reputation": "Fast-Flux Resolver"}]'::jsonb, 'Subdomain character distribution exhibits uniform unigram dispersion indicative of pseudo-random string generator algorithm.', ARRAY['Sinkhole domain *.tunnel-c2.biz on internal DNS', 'Inspect process memory for injected payload'])
ON CONFLICT (alert_code) DO NOTHING;
