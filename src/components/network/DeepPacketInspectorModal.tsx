import React, { useState } from 'react'
import {
  ShieldAlert,
  Binary,
  Layers,
  Download,
  Copy,
  Check,
  Globe,
  Radio,
  FileCode,
  Terminal,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../common/Dialog'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'

interface DeepPacketInspectorModalProps {
  isOpen: boolean
  onClose: () => void
  packet?: {
    id: string
    sourceIp: string
    sourcePort: number
    destinationIp: string
    destinationPort: number
    protocol: string
    threatLevel: string
    reputation: string
    bytesSent: number
    bytesReceived: number
  } | null
}

export const DeepPacketInspectorModal: React.FC<DeepPacketInspectorModalProps> = ({
  isOpen,
  onClose,
  packet,
}) => {
  const [copied, setCopied] = useState(false)
  const [activeLayer, setActiveLayer] = useState<'l2' | 'l3' | 'l4' | 'l7'>('l7')

  if (!packet) return null

  const isHostile = packet.threatLevel === 'critical' || packet.destinationIp === '185.220.101.5'

  const hexDump = isHostile
    ? `0000  00 1a 2b 3c 4d 5e 00 50  56 c0 00 08 08 00 45 00  ..+<M^.PV.....E.
0010  00 54 8f 12 40 00 40 06  7b 1a 0a 00 04 2a b9 dc  .T..@.@.{....*..
0020  65 05 c0 1a 01 bb 14 2d  8f a2 92 a1 10 f4 80 18  e......-........
0030  01 f5 b4 12 00 00 01 01  08 0a 34 f1 92 10 00 00  ..........4.....
0040  17 03 03 00 28 a1 9b 4e  2f 8b 11 02 a4 fc 91 e0  ....(..N/.......
0050  82 19 bb 21 00 ff 44 aa  31 92 88 01 fa 9b 11 22  ...!..D.1......"
0060  cc 99 10 44 88 12 90 aa  41 12 bb ff 00 19 aa 11  ...D....A.......`
    : `0000  00 1a 2b 3c 4d 5e 00 50  56 c0 00 08 08 00 45 00  ..+<M^.PV.....E.
0010  00 3c 1a 22 40 00 40 11  9f a1 0a 00 04 2a 0a 00  .<."@.@......*..
0020  00 02 c0 00 00 35 00 28  a1 b2 1a 44 01 00 00 01  .....5.(...D....
0030  00 00 00 00 00 00 08 69  6e 74 65 72 6e 61 6c 04  .......internal.
0040  63 6f 72 70 00 00 01 00  01 00 00 29 10 00 00 00  corp.......)....`

  const handleCopy = () => {
    navigator.clipboard.writeText(hexDump)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPcap = () => {
    const blob = new Blob([hexDump], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sentinelx-packet-${packet.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-950 border-slate-800 text-slate-100 p-6">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                <Binary className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base text-slate-100">
                Deep Packet Inspection (DPI) — Socket {packet.sourceIp}:{packet.sourcePort} ➔ {packet.destinationIp}:{packet.destinationPort}
              </DialogTitle>
            </div>

            <Badge
              variant={isHostile ? 'critical' : 'healthy'}
              pulse={isHostile}
              className="text-[10px] font-mono"
            >
              {isHostile ? 'MALICIOUS C2 TRAFFIC' : 'VERIFIED INGRESS'}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Byte-level protocol payload disassembly and heuristic entropy inspection.
          </DialogDescription>
        </DialogHeader>

        {/* Protocol Layer Breadcrumb */}
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono overflow-x-auto">
          {[
            { key: 'l2', label: 'Layer 2: Ethernet II (00:1A:2B:3C:4D:5E)' },
            { key: 'l3', label: `Layer 3: IPv4 (${packet.sourceIp} ➔ ${packet.destinationIp})` },
            { key: 'l4', label: `Layer 4: ${packet.protocol} (${packet.sourcePort} ➔ ${packet.destinationPort})` },
            { key: 'l7', label: isHostile ? 'Layer 7: Encrypted TLS Check-In' : 'Layer 7: Application Payload' },
          ].map((l) => (
            <button
              key={l.key}
              onClick={() => setActiveLayer(l.key as any)}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap text-[11px] ${
                activeLayer === l.key
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Deep Forensic Header Analysis */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Payload Size</span>
            <span className="font-bold text-slate-100 font-mono">{packet.bytesSent.toLocaleString()} Bytes</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Shannon Entropy</span>
            <span className={`font-bold font-mono ${isHostile ? 'text-red-400' : 'text-emerald-400'}`}>
              {isHostile ? '7.94 (High Encrypted)' : '3.12 (Standard)'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">TCP Flags</span>
            <span className="font-bold text-slate-100 font-mono">PSH, ACK [0x018]</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">JA3/JA4 Fingerprint</span>
            <span className="font-bold text-cyan-300 font-mono truncate block">
              {isHostile ? 'a0e9f5d64f01' : '3b5074b1b50f'}
            </span>
          </div>
        </div>

        {/* Wireshark-style Raw Hex/ASCII Dump */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Raw Packet Frame Hexadecimal & ASCII Payload Dump:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 font-mono text-xs text-cyan-300 overflow-x-auto select-text leading-relaxed">
            <pre className="text-[11px]">{hexDump}</pre>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPcap}
            className="text-xs gap-1.5 border-slate-700"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Frame (.TXT)</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close Inspector
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
