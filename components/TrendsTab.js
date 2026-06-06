'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { BENCHMARKS } from '@/lib/benchmarks'

// Shorten the period string for the X-axis label
function shortPeriod(period) {
  if (!period) return '?'
  // "01/01/2024 To: 12/31/2024" → "Jan '24"
  // "January 2024" → "Jan '24"
  // "2024-01" → "Jan '24"
  const str = String(period)

  // Try to find a date in MM/DD/YYYY or YYYY-MM-DD format
  const mdyMatch = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (mdyMatch) {
    const month = new Date(`${mdyMatch[3]}-${mdyMatch[1].padStart(2,'0')}-01`)
    return month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }
  const isoMatch = str.match(/(\d{4})-(\d{2})/)
  if (isoMatch) {
    const month = new Date(`${isoMatch[1]}-${isoMatch[2]}-01`)
    return month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }
  // Fall back to first ~10 chars
  return str.slice(0, 10)
}

const TREND_METRICS = [
  {
    key: 'gross_profit',
    label: 'Gross Profit',
    goalKey: null, // dollar amount — no standard goal benchmark, use gross_profit_margin goal proxy
    format: (v) => `$${Math.round(v).toLocaleString()}`,
    yFormat: (v) => `$${(v / 1000).toFixed(0)}k`,
    color: '#3b82f6',
  },
  {
    key: 'avg_ticket',
    label: 'Avg Ticket (ARO)',
    goalKey: 'avg_ticket',
    format: (v) => `$${Math.round(v).toLocaleString()}`,
    yFormat: (v) => `$${Math.round(v)}`,
    color: '#8b5cf6',
  },
  {
    key: 'total_ros',
    label: 'Car Count',
    goalKey: 'car_count',
    perMonth: true,
    format: (v) => Math.round(v).toString(),
    yFormat: (v) => Math.round(v).toString(),
    color: '#f59e0b',
  },
  {
    key: 'effective_labor_rate',
    label: 'Eff. Labor Rate',
    goalKey: 'effective_labor_rate',
    format: (v) => `$${Math.round(v)}`,
    yFormat: (v) => `$${Math.round(v)}`,
    color: '#10b981',
  },
  {
    key: 'labor_profit_pct',
    label: 'Labor Profit %',
    goalKey: 'labor_profit_pct',
    format: (v) => `${v.toFixed(1)}%`,
    yFormat: (v) => `${Math.round(v)}%`,
    color: '#06b6d4',
  },
  {
    key: 'parts_profit_pct',
    label: 'Parts Profit %',
    goalKey: 'parts_profit_pct',
    format: (v) => `${v.toFixed(1)}%`,
    yFormat: (v) => `${Math.round(v)}%`,
    color: '#ec4899',
  },
]

function CustomTooltip({ active, payload, label, format }) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-bold text-gray-900">{val != null ? format(val) : '—'}</p>
    </div>
  )
}

function TrendChart({ metric, data, goals }) {
  const goalVal = metric.goalKey ? (goals[metric.goalKey] ?? BENCHMARKS[metric.goalKey]?.goal) : null

  // Check if there's enough non-null data
  const validPoints = data.filter(d => d.value != null)
  if (validPoints.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{metric.label}</p>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-gray-300">No data available</p>
        </div>
      </div>
    )
  }

  // Determine line color based on latest value vs goal
  const latest = validPoints[validPoints.length - 1]?.value
  const lineColor = goalVal == null
    ? metric.color
    : latest >= goalVal ? '#22c55e' : '#ef4444'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{metric.label}</p>
        {goalVal != null && (
          <span className="text-xs text-gray-400">
            Goal: {metric.format(goalVal)}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={metric.yFormat}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip content={<CustomTooltip format={metric.format} />} />
          {goalVal != null && (
            <ReferenceLine
              y={goalVal}
              stroke="#1e293b"
              strokeDasharray="4 3"
              strokeWidth={1.5}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function TrendsTab({ analyses, goals }) {
  const MIN_REPORTS = 3

  if (analyses.length < MIN_REPORTS) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-12 h-12 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        <p className="text-sm font-semibold text-gray-400">Not enough data yet</p>
        <p className="text-xs text-gray-300 mt-1">
          Upload at least {MIN_REPORTS} reports to see trends.<br />
          You have {analyses.length} so far.
        </p>
      </div>
    )
  }

  // Sort analyses oldest → newest by created_at
  const sorted = [...analyses].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {TREND_METRICS.map((metric) => {
        const data = sorted.map((a) => {
          const months = a.period_months || 1
          const raw = a[metric.key]
          const value = metric.perMonth && raw != null ? raw / months : raw
          return {
            label: shortPeriod(a.period),
            value: value != null ? value : null,
          }
        })
        return (
          <TrendChart
            key={metric.key}
            metric={metric}
            data={data}
            goals={goals}
          />
        )
      })}
    </div>
  )
}
