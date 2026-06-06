'use client'

import { useState } from 'react'
import { BENCHMARKS } from '@/lib/benchmarks'
import { COACHING_TIPS } from '@/lib/coachingTips'

// ─── Score helpers ────────────────────────────────────────────────────────────

const SCORE_METRICS = [
  { key: 'gross_profit_margin', label: 'GP Margin',    maxPts: 25 },
  { key: 'close_ratio',         label: 'Close Ratio',  maxPts: 20 },
  { key: 'effective_labor_rate',label: 'ELR',          maxPts: 20 },
  { key: 'labor_profit_pct',    label: 'Labor Profit', maxPts: 20 },
  { key: 'parts_profit_pct',    label: 'Parts Profit', maxPts: 15 },
]

function calcScore(a, goals) {
  let earned = 0
  let possible = 0
  const rows = SCORE_METRICS.map(({ key, label, maxPts }) => {
    const goal  = goals[key] ?? BENCHMARKS[key].goal
    const value = a[key]
    if (value == null) {
      return { label, maxPts, value, goal, earned: null, skipped: true }
    }
    const pts = Math.min(1, value / goal) * maxPts
    earned += pts
    possible += maxPts
    return { label, maxPts, value, goal, earned: pts, skipped: false }
  })
  // Pro-rate to 100 based only on available metrics
  const score = possible > 0 ? Math.round((earned / possible) * 100) : 0
  return { score, rows }
}

function letterGrade(score) {
  if (score >= 97) return 'A+'
  if (score >= 93) return 'A'
  if (score >= 90) return 'A-'
  if (score >= 87) return 'B+'
  if (score >= 83) return 'B'
  if (score >= 80) return 'B-'
  if (score >= 77) return 'C+'
  if (score >= 73) return 'C'
  if (score >= 70) return 'C-'
  if (score >= 67) return 'D+'
  return 'D'
}

function gradeColor(grade) {
  if (grade.startsWith('A')) return { text: 'text-green-600',  ring: 'ring-green-200',  bg: 'bg-green-50'  }
  if (grade.startsWith('B')) return { text: 'text-blue-600',   ring: 'ring-blue-200',   bg: 'bg-blue-50'   }
  if (grade.startsWith('C')) return { text: 'text-amber-500',  ring: 'ring-amber-200',  bg: 'bg-amber-50'  }
  return                             { text: 'text-red-500',    ring: 'ring-red-200',    bg: 'bg-red-50'    }
}

function industryBadge(gpMargin) {
  if (gpMargin == null) return null
  const { pmaAvg, pmaTop10 } = BENCHMARKS.gross_profit_margin
  if (gpMargin >= pmaTop10) return { label: 'Top 10% Industry',   cls: 'bg-cyan-50 text-cyan-700 border-cyan-200'  }
  if (gpMargin >= pmaAvg)   return { label: 'Above Industry Avg', cls: 'bg-green-50 text-green-700 border-green-200' }
  return                           { label: 'Below Industry Avg', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
}

// ─── Flag helpers ─────────────────────────────────────────────────────────────

// Flag severity mirrors gauge color zones:
//   critical = below 70% of goal
//   warning  = 70–99% of goal
//   none     = at or above goal
function flag(value, goal, tipKey, label, format) {
  if (value == null || value <= 0 || goal == null || goal <= 0) return null
  const ratio = value / goal
  if (ratio >= 1) return null
  const level = ratio < 0.70 ? 'critical' : 'warning'
  const pct   = Math.round(ratio * 100)
  return { level, tipKey, msg: `${label} at ${format(value)} — ${pct}% of your ${format(goal)} goal` }
}

function getFlags(a, goals) {
  const flags = []
  const g = (key) => goals[key] ?? BENCHMARKS[key]?.goal

  const f1 = flag(a.gross_profit_margin, g('gross_profit_margin'), 'gross_profit_margin', 'GP Margin',     (v) => `${v.toFixed(1)}%`)
  const f2 = flag(a.close_ratio,         g('close_ratio'),         'close_ratio',         'Close Ratio',   (v) => `${v.toFixed(1)}%`)
  const f3 = flag(a.effective_labor_rate,g('effective_labor_rate'),'effective_labor_rate','ELR',           (v) => `$${Math.round(v)}`)
  const f4 = flag(a.labor_profit_pct,    g('labor_profit_pct'),    'labor_profit_pct',    'Labor Profit',  (v) => `${v.toFixed(1)}%`)
  const f5 = flag(a.parts_profit_pct,    g('parts_profit_pct'),    'parts_profit_pct',    'Parts Profit',  (v) => `${v.toFixed(1)}%`)

  if (f1) flags.push(f1)
  if (f2) flags.push(f2)
  if (f3) flags.push(f3)
  if (f4) flags.push(f4)
  if (f5) flags.push(f5)

  if (a.total_discounts != null && a.gross_sales > 0) {
    const discPct = (a.total_discounts / a.gross_sales) * 100
    if (discPct > 4)
      flags.push({ level: 'warning', tipKey: null, msg: `Discounts at ${discPct.toFixed(1)}% of gross sales — above 4% threshold` })
  }
  return flags
}

// ─── Shared card shell ────────────────────────────────────────────────────────

function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
      {title && (
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">{title}</h3>
      )}
      {children}
    </div>
  )
}

// ─── 1. Performance Score ─────────────────────────────────────────────────────

function PerformanceScore({ analysis, goals }) {
  const { score, rows } = calcScore(analysis, goals)
  const grade = letterGrade(score)
  const colors = gradeColor(grade)
  const badge = industryBadge(analysis.gross_profit_margin)

  return (
    <Card title="Performance Score">
      <div className="flex items-center gap-4 mb-5">
        <div className={`w-20 h-20 rounded-full ring-4 ${colors.ring} ${colors.bg} flex flex-col items-center justify-center shrink-0`}>
          <span className={`text-3xl font-black leading-none ${colors.text}`}>{grade}</span>
          <span className="text-xs text-gray-400 mt-0.5">{score}/100</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Overall Score</p>
          <p className="text-2xl font-black text-gray-900">{score} <span className="text-base font-normal text-gray-400">/ 100</span></p>
          {badge && (
            <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.cls}`}>
              {badge.label}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {rows.map(({ label, maxPts, earned, skipped }) => {
          if (skipped) {
            return (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                  <span>{label}</span>
                  <span className="italic">N/A — not in report</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full" />
              </div>
            )
          }
          const pct = maxPts > 0 ? (earned / maxPts) * 100 : 0
          const barColor = pct >= 100 ? 'bg-green-400' : pct >= 85 ? 'bg-amber-400' : pct >= 70 ? 'bg-orange-400' : 'bg-red-400'
          return (
            <div key={label}>
              <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                <span>{label}</span>
                <span className="font-medium text-gray-700">{Math.round(earned)}/{maxPts} pts</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── 2. Coaching Flags ────────────────────────────────────────────────────────

function FlagCard({ flag }) {
  const [open, setOpen] = useState(false)
  const isCritical = flag.level === 'critical'
  const tips = flag.tipKey ? COACHING_TIPS[flag.tipKey] : null

  const bg      = isCritical ? 'bg-red-50 border-red-100'   : 'bg-amber-50 border-amber-100'
  const headClr = isCritical ? 'text-red-700'               : 'text-amber-700'
  const badge   = isCritical ? 'CRITICAL'                   : 'WARNING'
  const icon    = isCritical ? '🔴'                         : '🟡'

  return (
    <div className={`border rounded-xl overflow-hidden ${bg}`}>
      {/* Header row */}
      <button
        className="w-full flex items-start gap-2 px-3 py-2.5 text-left"
        onClick={() => tips && setOpen(v => !v)}
      >
        <span className="text-base leading-snug shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-bold uppercase tracking-wide ${headClr}`}>{badge} — </span>
          <span className={`text-xs ${headClr}`}>{flag.msg}</span>
        </div>
        {tips && (
          <svg
            className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${headClr} ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Expanded coaching content */}
      {open && tips && (
        <div className={`px-4 pb-4 pt-1 border-t ${isCritical ? 'border-red-100' : 'border-amber-100'}`}>
          {/* Why it matters */}
          <p className={`text-xs italic mb-3 ${headClr} opacity-80`}>{tips.why}</p>

          {/* Common causes */}
          <p className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${headClr}`}>Common Causes</p>
          <ul className="space-y-1 mb-3">
            {tips.causes.map((c, i) => (
              <li key={i} className={`text-xs flex gap-1.5 ${headClr}`}>
                <span className="shrink-0 mt-0.5">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>

          {/* Action steps */}
          <p className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${headClr}`}>Action Steps</p>
          <ul className="space-y-1 mb-3">
            {tips.tips.map((t, i) => (
              <li key={i} className={`text-xs flex gap-1.5 ${headClr}`}>
                <span className="shrink-0 font-bold">{i + 1}.</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>

          {/* Quick win */}
          <div className={`rounded-lg px-3 py-2 ${isCritical ? 'bg-red-100' : 'bg-amber-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wide mb-0.5 ${headClr}`}>⚡ Quick Win</p>
            <p className={`text-xs ${headClr}`}>{tips.quickWin}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function CoachingFlags({ analysis, goals }) {
  const flags = getFlags(analysis, goals)
  const criticals = flags.filter((f) => f.level === 'critical')
  const warnings  = flags.filter((f) => f.level === 'warning')

  return (
    <Card title="Coaching Flags">
      {flags.length === 0 ? (
        <div className="flex items-center gap-2 text-green-600">
          <span className="text-xl">✅</span>
          <span className="font-semibold text-sm">No Red Flags — looking strong!</span>
        </div>
      ) : (
        <div className="space-y-2">
          {[...criticals, ...warnings].map((f, i) => (
            <FlagCard key={i} flag={f} />
          ))}
          <p className="text-xs text-gray-400 pt-1">Tap any flag to see coaching tips.</p>
        </div>
      )}
    </Card>
  )
}

// ─── 3. Money Left on the Table ───────────────────────────────────────────────

const INDUSTRY_DISC_AVG = 2.2 // percent

function MoneyLeftOnTable({ analysis }) {
  const { total_discounts: discounts, gross_sales } = analysis
  if (discounts == null || !gross_sales) {
    return (
      <Card title="Money Left on the Table">
        <p className="text-xs text-gray-400">Discount data not available in this report.</p>
      </Card>
    )
  }

  const discPct   = (discounts / gross_sales) * 100
  const delta     = discPct - INDUSTRY_DISC_AVG
  const excess    = Math.max(0, (delta / 100) * gross_sales)
  const isAbove   = delta > 0

  return (
    <Card title="Money Left on the Table">
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-3xl font-black text-gray-900">${Math.round(discounts).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total discounts given</p>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold ${isAbove ? 'text-red-500' : 'text-green-500'}`}>
            {discPct.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400">of gross sales</p>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between py-1.5 border-b border-gray-50">
          <span className="text-gray-500">Your discount rate</span>
          <span className="font-semibold text-gray-800">{discPct.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-gray-50">
          <span className="text-gray-500">Industry avg discount rate</span>
          <span className="font-semibold text-gray-800">{INDUSTRY_DISC_AVG}%</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span className={`font-semibold ${isAbove ? 'text-red-600' : 'text-green-600'}`}>
            {isAbove ? `Excess discounting (${delta.toFixed(1)}% above avg)` : `Below avg discounting — great!`}
          </span>
          {isAbove && (
            <span className="font-bold text-red-600">−${Math.round(excess).toLocaleString()}</span>
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── 4. Labor vs Parts Split ──────────────────────────────────────────────────

function LaborPartsSplit({ analysis }) {
  const { labor_sales, parts_sales } = analysis
  if (labor_sales == null && parts_sales == null) {
    return (
      <Card title="Labor vs Parts Split">
        <p className="text-xs text-gray-400">Labor/parts sales data not available in this report.</p>
      </Card>
    )
  }

  const lv = labor_sales ?? 0
  const pv = parts_sales ?? 0
  const total = lv + pv
  if (total === 0) return null

  const laborPct = (lv / total) * 100
  const partsPct = (pv / total) * 100

  const laborHealthy = laborPct >= 55 && laborPct <= 60
  const partsHealthy = partsPct >= 40 && partsPct <= 45

  return (
    <Card title="Labor vs Parts Split">
      <div className="mb-3">
        <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
          <span>Labor {laborPct.toFixed(1)}%</span>
          <span>Parts {partsPct.toFixed(1)}%</span>
        </div>
        <div className="flex h-6 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-700"
            style={{ width: `${laborPct}%` }}
          >
            {laborPct >= 20 && `${laborPct.toFixed(0)}%`}
          </div>
          <div
            className="bg-emerald-400 flex items-center justify-center text-white text-xs font-bold transition-all duration-700"
            style={{ width: `${partsPct}%` }}
          >
            {partsPct >= 20 && `${partsPct.toFixed(0)}%`}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>${Math.round(lv).toLocaleString()}</span>
          <span>${Math.round(pv).toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Chip ok={laborHealthy} label="Labor" target="55–60%" />
        <Chip ok={partsHealthy} label="Parts"  target="40–45%" />
      </div>
      <p className="text-xs text-gray-400 mt-2">Healthy target: 55–60% labor / 40–45% parts of combined revenue</p>
    </Card>
  )
}

function Chip({ ok, label, target }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium
      ${ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
      {ok ? '✓' : '!'} {label}: {target}
    </span>
  )
}

// ─── 5. Detail panels ─────────────────────────────────────────────────────────

function BenchmarkRow({ label, value, avg, top, format }) {
  const fmt = format ?? ((v) => v != null ? String(Math.round(v)) : '—')
  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="py-2 text-xs text-gray-600 pr-3 font-medium">{label}</td>
      <td className="py-2 text-xs font-bold text-gray-900 text-right pr-3">
        {value != null ? fmt(value) : <span className="text-gray-300">—</span>}
      </td>
      {avg != null && (
        <td className="py-2 text-xs text-amber-600 text-right pr-3">{fmt(avg)}</td>
      )}
      {top != null && (
        <td className="py-2 text-xs text-cyan-600 text-right">{fmt(top)}</td>
      )}
    </tr>
  )
}

function DetailTable({ rows, hasAvg = true }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="pb-1.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Metric</th>
          <th className="pb-1.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wide pr-3">You</th>
          {hasAvg && <th className="pb-1.5 text-right text-xs font-bold text-amber-400 uppercase tracking-wide pr-3">PMA Avg</th>}
          {hasAvg && <th className="pb-1.5 text-right text-xs font-bold text-cyan-500 uppercase tracking-wide">Top 10%</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <BenchmarkRow key={r.label} {...r} />
        ))}
      </tbody>
    </table>
  )
}

function LaborPanel({ a }) {
  const fmtMoney = (v) => v != null ? `$${Math.round(v).toLocaleString()}` : '—'
  const fmtPct   = (v) => v != null ? `${v.toFixed(1)}%` : '—'
  const fmtELR   = (v) => v != null ? `$${Math.round(v)}` : '—'

  return (
    <Card title="Labor Performance">
      <DetailTable rows={[
        { label: 'Sales',         value: a.labor_sales,         format: fmtMoney },
        { label: 'Gross Profit',  value: a.labor_profit,        format: fmtMoney },
        { label: 'Profit %',      value: a.labor_profit_pct,    avg: 59.3,  top: 65.9,  format: fmtPct   },
        { label: 'ELR',           value: a.effective_labor_rate, avg: 165,   top: 163,   format: fmtELR   },
        { label: 'Hours Sold',    value: a.hours_sold,           format: (v) => Math.round(v) },
        { label: 'Hours Presented', value: a.hours_presented,   format: (v) => Math.round(v) },
      ]} />
    </Card>
  )
}

function PartsPanel({ a }) {
  const fmtMoney = (v) => v != null ? `$${Math.round(v).toLocaleString()}` : '—'
  const fmtPct   = (v) => v != null ? `${v.toFixed(1)}%` : '—'

  return (
    <Card title="Parts Performance">
      <DetailTable rows={[
        { label: 'Sales',        value: a.parts_sales,     format: fmtMoney },
        { label: 'Gross Profit', value: a.parts_profit,    format: fmtMoney },
        { label: 'Profit %',     value: a.parts_profit_pct, avg: 46.1, top: 47.8, format: fmtPct },
        { label: 'Fees Collected', value: a.total_fees,    format: fmtMoney },
      ]} />
    </Card>
  )
}

function ShopSummaryPanel({ a }) {
  const fmtMoney = (v) => v != null ? `$${Math.round(v).toLocaleString()}` : '—'
  const fmtPct   = (v) => v != null ? `${v.toFixed(1)}%` : '—'
  const months   = a.period_months || 1

  return (
    <Card title="Shop Summary">
      <DetailTable rows={[
        { label: 'Car Count',    value: a.total_ros,              avg: Math.round(264 * months),   top: Math.round(275 * months),   format: (v) => Math.round(v).toString() },
        { label: 'Avg Ticket',   value: a.avg_ticket,             avg: 702,   top: 729,   format: fmtMoney },
        { label: 'GP / Hour',    value: a.gross_profit_per_hour,  avg: 171,   top: 200,   format: fmtMoney },
        { label: 'GP Margin',    value: a.gross_profit_margin,    avg: 52.3,  top: 57.4,  format: fmtPct  },
        { label: 'Close Ratio',  value: a.close_ratio,            avg: 47.6,  top: 59.3,  format: fmtPct  },
      ]} />
    </Card>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AnalysisDetails({ analysis, goals }) {
  const a = analysis

  return (
    <div className="space-y-6 mt-6">
      {/* Row 1: Score + Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PerformanceScore analysis={a} goals={goals} />
        <CoachingFlags analysis={a} goals={goals} />
      </div>

      {/* Row 2: Money Left + Labor/Parts Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MoneyLeftOnTable analysis={a} />
        <LaborPartsSplit analysis={a} />
      </div>

      {/* Row 3: Detail panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <LaborPanel a={a} />
        <PartsPanel a={a} />
        <ShopSummaryPanel a={a} />
      </div>
    </div>
  )
}
