'use client'

import { BENCHMARKS, GOAL_KEYS } from '@/lib/benchmarks'
import Speedometer from './Speedometer'
import HistorySidebar from './HistorySidebar'
import AnalysisDetails from './AnalysisDetails'

function money(v) {
  if (v == null) return '—'
  return `$${Math.round(v).toLocaleString()}`
}

function pct(v) {
  if (v == null) return '—'
  return `${v.toFixed(1)}%`
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  )
}

export default function Dashboard({ analysis, goals, analyses, onSelectAnalysis, onNewUpload }) {
  const a = analysis

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <HistorySidebar
        analyses={analyses}
        currentId={a.id}
        onSelect={onSelectAnalysis}
        onNewUpload={onNewUpload}
      />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {a.shop_name || 'Shop Performance Report'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {[a.period, a.period_months ? `${a.period_months}-month period` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Gross Sales" value={money(a.gross_sales)} />
            <StatCard label="Gross Profit" value={money(a.gross_profit)} />
            <StatCard label="Total ROs" value={a.total_ros ?? '—'} />
            <StatCard label="Hours Sold" value={a.hours_sold != null ? Math.round(a.hours_sold) : '—'} />
          </div>

          {/* Secondary stats */}
          {(a.labor_sales != null || a.parts_sales != null || a.total_discounts != null) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {a.labor_sales != null && <StatCard label="Labor Sales" value={money(a.labor_sales)} />}
              {a.parts_sales != null && <StatCard label="Parts Sales" value={money(a.parts_sales)} />}
              {a.hours_presented != null && <StatCard label="Hours Presented" value={Math.round(a.hours_presented)} />}
              {a.total_discounts != null && <StatCard label="Total Discounts" value={money(a.total_discounts)} />}
            </div>
          )}

          {/* Gauge grid */}
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Performance Gauges
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {GOAL_KEYS.map((key) => {
              const b = BENCHMARKS[key]
              const goalVal = goals[key] ?? b.goal
              const value = a[b.field ?? key]
              return (
                <Speedometer
                  key={key}
                  value={value}
                  goal={goalVal}
                  pmaAvg={b.pmaAvg}
                  pmaTop10={b.pmaTop10}
                  gaugeMax={b.gaugeMax}
                  label={b.label}
                  format={b.format}
                />
              )
            })}
          </div>

          <AnalysisDetails analysis={a} goals={goals} />
        </div>
      </main>
    </div>
  )
}
