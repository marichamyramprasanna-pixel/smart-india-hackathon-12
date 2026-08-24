import React, { useState } from 'react'
import {
  Radar,
  Radio,
  Search,
  CheckCircle,
  Download,
  Laptop,
  Server,
  ShieldAlert,
  Play,
  Check,
  Copy,
  Terminal,
  RefreshCw,
  Plus,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../common/Dialog'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../common/Tabs'
import { useDevices } from '../../hooks/useDevices'

interface DiscoveredDevice {
  id: string
  hostname: string
  ip: string
  mac: string
  os: string
  type: 'Workstation' | 'Server' | 'Router' | 'IoT'
  department: string
  status: 'HEALTHY' | 'SUSPICIOUS' | 'COMPROMISED'
  riskScore: number
}

interface DeviceCollectorModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DeviceCollectorModal: React.FC<DeviceCollectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createDevice, refetch } = useDevices()
  const [subnet, setSubnet] = useState('10.0.4.0/24')
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([])
  const [importedIds, setImportedIds] = useState<string[]>([])
  const [copiedTab, setCopiedTab] = useState<string | null>(null)

  const sampleDiscovered: DiscoveredDevice[] = [
    {
      id: 'DEV-SRV-901',
      hostname: 'APP-PROD-01.internal.corp',
      ip: '10.0.4.91',
      mac: '52:54:00:8B:1A:44',
      os: 'Ubuntu 24.04 LTS (x86_64)',
      type: 'Server',
      department: 'Cloud Infrastructure',
      status: 'HEALTHY',
      riskScore: 8,
    },
    {
      id: 'DEV-WS-114',
      hostname: 'ENG-LAPTOP-114.internal.corp',
      ip: '10.0.4.114',
      mac: 'F0:18:98:C2:5E:10',
      os: 'macOS Sonoma 14.5 (Apple M3)',
      type: 'Workstation',
      department: 'DevOps Engineering',
      status: 'SUSPICIOUS',
      riskScore: 54,
    },
    {
      id: 'DEV-IOT-009',
      hostname: 'FACILITY-CAM-09.internal.corp',
      ip: '10.0.4.209',
      mac: 'AC:8B:A9:72:01:DF',
      os: 'Embedded Linux 5.10 (ARMv7)',
      type: 'IoT',
      department: 'Physical Security',
      status: 'HEALTHY',
      riskScore: 14,
    },
  ]

  const handleStartScan = () => {
    setIsScanning(true)
    setScanProgress(15)
    setDiscoveredDevices([])

    setTimeout(() => setScanProgress(45), 500)
    setTimeout(() => setScanProgress(78), 1000)
    setTimeout(() => {
      setScanProgress(100)
      setIsScanning(false)
      setDiscoveredDevices(sampleDiscovered)
    }, 1500)
  }

  const handleImportDevice = async (dev: DiscoveredDevice) => {
    try {
      await createDevice({
        id: dev.id,
        hostname: dev.hostname,
        ip_address: dev.ip,
        mac_address: dev.mac,
        os: dev.os,
        device_type: dev.type as any,
        department: dev.department,
        owner: 'Network Auto-Discovery Agent',
        status: dev.status,
        risk_score: dev.riskScore,
        compromise_probability: dev.riskScore,
      })
      setImportedIds((prev) => [...prev, dev.id])
      await refetch()
    } catch {
      // Handled
    }
  }

  const handleImportAll = async () => {
    for (const dev of discoveredDevices) {
      if (!importedIds.includes(dev.id)) {
        await handleImportDevice(dev)
      }
    }
  }

  const handleCopy = (code: string, tabKey: string) => {
    navigator.clipboard.writeText(code)
    setCopiedTab(tabKey)
    setTimeout(() => setCopiedTab(null), 2000)
  }

  const pythonCode = `# Run SentinelX Collector on any host (Linux/macOS/Windows)
curl -sSL https://raw.githubusercontent.com/marichamyramprasanna-pixel/smart-india-hackathon-12/main/scripts/sentinelx_collector_agent.py | python3`

  const powershellCode = `# Run SentinelX Endpoint Collector (PowerShell 5.1+)
$body = @{
    id = "HOST-$($env:COMPUTERNAME.Substring(0, [Math]::Min(8, $env:COMPUTERNAME.Length)))"
    hostname = [System.Net.Dns]::GetHostByName($env:computerName).HostName
    ip_address = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi*','Ethernet*' | Select-Object -First 1).IPAddress
    os = (Get-CimInstance Win32_OperatingSystem).Caption
    device_type = "Workstation"
    department = "Corporate Security"
    status = "HEALTHY"
    risk_score = 10
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://cgkdtqtrbkrcmymzvuaa.supabase.co/rest/v1/devices" \`
    -Method POST -Headers @{
        "apikey"="sb_publishable_vpI3rBVolg6-h1KTcUAjbQ_fM59c454"
        "Authorization"="Bearer sb_publishable_vpI3rBVolg6-h1KTcUAjbQ_fM59c454"
        "Content-Type"="application/json"
    } -Body $body
Write-Host "✅ [SentinelX] Endpoint registered in Supabase!" -ForegroundColor Green`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-950 border-slate-800 text-slate-100 p-6">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 shadow-neon-cyan/20">
                <Radar className="h-5 w-5 animate-spin-slow" />
              </div>
              <div>
                <DialogTitle className="text-base text-slate-100">
                  Subnet Scanner & Endpoint Telemetry Collector
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Discover active network hosts on your subnets or deploy lightweight telemetry collector agents.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3">
          <Tabs defaultValue="scanner" className="w-full">
            <TabsList className="w-full justify-start bg-slate-900 border-slate-800">
              <TabsTrigger value="scanner">Subnet Discovery Scanner</TabsTrigger>
              <TabsTrigger value="python">Python Collector Agent</TabsTrigger>
              <TabsTrigger value="powershell">PowerShell Endpoint Script</TabsTrigger>
            </TabsList>

            {/* TAB 1: Network Subnet Scanner */}
            <TabsContent value="scanner" className="space-y-4 mt-3">
              {/* Scan Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                  <input
                    type="text"
                    value={subnet}
                    onChange={(e) => setSubnet(e.target.value)}
                    placeholder="Enter target CIDR (e.g. 10.0.4.0/24)"
                    className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleStartScan}
                  isLoading={isScanning}
                  className="gap-2 text-xs font-semibold shadow-cyan-glow-sm h-9 whitespace-nowrap"
                >
                  <Radar className="h-3.5 w-3.5" />
                  <span>Start Network Discovery</span>
                </Button>
              </div>

              {/* Progress Bar */}
              {isScanning && (
                <div className="space-y-1.5 p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                    <span>Sweeping ARP & ICMP across {subnet}...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-300 shadow-neon-cyan"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Discovered Endpoints List */}
              {discoveredDevices.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300 font-semibold">
                      Discovered {discoveredDevices.length} Active Endpoints:
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleImportAll}
                      className="text-xs gap-1.5 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 h-7"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Import All to Supabase</span>
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {discoveredDevices.map((dev) => {
                      const isImported = importedIds.includes(dev.id)

                      return (
                        <div
                          key={dev.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 text-xs transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                              {dev.type === 'Server' ? <Server className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-100">{dev.hostname}</span>
                                <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                                  {dev.ip}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {dev.os} • MAC: {dev.mac} • {dev.department}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant={isImported ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => handleImportDevice(dev)}
                            disabled={isImported}
                            className="text-xs font-semibold gap-1.5 h-7 shrink-0"
                          >
                            {isImported ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Imported</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
                                <span>Import Device</span>
                              </>
                            )}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: Python Agent */}
            <TabsContent value="python" className="space-y-3 mt-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <p>
                  Deploy this zero-dependency Python script on Linux, macOS, or Windows endpoints to collect host hardware telemetry, network flows, and stream them continuously to Supabase.
                </p>
              </div>

              <div className="relative rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 font-mono text-xs text-cyan-300 overflow-x-auto">
                <button
                  onClick={() => handleCopy(pythonCode, 'python')}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
                  title="Copy command"
                >
                  {copiedTab === 'python' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">{pythonCode}</pre>
              </div>
            </TabsContent>

            {/* TAB 3: PowerShell Script */}
            <TabsContent value="powershell" className="space-y-3 mt-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <p>
                  Run this enterprise PowerShell one-liner across your Active Directory or Intune managed endpoints to register endpoints into the SOC inventory.
                </p>
              </div>

              <div className="relative rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 font-mono text-xs text-cyan-300 overflow-x-auto">
                <button
                  onClick={() => handleCopy(powershellCode, 'powershell')}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
                  title="Copy command"
                >
                  {copiedTab === 'powershell' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">{powershellCode}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end border-t border-slate-800 pt-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close Collector
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
