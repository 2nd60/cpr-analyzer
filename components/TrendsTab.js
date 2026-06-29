'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { BENCHMARKS } from '@/lib/benchmarks'
import { parsePeriodDate } from '@/lib/parseAnalysis'

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

function toInputDate(d) {
  return d.toISOString().slice(0, 10)
}

const PRESETS = [
  { label: 'All Time', value: 'all' },
  { label: 'Month-to-Date', value: 'mtd' },
  { label: 'Current Week', value: 'week' },
  { label: 'Previous Week', value: 'prev-week' },
  { label: 'Previous 3 Months', value: '3mo' },
  { label: 'Year-to-Date', value: 'ytd' },
  { label: 'Custom', value: 'custom' },
]

function presetToRange(value) {
  const today = new Date()
  const end = toInputDate(today)
  if (value === 'ytd') {
    return { start: toInputDate(new Date(today.getFullYear(), 0, 1)), end }
  }
  if (value === 'mtd') {
    return { start: toInputDate(new Date(today.getFullYear(), today.getMonth(), 1)), end }
  }
  if (value === 'week') {
    const sun = new Date(today)
    sun.setDate(today.getDate() - today.getDay())
    return { start: toInputDate(sun), end }
  }
  if (value === 'prev-week') {
    const sun = new Date(today)
    sun.setDate(today.getDate() - today.getDay() - 7)
    const sat = new Date(sun)
    sat.setDate(sun.getDate() + 6)
    return { start: toInputDate(sun), end: toInputDate(sat) }
  }
  if (value === '3mo') {
    const d = new Date(today)
    d.setMonth(d.getMonth() - 3)
    return { start: toInputDate(d), end }
  }
  return { start: '', end: '' }
}

export default function TrendsTab({ analyses, goals }) {
  const MIN_REPORTS = 3
  const [preset, setPreset] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  function handlePreset(value) {
    setPreset(value)
    if (value !== 'custom') {
      const r = presetToRange(value)
      setStartDate(r.start)
      setEndDate(r.end)
    }
  }

  function handleCustomDate(field, value) {
    setPreset('custom')
    if (field === 'start') setStartDate(value)
    else setEndDate(value)
  }

  function handleClearAll() {
    setPreset('all')
    setStartDate('')
    setEndDate('')
  }

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

  // Sort analyses oldest → newest by period date, falling back to created_at
  const sorted = [...analyses].sort((a, b) => {
    const da = parsePeriodDate(a.period) ?? new Date(a.created_at)
    const db = parsePeriodDate(b.period) ?? new Date(b.created_at)
    return da - db
  })

  // Apply date range filter
  const filterStart = startDate ? new Date(startDate) : null
  const filterEnd = endDate ? new Date(endDate + 'T23:59:59') : null
  const filtered = sorted.filter((a) => {
    const d = parsePeriodDate(a.period) ?? new Date(a.created_at)
    if (filterStart && d < filterStart) return false
    if (filterEnd && d > filterEnd) return false
    return true
  })

  const isFiltered = preset !== 'all'

  return (
    <div>
      {/* Date range controls — single line */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Time Period:</label>
        <select
          value={preset}
          onChange={(e) => handlePreset(e.target.value)}
          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-blue-400"
        >
          {PRESETS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <span className="text-xs text-gray-300">|</span>

        <label className="text-xs font-medium text-gray-500">Start:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => handleCustomDate('start', e.target.value)}
          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-blue-400"
        />
        <label className="text-xs font-medium text-gray-500">End:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => handleCustomDate('end', e.target.value)}
          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-blue-400"
        />

        {isFiltered && (
          <button
            onClick={handleClearAll}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 transition-colors"
          >
            Clear
          </button>
        )}
        {isFiltered && (
          <span className="text-xs text-gray-400">
            {filtered.length} of {analyses.length} reports
          </span>
        )}
      </div>

      {filtered.length < 1 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-semibold text-gray-400">No reports in this date range</p>
          <button onClick={handleClear} className="text-xs text-blue-500 hover:text-blue-700 mt-2 transition-colors">
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TREND_METRICS.map((metric) => {
            const data = filtered.map((a) => {
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
      )}
    </div>
  )
}
