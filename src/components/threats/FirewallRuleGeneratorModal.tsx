import React, { useState } from 'react'
import {
  Shield,
  Copy,
  Check,
  Terminal,
  Download,
  Flame,
  Globe,
  Lock,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../common/Dialog'
import { Button } from '../common/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../common/Tabs'

interface FirewallRuleGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  targetIp?: string
  targetPort?: number
  reason?: string
}

export const FirewallRuleGeneratorModal: React.FC<FirewallRuleGeneratorModalProps> = ({
  isOpen,
  onClose,
  targetIp = '185.220.101.5',
  targetPort = 443,
  reason = 'SentinelX Automated C2 Incident Response',
}) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null)

  const handleCopy = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedTab(tabName)
    setTimeout(() => setCopiedTab(null), 2500)
  }

  const iptablesScript = `# SentinelX Automated Perimeter Firewall Rule
# Target Hostile IP: ${targetIp} | Generated at: ${new Date().toISOString()}
# Reason: ${reason}

# Drop all inbound & outbound TCP/UDP traffic to hostile IP
iptables -I INPUT 1 -s ${targetIp} -j DROP
iptables -I OUTPUT 1 -d ${targetIp} -j DROP
iptables -I FORWARD 1 -s ${targetIp} -j DROP
iptables -I FORWARD 1 -d ${targetIp} -j DROP

# Save rules persistently
netfilter-persistent save || iptables-save > /etc/iptables/rules.v4
echo "[SENTINELX] Hostile IP ${targetIp} blocked across all chains."`

  const ciscoScript = `! SentinelX Automated Cisco ASA / IOS Perimeter Drop ACL
! Target: ${targetIp}:${targetPort} | Policy: 802.1X Containment

configure terminal
ip access-list extended SENTINELX_BLOCK_LIST
 deny ip host ${targetIp} any log-input
 deny ip any host ${targetIp} log-input
 permit ip any any
exit

interface GigabitEthernet0/0/0
 ip access-group SENTINELX_BLOCK_LIST in
 ip access-group SENTINELX_BLOCK_LIST out
exit
write memory`

  const powershellScript = `# SentinelX Windows Defender Enterprise Firewall Rule (Run as Admin)
# Target Hostile C2: ${targetIp}

New-NetFirewallRule -DisplayName "SentinelX-Block-Inbound-${targetIp}" \`
    -Direction Inbound \`
    -Action Block \`
    -RemoteAddress "${targetIp}" \`
    -Protocol TCP \`
    -Description "Automated isolation rule by SentinelX AI: ${reason}"

New-NetFirewallRule -DisplayName "SentinelX-Block-Outbound-${targetIp}" \`
    -Direction Outbound \`
    -Action Block \`
    -RemoteAddress "${targetIp}" \`
    -Protocol Any \`
    -Description "Automated egress block for C2 relay: ${reason}"

Write-Host "✅ [SentinelX] Windows Firewall drop rules enforced for ${targetIp}." -ForegroundColor Green`

  const suricataScript = `# SentinelX Suricata IDS / IPS Network Detection Signature
# Alert code: AL-2041 | Attribution: Adversary C2 Beaconing

drop tcp any any -> ${targetIp} ${targetPort} (msg:"[SENTINELX] Hostile C2 Beaconing Channel Intercepted"; flow:to_server,established; threshold:type both, track by_src, count 5, seconds 60; classtype:trojan-activity; sid:2026042; rev:1;)
alert dns any any -> any 53 (msg:"[SENTINELX] DGA High Shannon Entropy Query Detected"; dns.query; pcre:"/^[a-z0-9]{12,}\\.tunnel-c2\\.biz$/i"; classtype:bad-unknown; sid:2026043; rev:1;)`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Shield className="h-5 w-5" />
            <DialogTitle className="text-base text-slate-100">
              Multi-Platform Firewall & IDS Rule Generator
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Generate production-grade containment scripts for Linux, Cisco, Windows Firewall, and Suricata IDS targeting{' '}
            <strong className="font-mono text-cyan-300">{targetIp}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3">
          <Tabs defaultValue="iptables" className="w-full">
            <TabsList className="w-full justify-start bg-slate-900/90 border-slate-800">
              <TabsTrigger value="iptables">Linux (iptables)</TabsTrigger>
              <TabsTrigger value="powershell">Windows (PowerShell)</TabsTrigger>
              <TabsTrigger value="cisco">Cisco ASA / IOS</TabsTrigger>
              <TabsTrigger value="suricata">Suricata IDS / IPS</TabsTrigger>
            </TabsList>

            {/* Linux */}
            <TabsContent value="iptables" className="space-y-3 mt-3">
              <div className="relative rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 font-mono text-xs text-cyan-300 overflow-x-auto">
                <button
                  onClick={() => handleCopy(iptablesScript, 'iptables')}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedTab === 'iptables' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">{iptablesScript}</pre>
              </div>
            </TabsContent>

            {/* PowerShell */}
            <TabsContent value="powershell" className="space-y-3 mt-3">
              <div className="relative rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 font-mono text-xs text-cyan-300 overflow-x-auto">
                <button
                  onClick={() => handleCopy(powershellScript, 'powershell')}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedTab === 'powershell' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">{powershellScript}</pre>
              </div>
            </TabsContent>

            {/* Cisco */}
            <TabsContent value="cisco" className="space-y-3 mt-3">
              <div className="relative rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 font-mono text-xs text-cyan-300 overflow-x-auto">
                <button
                  onClick={() => handleCopy(ciscoScript, 'cisco')}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedTab === 'cisco' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">{ciscoScript}</pre>
              </div>
            </TabsContent>

            {/* Suricata */}
            <TabsContent value="suricata" className="space-y-3 mt-3">
              <div className="relative rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 font-mono text-xs text-cyan-300 overflow-x-auto">
                <button
                  onClick={() => handleCopy(suricataScript, 'suricata')}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedTab === 'suricata' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">{suricataScript}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
