import React, { useState, useEffect } from 'react'
import { Activity, ShieldAlert, Radio, Lock, CheckCircle, Pause, Play } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { Badge } from '../common/Badge'
import { useDemoScenario } from '../../context/DemoScenarioContext'

interface LiveEvent {
  id: string
  time: string
  source: string
  destination: string
  proto: string
  type: 'auth' | 'dns' | 'flow' | 'alert' | 'block'
  summary: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
}

export const LiveEventFeed: React.FC = () => {
  const { currentStage } = useDemoScenario()
  const [isPaused, setIsPaused] = useState(false)
  const [events, setEvents] = useState<LiveEvent[]>([
    {
      id: 'evt-1',
      time: '09:25:12',
      source: '10.0.4.42:51200',
      destination: '10.0.2.7:445',
      proto: 'SMB',
      type: 'alert',
      summary: 'Pass-the-hash SMB connection attempt from DEVICE-042 to DB-CORE-07',
      severity: 'critical',
    },
    {
      id: 'evt-2',
      time: '09:24:50',
      source: '10.0.4.42:53102',
      destination: '10.0.0.2:53',
      proto: 'DNS',
      type: 'dns',
      summary: 'TXT query for p0q8w-exfil-node.info (Shannon entropy 4.91)',
      severity: 'high',
    },
    {
      id: 'evt-3',
      time: '09:24:15',
      source: '10.0.4.42:49821',
      destination: '185.220.101.5:443',
      proto: 'TLS',
      type: 'flow',
      summary: 'Periodic C2 beacon packet emitted (30.02s interval, 0.4% jitter)',
      severity: 'critical',
    },
    {
      id: 'evt-4',
      time: '09:23:40',
      source: '10.0.4.118:58210',
      destination: '10.0.0.1:443',
      proto: 'HTTPS',
      type: 'flow',
      summary: 'Standard outbound HTTPS traffic to internal repo gitlab.internal.corp',
      severity: 'info',
    },
    {
      id: 'evt-5',
      time: '09:23:05',
      source: '10.0.8.109:554',
      destination: '10.0.2.20:554',
      proto: 'RTSP',
      type: 'flow',
      summary: 'Lobby CCTV stream packet burst to NVR recorder',
      severity: 'info',
    },
  ])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      const timeStr = new Date().toTimeString().split(' ')[0]
      const randomType = Math.random() > 0.6 ? 'flow' : 'dns'
      const newEvt: LiveEvent = {
        id: `evt-${Date.now()}`,
        time: timeStr,
        source: '10.0.4.' + Math.floor(Math.random() * 200 + 1),
        destination: '10.0.0.' + Math.floor(Math.random() * 10 + 1),
        proto: randomType === 'dns' ? 'DNS' : 'TLS',
        type: randomType,
        summary: randomType === 'dns'
          ? `Query response from resolver for internal host lookup`
          : `Routine TLS session handshake with cloud edge`,
        severity: 'info',
      }

      setEvents((prev) => [newEvt, ...prev.slice(0, 8)])
    }, 4000)

    return () => clearInterval(interval)
  }, [isPaused])

  return (
    <Card variant="cyber" className="rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-sm">
              <span>Live Telemetry Stream</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 ml-2">
                DEMO MODE
              </span>
            </CardTitle>
          </div>
        </div>

        <button
          onClick={() => setIsPaused((p) => !p)}
          className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 border border-slate-800 px-2 py-1 rounded bg-slate-900/60"
        >
          {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-slate-800/40">
          {events.map((evt) => (
            <div
              key={evt.id}
              className={`p-3 flex items-start justify-between gap-3 text-xs transition-colors hover:bg-slate-850/40 ${
                evt.severity === 'critical' ? 'bg-red-950/15' : evt.severity === 'high' ? 'bg-orange-950/10' : ''
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="font-mono text-[11px] text-slate-500 shrink-0 mt-0.5">
                  {evt.time}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono font-bold text-slate-300">
                      {evt.source} → {evt.destination}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                      {evt.proto}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] truncate">{evt.summary}</p>
                </div>
              </div>

              <Badge
                variant={
                  evt.severity === 'critical' ? 'critical' :
                  evt.severity === 'high' ? 'high' : 'default'
                }
                className="text-[9px] font-mono shrink-0"
              >
                {evt.severity}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
