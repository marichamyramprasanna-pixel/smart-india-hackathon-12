import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { formatBytes } from '../../utils/formatters'

const trafficData = [
  { time: '09:00', inbound: 420000, outbound: 180000, baseline: 200000 },
  { time: '09:05', inbound: 510000, outbound: 210000, baseline: 220000 },
  { time: '09:10', inbound: 490000, outbound: 250000, baseline: 210000 },
  { time: '09:12', inbound: 890000, outbound: 450000, baseline: 230000 },
  { time: '09:15', inbound: 1200000, outbound: 980000, baseline: 240000 },
  { time: '09:17', inbound: 1450000, outbound: 2800000, baseline: 250000 },
  { time: '09:19', inbound: 1800000, outbound: 124000000, baseline: 250000 }, // Beacon burst
  { time: '09:21', inbound: 2100000, outbound: 4890000000, baseline: 260000 }, // 4.8 GB Exfiltration Spike!
  { time: '09:23', inbound: 1900000, outbound: 3100000000, baseline: 250000 },
  { time: '09:25', inbound: 1200000, outbound: 840000000, baseline: 240000 },
]

export const DeviceTrafficChart: React.FC = () => {
  return (
    <Card variant="cyber" className="rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Network Traffic Bandwidth (Egress Volumetric Analysis)</CardTitle>
          <span className="text-[11px] font-mono text-red-400 font-bold bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded">
            4.8 GB EXFILTRATION SPIKE AT 09:21
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis
                stroke="#64748B"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickFormatter={(val) => formatBytes(val, 0)}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                formatter={(value: any) => [formatBytes(Number(value)), '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="outbound"
                name="Outbound Egress (Observed)"
                stroke="#EF4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOutbound)"
              />
              <Area
                type="monotone"
                dataKey="inbound"
                name="Inbound Traffic"
                stroke="#00F0FF"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorInbound)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
