'use client'

import { useState } from 'react'
import { BENCHMARKS, GOAL_KEYS } from '@/lib/benchmarks'
import Speedometer from './Speedometer'
import HistorySidebar from './HistorySidebar'
import AnalysisDetails from './AnalysisDetails'
import TrendsTab from './TrendsTab'

function money(v) {
  if (v == null) return '—'
  return `$${Math.round(v).toLocaleString()}`
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  )
}

function GoalsPanel({ goals, onSave, onCancel }) {
  const [draft, setDraft] = useState({ ...goals })

  function handleChange(key, raw) {
    const n = parseFloat(raw)
    setDraft((d) => ({ ...d, [key]: isNaN(n) ? d[key] : n }))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {GOAL_KEYS.map((key) => {
          const b = BENCHMARKS[key]
          return (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{b.label}</label>
              <input
                type="number"
                step="any"
                value={draft[key] ?? ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-blue-400"
              />
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={onCancel}
          className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1.5 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(draft)}
          className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition-colors"
        >
          Save Goals
        </button>
      </div>
    </div>
  )
}

export default function Dashboard({ analysis, goals, onGoalsChange, analyses, onSelectAnalysis, onNewUpload, onDeleteAnalysis }) {
  const a = analysis
  const [editingGoals, setEditingGoals] = useState(false)
  const [activeTab, setActiveTab] = useState('gauges')

  function handleSaveGoals(newGoals) {
    onGoalsChange(newGoals)
    setEditingGoals(false)
  }

  return (
    <div className="relative">
      <HistorySidebar
        analyses={analyses}
        currentId={a.id}
        onSelect={onSelectAnalysis}
        onNewUpload={onNewUpload}
        onDelete={onDeleteAnalysis}
      />

      <main className="min-h-[calc(100vh-3.5rem)] overflow-y-auto bg-gray-50">
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

          {/* Tab bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {['gauges', 'trends'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors capitalize ${
                    activeTab === tab
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'gauges' ? 'Performance Gauges' : 'Trends'}
                </button>
              ))}
            </div>

            {activeTab === 'gauges' && (
              <button
                onClick={() => setEditingGoals((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors bg-red-600 text-white border-red-600 hover:bg-red-500"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Adjust Goals
              </button>
            )}
          </div>

          {activeTab === 'gauges' && (
            <>
              {editingGoals && (
                <GoalsPanel
                  goals={goals}
                  onSave={handleSaveGoals}
                  onCancel={() => setEditingGoals(false)}
                />
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {GOAL_KEYS.map((key) => {
                  const b = BENCHMARKS[key]
                  const months = a.period_months || 1
                  const monthlyGoal = goals[key] ?? b.goal
                  const goalVal = b.perMonth ? monthlyGoal * months : monthlyGoal
                  const gaugeMax = b.perMonth ? b.gaugeMax * months : b.gaugeMax
                  const value = a[b.field ?? key]
                  return (
                    <Speedometer
                      key={key}
                      value={value}
                      goal={goalVal}
                      gaugeMax={gaugeMax}
                      label={b.label}
                      format={b.format}
                    />
                  )
                })}
              </div>
              <AnalysisDetails analysis={a} goals={goals} />
            </>
          )}

          {activeTab === 'trends' && (
            <TrendsTab analyses={analyses} goals={goals} />
          )}
        </div>
      </main>
    </div>
  )
}
