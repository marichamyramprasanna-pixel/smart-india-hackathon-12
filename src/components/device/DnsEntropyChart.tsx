import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'

const dnsData = [
  { domain: 'google.com', entropy: 1.84, queries: 45, dga: false },
  { domain: 'microsoft.com', entropy: 2.12, queries: 78, dga: false },
  { domain: 'github.com', entropy: 1.95, queries: 32, dga: false },
  { domain: 'x9q7f-c2.biz', entropy: 4.88, queries: 342, dga: true },
  { domain: 'k4m9v-pulse.cc', entropy: 4.72, queries: 210, dga: true },
  { domain: 'p0q8w-node.info', entropy: 4.91, queries: 289, dga: true },
  { domain: 'internal.corp', entropy: 1.65, queries: 110, dga: false },
]

export const DnsEntropyChart: React.FC = () => {
  return (
    <Card variant="cyber" className="rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">DNS Request Shannon Entropy & DGA Detections</CardTitle>
          <span className="text-[11px] font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded">
            DGA THRESHOLD &gt; 3.5 ENTROPY
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dnsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="domain" stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis domain={[0, 6]} stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                formatter={(value: any, name: any) => [value, name === 'entropy' ? 'Shannon Entropy' : 'Query Count']}
              />
              <ReferenceLine y={3.5} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'DGA Boundary (3.5)', fill: '#EF4444', fontSize: 10 }} />
              <Bar dataKey="entropy" name="Shannon Entropy" fill="#A855F7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
